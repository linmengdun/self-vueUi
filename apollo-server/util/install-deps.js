const { readPackage } = require('../connectors/folders')
const { installDeps: vueInstallDeps } = require('./installPlugin')

function shouldUseCCRegistry(targetDir) {
  const {
    dependencies = {},
    devDependencies = {}
  } = readPackage(targetDir)
  const deps = Object.keys(dependencies).concat(Object.keys(devDependencies))

  // 判断是否包含 @egame 的模块
  return deps.some(dep => dep.indexOf('@egame') === 0)
}

exports.installDeps = async function installDeps(targetDir, command) {
  let registry

  if (shouldUseCCRegistry(targetDir)) {
    registry = 'https://cnpm.ewan.cn/setconfig'
  }

  return vueInstallDeps(targetDir, command, registry)
}
