<template>
  <div class="project-dependencies page">
    <ContentView :title="$t('org.vue.views.project-dependencies.title')" class="limit-width">
      <template slot="actions">
        <VueInput v-model="search" icon-left="search" class="round" />

        <VueButton icon-left="file_download" :label="$t('org.vue.views.project-dependencies.actions.update-all')"
          class="primary round" @click="updateAll()" />
      </template>

      <ApolloQuery :query="require('../graphql/dependency/dependencies.gql')" :variables="{
        projectId: currentProjectId,
        forceRerender: forceRerender
      }">
        <template slot-scope="{ result: { data, loading } }">
          <VueLoadingIndicator v-if="loading && (!data || !data.dependencies)" class="overlay" />

          <ListFilter v-else-if="data && data.dependencies" :list="data.dependencies"
            :filter="item => !search || item.id.includes(search)">
            <template slot-scope="{ list }">
              <ListFilter v-for="type of ['dependencies', 'devDependencies']" :key="type" :list="list"
                :filter="item => item.type === type">
                <template slot-scope="{ list }" v-if="list.length">
                  <div class="cta-text">{{ $t(`org.vue.views.project-dependencies.heading.${type}`) }}</div>
                  <ListSort :list="list" :compare="(a, b) => a.id.localeCompare(b.id)">
                    <template slot-scope="{ list }">
                      <ProjectDependencyItem v-for="dependency of list" :key="dependency.id" :dependency="dependency"
                        @uninstall="openConfirmUninstall(dependency.id)" />
                    </template>
                  </ListSort>
                </template>
              </ListFilter>
            </template>
          </ListFilter>
        </template>
      </ApolloQuery>
    </ContentView>

    <VueModal v-if="showInstallModal" :title="$t('org.vue.views.project-dependencies.install.title')"
      class="install-modal" @close="showInstallModal = false">
      <div class="default-body">
        <div class="install-options">
          <VueGroup v-model="installType" class="inline">
            <VueGroupButton v-for="type of ['dependencies', 'devDependencies']" :key="type" :value="type">
              {{ $t(`org.vue.views.project-dependencies.heading.${type}`) }}
            </VueGroupButton>
          </VueGroup>
        </div>

        <NpmPackageSearch filters="NOT computedKeywords:vue-cli-plugin" class="package-search"
          @close="showInstallModal = false" @install="installPlugin" />
      </div>
    </VueModal>

    <VueModal v-if="showUninstallModal" :title="$t('org.vue.views.project-dependencies.uninstall.title')" class="small"
      @close="showUninstallModal = false">
      <div class="default-body">
        {{ $t('org.vue.views.project-dependencies.uninstall.body', { id: selectedId }) }}
      </div>

      <div slot="footer" class="actions space-between">
        <VueButton :label="$t('org.vue.views.project-dependencies.uninstall.cancel')" class="flat"
          @click="showUninstallModal = false" />

        <VueButton :label="$t('org.vue.views.project-dependencies.uninstall.uninstall', { id: selectedId })"
          icon-left="delete_forever" class="danger" @click="uninstallPlugin(selectedId)" />
      </div>
    </VueModal>

    <ProgressScreen :progress-id="`dependency-installation${currentProjectId}`" />
  </div>
</template>

<script>
import CurrentProject from '../mixins/CurrentProject'

import DEPENDENCIES from '../graphql/dependency/dependencies.gql'
import DEPENDENCY_INSTALL from '../graphql/dependency/dependencyInstall.gql'
import DEPENDENCY_UNINSTALL from '../graphql/dependency/dependencyUninstall.gql'
import DEPENDENCIES_UPDATE from '../graphql/dependency/dependenciesUpdate.gql'
import { Loading } from 'element-ui'

/* eslint-disable */
export default {
  mixins: [
    CurrentProject
  ],

  data() {
    return {
      showInstallModal: false,
      installType: 'dependencies',
      selectedId: null,
      showUninstallModal: false,
      search: '',
      forceRerender: 0,
    }
  },

  methods: {
    async updateAll() {
      const variables = {
        projectId: this.currentProjectId
      }
      await this.$apollo.mutate({
        mutation: DEPENDENCIES_UPDATE,
        variables,
      })
    },

    async installPlugin(id) {
      await this.$apollo.mutate({
        mutation: DEPENDENCY_INSTALL,
        variables: {
          input: {
            id,
            type: this.installType
          }
        },
        update: (store, { data: { dependencyInstall } }) => {
          const data = store.readQuery({ query: DEPENDENCIES })
          data.dependencies.push(dependencyInstall)
          store.writeQuery({ query: DEPENDENCIES, data })
        }
      })

      this.showInstallModal = false
    },

    openConfirmUninstall(id) {
      this.selectedId = id
      this.showUninstallModal = true
    },

    async uninstallPlugin(id) {
      this.showUninstallModal = false

      const loadingInstance = Loading.service({ fullscreen: true, background: 'rgba(0,0,0,0.5)', text: '卸载中...' });

      await this.$apollo.mutate({
        mutation: DEPENDENCY_UNINSTALL,
        variables: {
          input: {
            id
          }
        }
      })
      // 通过这种方式重新触发数据更新，其他update方式不生效，有可能是因为内部被我们重写的缘故
      this.forceRerender += 1;

      loadingInstance.close();
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-dependencies
  .content-view /deep/ > .content
    overflow-y auto

.install-modal >>> .shell
  width 80vw
  max-width 1200px

.install-options
  h-box()
  box-center()
  margin-bottom $padding-item

.package-search
  height 70vh
</style>
