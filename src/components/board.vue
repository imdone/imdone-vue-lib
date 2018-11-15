<template lang="pug">
.board-wrapper
  .board(:class="{'has-detail': selectedTask}")
    draggable.columns.is-mobile(v-model="listsOfTasks" @end="updateListOrder" :options="draggableOpts")
      list.column.imdone-list(v-for='list in listsOfTasks'
        :key="list.name"
        :list='list.name'
        :tasks="list.tasks"
        :selectedTask="selectedTask"
        :repoURL="repoURL"
        :allowUpdates="allowUpdates"
        v-on:update-list="updateList"
        v-on:update-task-order="updateTaskOrder"
        v-on:show-detail="showDetail"
        v-on:file-link="fileLink"
        v-on:delete-list="deleteList")
      .column.new-list(slot="footer" v-if="allowUpdates")
        button#new-list-button.button.is-white(v-if="!addListFormShown" @click="showAddListForm")
          b-icon(pack="fa" icon="plus" size="is-small")
          | &nbsp;&nbsp;Add another list
        .card(v-if="addListFormShown")
          .card-content
            .control
              input.input(type="text" v-model="newListName" ref="newListInput" @keyup.enter="addList" @keyup.esc="hideAddListForm")
            .control
              button.button.is-success.is-small.add-list-btn(@click="addList") Add List
              a(@click="hideAddListForm")
                b-icon(pack="fa" icon="times" size="is-small")
  detail.detail(v-if="selectedTask"
    :task="selectedTask"
    :repoURL="repoURL"
    :baseURL="baseURL"
    :allowUpdates="allowUpdates"
    :searchIssuesURL="searchIssuesURL"
    :createIssueURL="createIssueURL"
    v-on:close-detail="closeDetail")
</template>
<script>
import Draggable from 'vuedraggable'
import { Icon } from 'buefy/dist/components/Icon'
import List from '@/components/list'
import Detail from '@/components/detail'
import _ from 'lodash'

export default {
  name: 'imdone-board',
  components: {List, Detail, Draggable, 'b-icon': Icon},
  props: ['tasks', 'config', 'allowUpdates', 'repoURL', 'baseURL', 'selectedTask', 'searchIssuesURL', 'createIssueURL'],
  data: function () {
    return {
      addListFormShown: false,
      newListName: null,
      draggableOpts: {
        group: {
          name: 'lists',
          pull: false
        },
        draggable: '.imdone-list'
      }
    }
  },
  computed: {
    listsOfTasks: {
      get () {
        return this.tasks
      },
      set (value) {
        this.$emit('update-tasks', value)
      }
    }
  },
  methods: {
    showAddListForm () {
      if (!this.allowUpdates) return this.emitUpdateError('show add')
      this.addListFormShown = true
      this.$nextTick(() => this.$refs.newListInput.focus())
    },
    hideAddListForm () {
      this.addListFormShown = false
    },
    deleteList (name) {
      if (!this.allowUpdates) return this.emitUpdateError('delete list')
      this.$emit('delete-list', name)
    },
    addList () {
      if (!this.allowUpdates) return this.emitUpdateError('add list')
      if (!this.newListName) return
      if (!/^([A-Z]+[A-Z-_]+?)$/.test(this.newListName)) {
        this.$nextTick(() => {
          this.$refs.newListInput.focus()
          this.$refs.newListInput.select()
        })
        return this.$emit('list-name-error')
      }
      const config = this.config
      if (_.find(config.lists, {name: this.newListName})) return
      this.$emit('add-list', `${this.newListName}`)
      this.newListName = null
      this.hideAddListForm()
    },
    updateList ({name, tasks}) {
      if (!this.allowUpdates) return
      this.$emit('update-list', {name, tasks})
    },
    updateListOrder () {
      if (!this.allowUpdates) return this.emitUpdateError('list order')
      const config = _.clone(this.config)
      config.lists = this.listsOfTasks.map(({name, hidden, ignore}) => ({name, hidden, ignore}))
      this.$emit('update-list-order', config)
    },
    emitUpdateError (error) {
      this.$emit('update-error', error)
    },
    updateTaskOrder ({newList, oldList, newIndex, oldIndex, taskId}) {
      if (!this.allowUpdates) return this.emitUpdateError('task order')
      const list = this.listsOfTasks.find(list => list.name === newList)
      const task = list.tasks.find(task => task.id === taskId)
      task.list = newList
      this.$emit('update-task-order', {task, tasks: this.listsOfTasks})
    },
    showDetail (task) {
      this.$emit('task-selected', task)
    },
    closeDetail () {
      this.$emit('task-unselected')
    },
    fileLink () {
      // debugger
    }
  }
}
</script>
<style lang="scss">
html {
  font-size: 18px;
}
.board-wrapper {
  @import "../../node_modules/bulma/bulma.sass";
  .icon {
    margin: 0px;
  }
}

.detail {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 32vw;
  left: 68vw;
}
.board {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 20px;
  overflow-x: auto;
  &.has-detail {
    border-right: 1px solid #dbdbdb;
    left: 0;
    right: 32vw;
  }
  .columns {
    max-height: 100%;
    height: 100%;
    width: max-content;
    .column {
      min-height: 0px;
      padding: 0;
      margin: 0 10px;
      display: flex;
      flex-direction: column;
      &.new-list {
        width: 330px;
        .card-content {
          padding: .25em;
          .control {
            padding: .25em;
            .add-list-btn {
              margin-right: 1em;
            }
          }
        }
      }
    }
  }
}
</style>
