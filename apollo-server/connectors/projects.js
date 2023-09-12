const path = require('path')
const fs = require('fs')
const hash = require('hash-sum')
const { remove: removeDir, pathExists: exists } = require('fs-extra')
const _ = require('lodash')
const { defaults } = require('@vue/cli/lib/options')
const { execa } = require('@vue/cli-shared-utils')
// Connectors
const git = require('./git')
const progress = require('./progress')
const cwd = require('./cwd')
const prompts = require('./prompts')
const folders = require('./folders')
const locales = require('./locales')
const logs = require('./logs')
// Context
const getContext = require('../context')
// Utils
const { log } = require('../util/logger')
const { notify } = require('../util/notification')
const { installDeps } = require('../util/install-deps')

/* const PROGRESS_ID = 'project-create' */

/* let lastProject = null
let currentProject = null
let creator = null
let presets = []
let features = []
let onCreationEvent = null
let onInstallProgress = null
let onInstallLog = null */
let cache = {
  total: 0,
  totalPages: 0,
  data: [],
  cacheNeedsRefresh: true
}

function list(context, root, args) {

  const pageNumber = args.skip || 1 // 默认显示第一页
  const pageSize = args.limit || 50 // 默认每页显示 50 条数据
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = pageNumber * pageSize

  let rows = []
  // 先判断是否需要更新缓存，需要就更新，不需要就从缓存拿
  if (cache.cacheNeedsRefresh || cache.data.length === 0) {
    let projects = context.db.get('projects').value()
    cache.data = autoClean(projects, context)
    cache.cacheNeedsRefresh = false
  }

  // 去重
  /* cache.data = _.uniqBy(cache.data, 'id'); */

  refreshCacheInfo(cache.data, pageSize)
  rows = cache.data.slice(startIndex, endIndex)
  return {
    total: cache.totalPages,
    data: rows,
    allData: cache.data
  }

  /* console.log(args);
  let projects = context.db.get('projects').value()
  projects = autoClean(projects, context)
  console.log(projects);
  return projects */
}

function refreshCacheInfo(data, pageSize) {
  let totalLen = data.length
  let totalPages = Math.ceil(totalLen / pageSize)
  cache.total = totalLen
  cache.totalPages = totalPages
}

function findOne(id, context) {
  return context.db.get('projects').find({ id }).value()
}

function findByPath(file, context) {
  return context.db.get('projects').find({ path: file }).value()
}

function autoClean(projects, context) {
  const result = []
  for (const project of projects) {
    if (fs.existsSync(project.path)) {
      result.push(project)
    }
  }
  if (result.length !== projects.length) {
    console.log(`Auto cleaned ${projects.length - result.length} projects (folder not found).`)
    context.db.set('projects', result).write()
  }
  return result
}

function getCurrent(id, context) {
  const currentProject = context.db.get('projects').find({ id }).value()
  if (currentProject && !fs.existsSync(currentProject.path)) {
    log('Project folder not found', currentProject.id, currentProject.path)
    return null
  }

  return currentProject
}


function getLast(context) {
  // return lastProject
}

function generatePresetDescription(preset) {
  let description = `[Vue ${preset.raw.vueVersion || 2}] `

  description += preset.features.join(', ')
  if (preset.raw.useConfigFiles) {
    description += ' (Use config files)'
  }
  return description
}

function generateProjectCreation(creator) {
  return {
    presets,
    features,
    prompts: prompts.list()
  }
}

async function initCreator(context) {

}

function removeCreator(context) {

}

async function getCreation(context) {

}

async function updatePromptsFeatures() {
  await prompts.changeAnswers(answers => {
    answers.features = features.filter(
      f => f.enabled
    ).map(
      f => f.id
    )
  })
}

async function setFeatureEnabled({ id, enabled, updatePrompts = true }, context) {
  const feature = features.find(f => f.id === id)
  if (feature) {
    feature.enabled = enabled
  } else {
    console.warn(`Feature '${id}' not found`)
  }
  if (updatePrompts) await updatePromptsFeatures()
  return feature
}

async function applyPreset(id, context) {
  const preset = presets.find(p => p.id === id)
  if (preset) {
    for (const feature of features) {
      feature.enabled = !!(
        preset.features.includes(feature.id) ||
        (feature.plugins && preset.features.some(f => feature.plugins.includes(f)))
      )
    }
    if (preset.raw) {
      if (preset.raw.router) {
        await setFeatureEnabled({ id: 'router', enabled: true, updatePrompts: false }, context)
      }
      if (preset.raw.vuex) {
        await setFeatureEnabled({ id: 'vuex', enabled: true, updatePrompts: false }, context)
      }
      if (preset.raw.cssPreprocessor) {
        await setFeatureEnabled({ id: 'css-preprocessor', enabled: true, updatePrompts: false }, context)
      }
      if (preset.raw.useConfigFiles) {
        await setFeatureEnabled({ id: 'use-config-files', enabled: true, updatePrompts: false }, context)
      }
    }
    await updatePromptsFeatures()
  } else {
    console.warn(`Preset '${id}' not found`)
  }

  return generateProjectCreation(creator)
}

async function create(input, context) {
  return progress.wrap(PROGRESS_ID, context, async setProgress => {
    setProgress({
      status: 'creating'
    })

    const targetDir = path.join(cwd.get(), input.folder)

    cwd.set(targetDir, context)
    creator.context = targetDir

    const inCurrent = input.folder === '.'
    const name = creator.name = (inCurrent ? path.relative('../', process.cwd()) : input.folder)

    // Answers
    const answers = prompts.getAnswers()
    await prompts.reset()

    // Config files
    let index
    if ((index = answers.features.indexOf('use-config-files')) !== -1) {
      answers.features.splice(index, 1)
      answers.useConfigFiles = 'files'
    }

    // Preset
    answers.preset = input.preset
    if (input.save) {
      answers.save = true
      answers.saveName = input.save
    }

    setProgress({
      info: 'Resolving preset...'
    })
    let preset
    if (input.preset === '__remote__' && input.remote) {
      // vue create foo --preset bar
      preset = await creator.resolvePreset(input.remote, input.clone)
    } else if (input.preset === 'default') {
      // vue create foo --default
      preset = defaults.presets.default
    } else {
      preset = await creator.promptAndResolvePreset(answers)
    }
    setProgress({
      info: null
    })

    // Create
    const args = [
      '--skipGetStarted'
    ]
    if (input.packageManager) args.push('--packageManager', input.packageManager)
    if (input.bar) args.push('--bare')
    if (input.force) args.push('--force')
    // Git
    if (input.enableGit && input.gitCommitMessage) {
      args.push('--git', input.gitCommitMessage)
    } else if (!input.enableGit) {
      args.push('--no-git')
    }
    // Preset
    args.push('--inlinePreset', JSON.stringify(preset))

    log('create', name, args)

    const child = execa('vue', [
      'create',
      name,
      ...args
    ], {
      cwd: cwd.get(),
      stdio: ['inherit', 'pipe', 'inherit']
    })

    const onData = buffer => {
      const text = buffer.toString().trim()
      if (text) {
        setProgress({
          info: text
        })
        logs.add({
          type: 'info',
          message: text
        }, context)
      }
    }

    child.stdout.on('data', onData)

    await child

    removeCreator()

    notify({
      title: 'Project created',
      message: `Project ${cwd.get()} created`,
      icon: 'done'
    })

    return importProject({
      path: targetDir
    }, context)
  })
}

async function importProject({ repo }, context) {
  if (context.db.get('projects').find({ repo }).value()) {
    return new Error(`${repo} already exists`)
  }

  return progress.wrap(repo, context, async setProgress => {
    setProgress({
      status: 'creating'
    })

    const id = hash(repo)
    const dir = path.join(context.homedir, id)

    if (await exists(dir)) {
      await removeDir(dir)
    }

    const project = {
      id,
      repo,
      path: dir,
      creator: context.auth['openid.sreg.nickname']
    }

    setProgress({
      status: 'git-init'
    })
    await git.clone(repo, dir, context)

    if (!await exists(path.join(dir, 'package.json'))) {
      return new Error(`lack of file: package.json`)
    }

    if (!await exists(path.join(dir, 'ewan.config.js'))) {
      return new Error(`lack of file: ewan.config.js`)
    }

    if (await exists(path.join(dir, 'package-lock.json'))) {
      return new Error(`invalid file: package-lock.json`)
    }

    setProgress({
      status: 'plugins-install'
    })
    await installDeps(dir, 'yarn')

    notify({
      title: `Project created`,
      message: `Project ${repo} created`,
      icon: 'done'
    })

    const packageData = folders.readPackage(dir, context)
    project.name = packageData.name

    context.db.get('projects').push(project).write()
    // 更新缓存
    cache.data.push(project)

    return open(project.id, context)
  })
}

async function open(id, context) {
  const project = findOne(id, context)
  if (!project) {
    log('Project not found', id)
    return null
  }

  if (!fs.existsSync(project.path)) {
    log('Project folder not found', id, project.path)
    return null
  }

  // cwd.set(project.path, context)
  // Reset locales
  locales.reset(context)
  // Load plugins
  // await plugins.list(project.path, context)

  // Date
  context.db.get('projects').find({ id }).assign({
    openDate: Date.now()
  }).write()
  // 更新缓存openDate日期
  for (let i = 0, len = cache.data.length; i < len; i++) {
    if (cache.data[i].id === id) {
      cache.data[i] = project
      break
    }
  }

  log('Project open', id, project.path)

  return project
}

async function remove(id, context) {
  await removeDir(context.db.get('projects').find({ id }).value().path)
  context.db.get('projects').remove({ id }).write()

  // 移除缓存
  let cacheData = cache.data
  for (let i = 0, len = cacheData.length; i < len; i++) {
    const element = cacheData[i];
    if (element.id === id) {
      cacheData.splice(i, 1)
      break
    }
  }

  return true
}

function resetCwd(context) {
  if (currentProject) {
    cwd.set(currentProject.path, context)
  }
}

function setFavorite({ id, favorite }, context) {
  context.db.get('projects').find({ id }).assign({ favorite }).write()
  return findOne(id, context)
}

function rename({ id, name }, context) {
  context.db.get('projects').find({ id }).assign({ name }).write()
  return findOne(id, context)
}

function getType(project, context) {
  return git.isSvnProject(project.repo) ? 'svn' : 'git'
}

function getHomepage(project, context) {

}

// Open last project
async function autoOpenLastProject() {
  const context = getContext()
  const id = context.db.get('config.lastOpenProject').value()
  if (id) {
    try {
      await open(id, context)
    } catch (e) {
      log('Project can\'t be auto-opened', id)
    }
  }
}

async function refresh(id, context) {
  const project = context.db.get('projects').find({ id }).value()
  if (!project) return false
  await git.pull(project.repo, project.path)
  await git.prune(project.repo, project.path)
  return true
}

autoOpenLastProject()

module.exports = {
  list,
  findOne,
  findByPath,
  getCurrent,
  getLast,
  getCreation,
  applyPreset,
  setFeatureEnabled,
  create,
  import: importProject,
  open,
  remove,
  resetCwd,
  setFavorite,
  rename,
  initCreator,
  removeCreator,
  getType,
  getHomepage,
  refresh
}
