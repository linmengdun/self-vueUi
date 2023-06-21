import './plugins'
import './register-components'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { apolloProvider } from './vue-apollo'
import ClientAddonApi from './util/ClientAddonApi'
import gql from 'graphql-tag'
import { Pagination } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

window.gql = gql

Vue.config.productionTip = false
Vue.config.devtools = true

// For client addons
window.Vue = Vue
window.ClientAddonApi = new ClientAddonApi()

Vue.use(Pagination)

const app = new Vue({
  provide: apolloProvider.provide(),
  router,
  i18n,
  ...App
})

/* eslint-disable */
async function start() {
  app.$mount('#app')

  // Restore last route
  const lastRoute = localStorage.getItem('vue-cli-ui.lastRoute')
  if (lastRoute) {
    router.push(lastRoute)
  }
}

start()