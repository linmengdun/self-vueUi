<template>
  <div class="project-task-details">
    <template v-if="task">
      <div class="header">
        <VueIcon icon="assignment" class="task-icon big" />
        <div class="name">{{ task.name }}</div>
        <div class="description">{{ $t(task.description) }}</div>
      </div>

      <div class="actions-bar">
        <VueButton v-if="task.status !== 'running'" icon-left="play_arrow" class="primary"
          :label="$t('org.vue.views.project-task-details.actions.play')" data-testid="run-task" @click="runTask()" />

        <VueButton v-else icon-left="stop" class="primary" :label="$t('org.vue.views.project-task-details.actions.stop')"
          data-testid="stop-task" @click="stopTask()" />

        <!-- <VueButton
          slot="trigger"
          icon-left="settings"
          class="icon-button primary"
          :disabled="task.status === 'running'"
          v-tooltip="$t('org.vue.views.project-task-details.parameters')"
          @click="showParameters = true"
        /> -->

        <VueButton slot="trigger" icon-left="history" class="icon-button primary"
          v-tooltip="$t('org.vue.views.project-task-details.history.title')" v-if="task.needHistory"
          @click="showHistory = true" />

        <div class="vue-ui-spacer" />

        <VueGroup v-if="task.views.length" v-model="currentView" class="views">
          <VueGroupButton :label="$t('org.vue.views.project-task-details.output')" icon-left="dvr" value="_output" />

          <VueGroupButton v-for="view of task.views" :key="view.id" :value="view.id" :icon-left="view.icon"
            :label="$t(view.label)" />
        </VueGroup>
      </div>

      <div v-if="displayPriority >= 2" class="content">
        <TerminalView ref="terminal" :class="{
          ghost: currentView !== '_output'
        }" :key="id" :cols="100" :rows="24" auto-size :options="{
  scrollback: 5000,
  disableStdin: true,
  useFlowControl: true
}" :title="$t('org.vue.views.project-task-details.output')" toolbar open-links @clear="clearLogs()" />

        <ClientAddonComponent v-if="currentView !== '_output'" :name="currentViewComponent" :key="currentView"
          class="view" />
      </div>
    </template>

    <VueModal v-if="showParameters" :title="$t('org.vue.views.project-task-details.parameters')" class="medium anchor"
      @close="restoreParameters()">
      <div class="default-body">
        <PromptsList :prompts="visiblePrompts" @answer="answerPrompt" />
      </div>

      <div slot="footer" class="actions">
        <VueButton class="primary big" :disabled="!validParameters"
          :label="$t('org.vue.views.project-task-details.actions.save')" @click="saveParameters()" />
      </div>
    </VueModal>

    <VueModal v-if="showHistory" :title="$t('org.vue.views.project-task-details.history.title')" class="anchor medium"
      @close="showHistory = false">
      <div class="default-body">
        <ProjectTaskHistory :history="task.history" />
      </div>
    </VueModal>

  </div>
</template>

<script>
import Prompts from '../mixins/Prompts'
import DisplayPriority from '../mixins/DisplayPriority'

import TASK from '../graphql/task/task.gql'
import TASK_LOGS from '../graphql/task/taskLogs.gql'
import TASK_RUN from '../graphql/task/taskRun.gql'
import TASK_STOP from '../graphql/task/taskStop.gql'
import TASK_LOGS_CLEAR from '../graphql/task/taskLogsClear.gql'
import TASK_LOG_ADDED from '../graphql/task/taskLogAdded.gql'
import TASK_OPEN from '../graphql/task/taskOpen.gql'
import TASK_SAVE_PARAMETERS from '../graphql/task/taskSaveParameters.gql'
// import TASK_RESTORE_PARAMETERS from '../graphql/taskRestoreParameters.gql'
/* eslint-disable */
export default {
  name: 'ProjectTaskDetails',

  provide() {
    return {
      TaskDetails: this
    }
  },

  mixins: [
    Prompts({
      field: 'task',
      query: TASK
    }),
    DisplayPriority(2)
  ],

  metaInfo() {
    return {
      title: this.task && `${this.task.name} - ${this.$t('org.vue.views.project-tasks.title')}`
    }
  },

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      task: null,
      showHistory: false,
      showParameters: false,
      currentView: '_output'
    }
  },

  apollo: {
    task: {
      query: TASK,
      variables() {
        return {
          id: this.id
        }
      },
      async result({ data, loading }) {
        if (!this.$_init && !loading && data && data.task && data.task.defaultView) {
          this.$_init = true
          await this.$nextTick()
        }
      },
      skip() {
        return this.displayPriority < 1
      }
    },

    taskLogs: {
      query: TASK_LOGS,
      variables() {
        return {
          id: this.id
        }
      },
      fetchPolicy: 'network-only',
      manual: true,
      async result({ data, loading }) {
        if (!loading) {
          await this.$nextTick()
          const terminal = this.$refs.terminal
          if (terminal) {
            data.taskLogs.logs.forEach(terminal.addLog)
          }
        }
      },
      skip() {
        return this.displayPriority < 2
      }
    },

    $subscribe: {
      taskLogAdded: {
        query: TASK_LOG_ADDED,
        variables() {
          return {
            id: this.id
          }
        },
        async result({ data }) {
          if (data.taskLogAdded.taskId === this.id) {
            await this.$nextTick()
            const terminal = this.$refs.terminal
            terminal.addLog(data.taskLogAdded)
          }
        },
        skip() {
          return this.displayPriority < 2
        }
      }
    }
  },

  computed: {
    currentViewComponent() {
      if (this.currentView !== '_output') {
        const view = this.task.views.find(
          view => view.id === this.currentView
        )
        if (view) {
          const id = view.component
          return id
        }
      }
    },

    validParameters() {
      return this.task.prompts.every(
        p => p.id === 'msg'
          ? (p.value && p.value.length > 11)
          : p.value !== '""'
      )
    }
  },

  watch: {
    id() {
      this.showParameters = false
      this.currentView = '_output'
      this.$_init = false
      this.open()
      this.runDisplayPriority()
    }
  },

  mounted() {
    this.open()
  },

  methods: {
    open() {
      this.$apollo.mutate({
        mutation: TASK_OPEN,
        variables: {
          id: this.id
        }
      })
    },

    runTask(force = false) {
      if (this.visiblePrompts.length > 0 && !force) {
        this.showParameters = true
      } else {
        this.restoreParameters()
        this.$apollo.mutate({
          mutation: TASK_RUN,
          variables: {
            id: this.id,
            args: ''
          }
        })
      }
    },

    stopTask() {
      this.$apollo.mutate({
        mutation: TASK_STOP,
        variables: {
          id: this.id
        }
      })
    },

    clearLogs() {
      this.$apollo.mutate({
        mutation: TASK_LOGS_CLEAR,
        variables: {
          id: this.id
        }
      })
    },

    async saveParameters() {
      await this.$apollo.mutate({
        mutation: TASK_SAVE_PARAMETERS,
        variables: {
          id: this.id
        }
      })
      this.showParameters = false
      this.runTask(true)
    },

    restoreParameters() {
      this.showParameters = false
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-task-details
  v-box()
  align-items stretch
  height 100%

@media (max-width: 1250px)
  .actions-bar
    flex-wrap wrap

  .views
    margin-top $padding-item

.command
  font-family $font-mono
  font-size 12px
  background $vue-ui-color-light-neutral
  color $vue-ui-color-dark
  padding 10px 16px
  height 32px
  border-radius $br
  max-width 20vw
  ellipsis()
  box-sizing border-box
  .vue-ui-dark-mode &
    background $vue-ui-color-dark
    color $vue-ui-color-light

.content
  flex auto 1 1
  height 0
  margin 0 $padding-item $padding-item
  position relative

.terminal-view
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  border-radius $br
  &.ghost
    opacity 0
    pointer-events none

.view
  max-height 100%
  overflow-x hidden
  overflow-y auto

.header
  padding $padding-item $padding-item 0
  h-box()
  align-items center

  .task-icon
    margin-right 4px
    >>> svg
      fill $vue-ui-color-dark
      .vue-ui-dark-mode &
        fill $vue-ui-color-light-neutral

  .name
    font-size 22px
    color $vue-ui-color-dark
    position relative
    top -1px
    .vue-ui-dark-mode &
      color $vue-ui-color-light-neutral

  .description
    color $color-text-light
    margin-left $padding-item

.task-settings
  padding $padding-item
  box-sizing border-box
  width 700px
  .prompts
    max-height 500px
    overflow-y auto
</style>
