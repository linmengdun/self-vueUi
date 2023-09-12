<template>
  <div class="project-select-list">
    <ApolloQuery :query="require('@/graphql/project/projects.gql')"
      :variables="{ skip: skip, limit: 50, forceRerender: forceRerender }" fetch-policy="network-only">
      <template slot-scope="{ result: { data, loading } }">
        <template v-if="data && data.projects">
          <div v-if="data.projects.data.length">
            <div class="toolbar">
              <VueInput v-model="search" icon-left="search" class="round" />
            </div>
            <!-- 列表 begin -->
            <!-- 搜索 begin -->
            <template v-if="search">
              <ListFilter v-for="favorite of [true, false]" :key="favorite" :list="filterProjects(data.projects.allData)"
                :filter="item => item.favorite === favorite">
                <template slot-scope="{ list }">
                  <div v-if="favoriteProjects.length" class="cta-text" :class="favorite ? 'favorite' : 'other'">
                    {{ $t(`org.vue.components.project-select-list.titles.${favorite ? 'favorite' : 'other'}`) }}
                  </div>
                  <ListSort :list="list" :compare="compareProjects">
                    <template slot-scope="{ list }">
                      <ProjectSelectListItem v-for="project of list" :key="project.id" :project="project" :class="{
                        open: currentProjectId === project.id
                      }" @click.native="openProject(project)" @remove="showDelete = project.id"
                        @favorite="toggleFavorite(project)" />
                    </template>
                  </ListSort>
                </template>
              </ListFilter>
            </template>
            <!-- 搜索 end -->
            <template v-else>
              <!-- 收藏项目 begin -->
              <ListFilter :list="favoriteProjects(data.projects.allData)" :filter="item => true">
                <template slot-scope="{ list }">
                  <template v-if="list.length > 0">
                    <div class="cta-text favorite">
                      {{ $t(`org.vue.components.project-select-list.titles.favorite`) }}
                    </div>
                    <ListSort :list="list" :compare="compareProjects">
                      <template slot-scope="{ list }">
                        <ProjectSelectListItem v-for="project of list" :key="project.id"
                          :project="{ ...project, favorite: true }" :class="{
                            open: currentProjectId === project.id
                          }" @click.native="openProject({ ...project, favorite: true })"
                          @remove="showDelete = project.id" @favorite="toggleFavorite({ ...project, favorite: true })" />
                      </template>
                    </ListSort>
                  </template>
                </template>
              </ListFilter>
              <!-- 收藏项目 end -->
              <!-- 其他项目 begin -->
              <ListFilter :list="otherList(data.projects.data)" :filter="item => true">
                <template slot-scope="{ list }">
                  <template v-if="list.length > 0">
                    <div class="cta-text other">
                      {{ $t(`org.vue.components.project-select-list.titles.other`) }}
                    </div>
                    <ListSort :list="list" :compare="compareProjects">
                      <template slot-scope="{ list }">
                        <ProjectSelectListItem v-for="project of list" :key="project.id"
                          :project="{ ...project, favorite: false }" :class="{
                            open: currentProjectId === project.id
                          }" @click.native="openProject(project)" @remove="showDelete = project.id"
                          @favorite="toggleFavorite(project)" />
                      </template>
                    </ListSort>
                  </template>
                </template>
              </ListFilter>
              <!-- 其他项目 end -->
            </template>
            <!-- 列表 end -->
          </div>
          <div v-else class="vue-ui-empty">
            <VueIcon icon="attach_file" class="empty-icon" />
            <div>{{ $t('org.vue.components.project-select-list.empty') }}</div>
          </div>
        </template>
        <div class="pagination-main" v-if="!search && data && data.projects && data.projects.total > 1">
          <el-pagination background layout="prev, pager, next" :page-count="data.projects.total"
            @current-change="handleCurrentChange" />
        </div>

        <VueModal v-if="!!showDelete" :title="$t('org.vue.components.project-select-list.delete.modal.title')"
          class="small" @close="showDelete = false">
          <div class="default-body">
            {{ $t('org.vue.components.project-select-list.delete.modal.body') }}
          </div>

          <div slot="footer" class="actions space-between">
            <VueButton :label="$t('org.vue.components.project-select-list.delete.modal.buttons.back')" class="flat"
              @click="showDelete = false" />

            <VueButton @click="removeProject({ id: showDelete })" :disabled="showDelete === true"
              :label="$t('org.vue.components.project-select-list.delete.modal.buttons.confirm')"
              icon-left="delete_forever" class="danger" />
          </div>
        </VueModal>

        <VueLoadingIndicator v-else-if="loading" class="overlay" />
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import Lowdb from '@/mixins/Lowdb'
import CurrentProject from '@/mixins/CurrentProject'
import { generateSearchRegex } from '@/util/search'

/* import PROJECTS from '@/graphql/project/projects.gql' */
import PROJECT_OPEN from '@/graphql/project/projectOpen.gql'
import PROJECT_REMOVE from '@/graphql/project/projectRemove.gql'
// import PROJECT_SET_FAVORITE from '../graphql/projectSetFavorite.gql'
/* eslint-disable */
export default {
  mixins: [
    Lowdb,
    CurrentProject
  ],

  data() {
    return {
      showDelete: false, // projectid / removing status
      favoriteProjectIds: [],
      search: '',
      skip: 1,
      forceRerender: 0,
    }
  },

  created() {
    this.favoriteProjectIds = this.db.get('favorite')
      .cloneDeep()
      .value()
  },

  /* apollo: {
    projects: PROJECTS
  }, */

  methods: {
    favoriteProjects(projects) {
      return (projects || []).filter(
        project => ~this.favoriteProjectIds.indexOf(project.id)
      )
    },

    otherList(projects) {
      return (projects || []).filter(
        project => this.favoriteProjectIds.indexOf(project.id) < 0
      )
    },
    async openProject(project) {
      if (this.currentProjectId !== project.id) {
        await this.$apollo.mutate({
          mutation: PROJECT_OPEN,
          variables: {
            id: project.id
          }
        })
      }
      this.$bus('quickOpenProject', project)
      this.$router.push({ name: 'project-home' })
    },

    async removeProject(project) {
      this.showDelete = true
      this.db.get('favorite')
        .remove(id => id === project.id)
        .write()

      await this.$apollo.mutate({
        mutation: PROJECT_REMOVE,
        variables: {
          id: project.id
        }
      })

      this.showDelete = false
      //this.$apollo.queries.projects.refetch();
      // 通过这种方式重新触发数据更新，其他update方式不生效，有可能是因为内部被我们重写的缘故
      this.forceRerender += 1;
    },

    async toggleFavorite(project) {
      const favorite = this.db.get('favorite')
      if (project.favorite) {
        favorite.remove(id => project.id === id).write()
      } else {
        favorite.push(project.id).write()
      }
      this.favoriteProjectIds = favorite.cloneDeep().value()
    },

    compareProjects(a, b) {
      return a.name.localeCompare(b.name)
    },

    filterProjects(projects) {
      const reg = generateSearchRegex(this.search)
      if (reg) {
        projects = projects.filter(
          p => reg.test(p.name)
        )
      }

      return projects.map(item => {
        return Object.assign({}, item, {
          favorite: !!~this.favoriteProjectIds.indexOf(item.id)
        })
      })
    },

    handleCurrentChange(num) {
      this.skip = num
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-select-list
  height 100%
  overflow-y auto
  position relative
  min-height 400px

.toolbar
  h-box()
  box-center()
  margin-bottom $padding-item
</style>
<style>
.pagination-main {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}

.el-pagination.is-background .btn-next,
.el-pagination.is-background .btn-prev,
.el-pagination.is-background .el-pager li {
  background: #e0f8ed;
}

.pagination-main .el-pagination.is-background .el-pager li:hover,
.pagination-main .el-pagination.is-background .btn-next:hover,
.pagination-main .el-pagination.is-background .btn-prev:hover,
.pagination-main .el-pagination.is-background .el-pager li:not(.disabled):hover {
  color: #42b983;
}

.pagination-main .el-pagination.is-background .el-pager li:not(.disabled).active {
  background: #42b983;
  color: #2c3e50;
}

.vue-ui-dark-mode .pagination-main .el-pagination.is-background .el-pager li:not(.disabled).active {
  background: #42b983;
  color: #2c3e50;
}

.vue-ui-dark-mode .pagination-main .el-pagination.is-background .el-pager li:hover,
.vue-ui-dark-mode .el-pagination.is-background .btn-next:hover,
.vue-ui-dark-mode .el-pagination.is-background .btn-prev:hover {
  color: #42b983;
}

.vue-ui-dark-mode .el-pagination.is-background .btn-next,
.vue-ui-dark-mode .el-pagination.is-background .btn-prev,
.vue-ui-dark-mode .el-pagination.is-background .el-pager li {
  background: #2c3e50;
  color: #fff;
}

.el-pagination.is-background .btn-next:disabled,
.el-pagination.is-background .btn-prev:disabled,
.el-pagination.is-background .btn-next:disabled:hover,
.el-pagination.is-background .btn-prev:disabled:hover {
  color: #C0C4CC;
}
</style>