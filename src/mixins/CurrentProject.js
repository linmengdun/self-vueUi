import db from '../util/db'
import PROJECT_CURRENT from '../graphql/project/projectCurrent.gql'
/* eslint-disable */
export default {
  data() {
    return {
      currentProjectId: db.get('config.lastOpenProject').value()
    }
  },

  bus: {
    quickOpenProject(project) {
      this.currentProjectId = project.id
      db.set('config.lastOpenProject', project.id).write()
    }
  },

  apollo: {
    projectCurrent: {
      query: PROJECT_CURRENT,
      fetchPolicy: 'network-only',
      variables() {
        return {
          id: this.currentProjectId
        }
      }
    }
  }
}
