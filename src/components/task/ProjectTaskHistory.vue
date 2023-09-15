<template>
  <div class="project-task-histroy">
    <div class="content">
      <template v-if="history && history.length > 0">
        <div
          class="list-item"
          v-for="item in history"
          :key="item.id"
        >
          <div class="status">
            <VueButton
              v-if="item.status === 'running'"
              class="icon-button"
              :class="item.status"
              icon-left="autorenew"
            />
            <VueButton
              v-else-if="item.status === 'done'"
              class="icon-button"
              icon-left="check_circle"
            />
            <VueButton
              v-else
              class="icon-button"
              icon-left="warning"
            />
          </div>

          <div class="info">
            <ListItemInfo
              show-description
            >
              <span slot="name" class="name">
                <span>#{{ item.id }}</span>
              </span>

              <span slot="description" class="history-description">
                <span class="info date">
                  <span class="label">{{ $t('org.vue.components.project-task-history-item.build-date') }}：</span>
                  <span class="value">{{ item.id | dateFormat }}</span>
                </span>
              </span>
            </ListItemInfo>
          </div>

          <div class="actions">
            <VueButton
              :disabled="item.status !== 'done'"
              class="icon-button"
              icon-left="open_in_browser"
              v-tooltip="$t('org.vue.components.project-task-history-item.tooltips.open-in-editor')"
              @click.stop
            />
          </div>
        </div>
      </template>
      <div v-else class="vue-ui-empty">
        <VueIcon icon="check_circle" class="empty-icon"/>
        <span>{{ $t('org.vue.views.project-task-details.history.empty') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const DATE_REGEXP = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/

export default {
  props: {
    history: {
      required: true
    }
  },

  filters: {
    dateFormat (id) {
      return id.replace(DATE_REGEXP, '20$1-$2-$3 $4:$5')
    }
  },

  methods: {
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.list-item
  padding $padding-item
  display grid
  grid-template-columns auto 1fr auto
  grid-template-rows auto
  grid-template-areas "icon info actions"
  grid-gap $padding-item
  user-select auto
  cursor default

.status
  grid-area icon
  h-box()
  box-center()

.actions
  grid-area actions
  h-box()
  align-items center

.running
  >>> .vue-ui-icon
    animation loading 1s steps(12, end) infinite

.vue-ui-empty
  padding: 50px 24px

@keyframes loading
  0%
    transform: rotate3d(0, 0, 1, 0deg);
  100%
    transform: rotate3d(0, 0, 1, 360deg);
</style>
