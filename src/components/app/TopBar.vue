<template>
  <div class="top-bar">
    <VueDropdown :label="projectCurrent ? projectCurrent.name : ''" class="current-project" icon-right="arrow_drop_down"
      button-class="flat round">
      <VueSwitch :value="isFavoriteProject" :icon="isFavoriteProject ? 'star' : 'star_border'" class="extend-left"
        @input="toggleCurrentFavorite()">
        {{ $t('org.vue.components.project-select-list-item.tooltips.favorite') }}
      </VueSwitch>

      <VueDropdownButton @click="refreshProject()" :label="$t('org.vue.components.top-bar.project-refresh')"
        :class="{ rotate: refreshing }" icon-left="autorenew" :keepOpen="true" />

      <template v-if="branches && branches.length > 0">
        <div class="dropdown-separator" />

        <div class="section-title">
          {{ $t('org.vue.components.top-bar.project-branches') }}
        </div>

        <VueDropdownButton v-for="branch of branches" :key="branch.name" :disabled="isRunning"
          :label="`origin/${branch.name}`" :icon-left="branch.current ? 'check' : 'uncheck'"
          @click="checkoutBranch(branch)" />
      </template>

      <template v-if="favoriteProjects.length">
        <div class="dropdown-separator" />

        <div class="section-title">
          {{ $t('org.vue.components.top-bar.favorite-projects') }}
        </div>

        <VueDropdownButton v-for="project of favoriteProjects" :key="project.id" :label="project.name" icon-left="star"
          @click="openProject(project)" />
      </template>

      <div class="dropdown-separator" />

      <VueDropdownButton :to="{ name: 'project-select' }" :label="$t('org.vue.views.project-select.title')"
        icon-left="home" />
    </VueDropdown>

    <portal-target name="top-title" class="title">E-world</portal-target>

    <AppLoading />

    <div class="vue-ui-spacer" />

    <SuggestionBar />

    <portal-target name="top-actions" class="actions" />
  </div>
</template>
<script>
import db from '@/util/db'
import PROJECTS from '@/graphql/project/projects.gql'
import CurrentProject from '@/mixins/CurrentProject'

import BRANCHES from '@/graphql/branches/branches.gql'
import PROJECT_OPEN from '@/graphql/project/projectOpen.gql'
import PROJECT_REFRESH from '@/graphql/project/projectRefresh.gql'
import BRNACH_CHECKOUT from '@/graphql/branches/branchCheckout.gql'
import TASKS from '@/graphql/task/tasks.gql'
/* eslint-disable */
export default {
  mixins: [
    CurrentProject
  ],

  data() {
    return {
      refreshing: false,
      favoriteProjectIds: db.get('favorite').cloneDeep().value()
    }
  },

  apollo: {
    tasks: {
      query: TASKS,
      variables() {
        return {
          projectId: this.currentProjectId
        }
      }
    },

    projects: PROJECTS,

    branches: {
      query: BRANCHES,
      variables() {
        return {
          projectId: this.currentProjectId
        }
      }
    }
  },

  computed: {
    favoriteProjects() {
      if (!this.projects) return []
      return this.projects.allData.filter(
        p => ~this.favoriteProjectIds.indexOf(p.id) && (this.projectCurrent && this.projectCurrent.id !== p.id)
      )
    },

    isFavoriteProject() {
      return !!~this.favoriteProjectIds.indexOf(this.currentProjectId)
    },

    isRunning() {
      return this.tasks.filter(task => task.status === 'running').length > 0
    }
  },

  methods: {
    async toggleCurrentFavorite() {
      if (this.currentProjectId) {
        const favorite = db.get('favorite')
        if (this.isFavoriteProject) {
          favorite.remove(id => this.currentProjectId === id).write()
        } else if (!~favorite.indexOf(this.currentProjectId)) {
          favorite.push(this.currentProjectId).write()
        }
        this.favoriteProjectIds = favorite.cloneDeep().value()
      }
    },

    async checkoutBranch({ name }) {
      await this.$apollo.mutate({
        mutation: BRNACH_CHECKOUT,
        variables: {
          input: {
            name,
            projectId: this.currentProjectId
          }
        },
        update: (store, { data: { branchCheckout } }) => {
          if (branchCheckout) {
            this.$apollo.queries.branches.refresh()
          }
        }
      })
    },

    async refreshProject() {
      this.refreshing = true
      setTimeout(() => {
        this.refreshing = false
      }, 2000)

      await this.$apollo.mutate({
        mutation: PROJECT_REFRESH,
        variables: {
          id: this.projectCurrent.id
        },
        update: (store, { data: { projectRefresh } }) => {
          if (projectRefresh) {
            this.$apollo.queries.branches.refresh()
          }
        }
      })
    },

    async openProject(project) {
      this.$bus('quickOpenProject', project)

      await this.$apollo.mutate({
        mutation: PROJECT_OPEN,
        variables: {
          id: project.id
        }
      })
      // await resetApollo()
    }
  }
}
</script>
<style lang="stylus" scoped>
@import "~@/style/imports"

.top-bar
  background $vue-ui-color-light
  padding $padding-item
  h-box()
  align-items center
  position relative
  height 32px
  z-index 1
  box-shadow 0 2px 10px rgba(black, .05)
  .vue-ui-dark-mode &
    background $vue-ui-color-darker
    box-shadow 0 2px 10px rgba(black, .2)

  &,
  .actions
    /deep/ > *
      space-between-x($padding-item)

.current-project
  min-width (180px - $padding-item * 2)
  margin-right ($padding-item * 2)
  text-align: center

  >>> .trigger
    .vue-ui-button
      padding 0 !important
      .vue-ui-icon.right
        width 20px
        height @width

.vue-ui-empty
  padding 6px

.title
  font-size 22px
  font-weight lighter

.rotate
  >>> .vue-ui-icon
    animation rotate 1s linear infinite

@keyframes rotate
  0%
    transform rotate(0deg)
  100%
    transform rotate(360deg)
</style>

<style lang="stylus">
.tooltip-inner
  max-height 700px
  overflow-x hidden
  overflow-y auto
</style>
