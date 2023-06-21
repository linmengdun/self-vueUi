<template>
  <div class="project-select page">
    <StepWizard :tab-id.sync="tab"
      :title="$route.query.hideTabs ? $t('org.vue.views.project-create.title') : $t('org.vue.views.project-select.title')"
      :hide-tabs="hideTabs" class="frame">
      <VueTab id="existing" :label="$t('org.vue.views.project-select.tabs.projects')" icon="storage" class="select">
        <ProjectSelectList />
      </VueTab>

      <VueTab id="import" :label="$t('org.vue.views.project-select.tabs.import')" icon="unarchive" class="import">
        <div class="project-import">
          <VueFormField title="URL" subtitle="Git/Svn 仓库地址. 输入前缀如 'git@devgit' 或 'https://svn-cc'.">
            <VueInput v-model="repo"
              :placeholder="$t('org.vue.views.project-create.tabs.details.form.folder.placeholder')" icon-left="language"
              class="big app-name" />
          </VueFormField>
        </div>

        <div class="actions-bar center">
          <VueButton icon-left="add" :disabled="!repoValid"
            :label="$route.query.hideTabs ? $t('org.vue.views.project-create.tabs.details.form.folder.action') : $t('org.vue.views.project-select.buttons.create')"
            class="big primary create-project" @click="importProject()" />
        </div>
      </VueTab>
    </StepWizard>

    <div class="top-menu left">
      <VueButton v-if="projectCurrent" :to="{ name: 'home' }" class="flat icon-button" icon-left="arrow_back" />
    </div>

    <VueModal v-if="showNoModulesModal" :title="$t('org.vue.views.project-select.import.no-modules.title')"
      class="small no-modules-modal" @close="showNoModulesModal = false">
      <div class="default-body">
        <div class="message">{{ showNoModulesModal }}</div>
      </div>

      <div slot="footer" class="actions">
        <VueButton class="primary big" label="我知道了" @click="showNoModulesModal = false" />
      </div>
    </VueModal>

    <ProgressScreen :progress-id="repo" :debug="debug" />
  </div>
</template>

<script>
import Lowdb from '@/mixins/Lowdb'
import CurrentProject from '../mixins/CurrentProject'

import FOLDER_CURRENT from '@/graphql/folder/folderCurrent.gql'
import PROJECT_INIT_CREATION from '@/graphql/project/projectInitCreation.gql'
import PROJECT_IMPORT from '@/graphql/project/projectImport.gql'
/* eslint-disable */
function formDataFactory() {
  return {
    repo: ''
  }
}

const formData = formDataFactory()

export default {
  name: 'ProjectSelect',

  mixins: [
    Lowdb,
    CurrentProject
  ],

  metaInfo() {
    return {
      title: this.$t('org.vue.views.project-select.title')
    }
  },

  data() {
    return {
      formData,
      folderCurrent: {},
      tab: undefined,
      hideTabs: !!this.$route.query.hideTabs,
      showNoModulesModal: false,
      busy: false,
      debug: ''
    }
  },

  apollo: {
    folderCurrent: FOLDER_CURRENT
  },

  mounted() {
    // Fix issue with Firefox
    setTimeout(() => {
      this.tab = this.$route.query.tab || 'existing'
    })
  },

  computed: {
    repoValid() {
      const url = this.repo
      return url && /^(git@|https:)/.test(url)
    },
    repo: {
      get() {
        return this.formData.repo
      },
      set(newValue) {
        this.formData.repo = newValue
      }
    }
  },

  methods: {
    async createProject() {
      await this.$apollo.mutate({
        mutation: PROJECT_INIT_CREATION
      })

      this.$router.push({ name: 'project-create' })
    },

    async importProject() {
      this.busy = true
      await this.$nextTick()
      try {
        const { data } = await this.$apollo.mutate({
          mutation: PROJECT_IMPORT,
          variables: {
            input: {
              repo: this.repo
            }
          }
        })

        this.$bus('quickOpenProject', data.projectImport)
        this.$router.push({ name: 'project-home' })
      } catch (e) {
        this.showNoModulesModal = `${e.message}`
        this.busy = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.folder-explorer
  height 100%

.folder-explorer
  flex 100% 1 1

.project-select
  height 100%

.top-menu
  position fixed
  top $padding-item
  &.left
    left $padding-item
  &.right
    right $padding-item

.project-import
  max-width 600px
  width 100%
  margin 42px auto
  grid-gap ($padding-item * 3)
  .vue-ui-input
    display block

</style>
