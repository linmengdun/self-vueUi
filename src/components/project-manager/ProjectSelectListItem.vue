<template>
  <div class="project-select-list-item list-item">
    <div class="content">
      <div class="favorite">
        <VueButton class="icon-button" :icon-left="project.favorite ? 'star' : 'star_border'"
          v-tooltip="$t('org.vue.components.project-select-list-item.tooltips.favorite')" data-testid="favorite-button"
          @click.stop="$emit('favorite')" />
      </div>

      <div class="info">
        <ListItemInfo :description="project.repo">
          <div slot="name" class="name">
            <span>{{ project.name }}</span>

            <!-- <ProjectTasksDropdown
              class="bullet-menu"
              :tasks="project.tasks"
            /> -->
          </div>
        </ListItemInfo>
      </div>

      <div class="actions">
        <!-- <VueButton icon-left="open_in_browser" @click.stop="openInEditor()">
          {{ $t('org.vue.components.project-select-list-item.tooltips.open-in-editor') }}
        </VueButton>

        <VueButton v-if="project.homepage" :href="project.homepage" target="_blank" class="icon-button"
          icon-left="open_in_new" v-tooltip="$t('org.vue.components.top-bar.homepage')" @click.stop /> -->

        <!-- <VueButton class="icon-button" icon-left="edit" v-tooltip="$t('org.vue.components.project-rename.title')"
          @click.stop="showRename = true" /> -->

        <VueButton class="icon-button" icon-left="close"
          v-tooltip="$t('org.vue.components.project-select-list-item.tooltips.delete')" data-testid="delete-button"
          @click.stop="$emit('remove')" />
      </div>
    </div>

    <!-- <ProjectRename v-if="showRename" :project="project" @close="showRename = false" @click.native.stop /> -->
  </div>
</template>

<script>
import OPEN_IN_EDITOR from '@/graphql/file/fileOpenInEditor.gql'

/* import ProjectRename from './ProjectRename.vue' */
/* eslint-disable */
export default {
  /* components: {
    ProjectRename
  }, */

  props: {
    project: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      /* showRename: false */
    }
  },

  methods: {
    async openInEditor() {
      await this.$apollo.mutate({
        mutation: OPEN_IN_EDITOR,
        variables: {
          input: {
            file: this.project.path
          }
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.content
  padding $padding-item
  display grid
  grid-template-columns auto 1fr auto
  grid-template-rows auto
  grid-template-areas "icon info actions"
  grid-gap $padding-item

.favorite
  grid-area icon
  h-box()
  box-center()

.info
  grid-area info

.actions
  grid-area actions
  h-box()
  align-items center

  >>> > *
    space-between-x($padding-item)

.name
  h-box()
  align-items center

.bullet-menu
  margin-left 6px

.project-select-list-item
  &.open
    &:not(:hover)
      background rgba($vue-ui-color-primary, .05)
</style>
