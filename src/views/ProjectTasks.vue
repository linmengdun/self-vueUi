<template>
  <div class="project-tasks page">
    <ContentView :title="$t('org.vue.views.project-tasks.title')">
      <!-- <template slot="actions">
        <VueInput v-model="search" icon-left="search" class="round" />
      </template> -->

      <ApolloQuery :query="require('../graphql/task/tasks.gql')" class="fill-height" :variables="{
        projectId: currentProjectId
      }" @result="onResult">
        <template slot-scope="{ result: { data, loading } }">
          <VueLoadingIndicator v-if="loading && (!data || !data.tasks)" class="overlay" />

          <NavContent v-else-if="data" :items="generateItems(data.tasks)" class="tasks">
            <TaskItem slot-scope="{ item, selected }" :task="item.task" :selected="selected" />
          </NavContent>
        </template>
      </ApolloQuery>
    </ContentView>
  </div>
</template>

<script>
import db from '../util/db'
import RestoreRoute from '../mixins/RestoreRoute'

import TASK_CHANGED from '../graphql/task/taskChanged.gql'
/* eslint-disable */
export default {
  mixins: [
    RestoreRoute({
      baseRoute: { name: 'project-tasks' }
    })
  ],

  metaInfo() {
    return {
      title: this.$t('org.vue.views.project-tasks.title')
    }
  },

  data() {
    return {
      search: '',
      currentProjectId: db.get('config.lastOpenProject').value()
    }
  },

  apollo: {
    $subscribe: {
      taskChanged: {
        query: TASK_CHANGED
      }
    }
  },

  // computed: {
  //   currentProjectId () {
  //     return db.get('config.lastOpenProject').value()
  //   }
  // },

  bus: {
    quickOpenProject(project) {
      this.currentProjectId = project.id
      // this.$apollo.getClient().writeQuery({
      //   query: TASKS,
      //   data: {
      //     tasks: null
      //   }
      // })
    }
  },

  methods: {
    generateItems(tasks) {
      if (!tasks) return []
      return tasks.filter(
        item => !this.search || item.name.includes(this.search)
      ).map(
        task => ({
          route: {
            name: 'project-task-details',
            params: {
              id: task.id
            }
          },
          task
        })
      )
    },

    onResult({ loading }) {
      if (!loading && this.$route.query.id) {
        this.$router.replace({
          name: 'project-task-details',
          params: { id: this.$route.query.id }
        })
      }
    }
  }
}
</script>
