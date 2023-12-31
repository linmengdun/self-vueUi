import Vue from 'vue'
import Router from 'vue-router'
import db from './util/db'
import { apolloClient } from './vue-apollo'

import ProjectHome from '@/components/app/ProjectHome.vue'

/* import ProjectDashboard from './components/dashboard/ProjectDashboard.vue'
import ProjectPlugins from './components/plugin/ProjectPlugins.vue' */
/* import ProjectPluginsAdd from './components/plugin/ProjectPluginsAdd.vue' */
/* import ProjectConfigurations from './components/configuration/ProjectConfigurations.vue' */
/* import ProjectConfigurationDetails from './components/configuration/ProjectConfigurationDetails.vue' */
import ProjectTasks from './views/ProjectTasks.vue'
import ProjectTaskDetails from './views/ProjectTaskDetails.vue'
import ProjectDependencies from './views/ProjectDependencies.vue'

import ProjectSelect from './views/ProjectSelect.vue'
/* import ProjectCreate from './components/project-create/ProjectCreate.vue' */

import FileDiffView from './components/file-diff/FileDiffView.vue'

/* import About from './components/app/About.vue' */
import NotFound from './views/NotFound.vue'

import Login from './components/login/index.vue'

import PROJECT_CURRENT from './graphql/project/projectCurrent.gql'
import CURRENT_PROJECT_ID_SET from './graphql/project/currentProjectIdSet.gql'

Vue.use(Router)
/* eslint-disable */
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: ProjectHome,
      meta: {
        needProject: true,
        restore: true
      },
      children: [
        {
          path: '',
          name: 'project-home',
          redirect: { name: 'project-tasks' }
        },
        /* {
          path: 'dashboard',
          name: 'project-dashboard',
          component: ProjectDashboard
        },
        {
          path: 'plugins',
          name: 'project-plugins',
          component: ProjectPlugins
        },
        {
          path: 'plugins/add',
          name: 'project-plugins-add',
          component: ProjectPluginsAdd
        },
        {
          path: 'configuration',
          name: 'project-configurations',
          component: ProjectConfigurations,
          children: [
            {
              path: ':id',
              name: 'project-configuration-details',
              component: ProjectConfigurationDetails,
              props: true
            }
          ]
        }, */
        {
          path: 'tasks',
          name: 'project-tasks',
          component: ProjectTasks,
          children: [
            {
              path: ':id',
              name: 'project-task-details',
              component: ProjectTaskDetails,
              props: true
            }
          ]
        },
        {
          path: 'dependencies',
          name: 'project-dependencies',
          component: ProjectDependencies
        }
      ]
    },
    {
      path: '/project/select',
      name: 'project-select',
      component: ProjectSelect,
      meta: {
        restore: true
      }
    },
    /*  {
       path: '/project/create',
       name: 'project-create',
       component: ProjectCreate
     }, */
    {
      path: '/file-diff',
      name: 'file-diff',
      component: FileDiffView
    },
    /* {
      path: '/about',
      name: 'about',
      component: About
    }, */
    {
      path: '/home',
      name: 'home',
      redirect: { name: 'project-home' }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(m => m.meta.needProject)) {
    const result = await apolloClient.query({
      query: PROJECT_CURRENT,
      fetchPolicy: 'network-only',
      variables: {
        id: db.get('config.lastOpenProject').value()
      }
    })
    if (!result.data.projectCurrent) {
      next({ name: 'project-select' })
      return
    } else {
      await apolloClient.mutate({
        mutation: CURRENT_PROJECT_ID_SET,
        variables: {
          projectId: result.data.projectCurrent.id
        }
      })
    }
  }
  next()
})

router.afterEach((to, from) => {
  if (to.matched.some(m => m.meta.restore)) {
    localStorage.setItem('vue-cli-ui.lastRoute', to.fullPath)
  } else {
    localStorage.removeItem('vue-cli-ui.lastRoute')
  }
})

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router
