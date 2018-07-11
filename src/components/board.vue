<template lang="pug">
.board-wrapper
  .board(:class="{'has-detail': selectedTask}")
    draggable.columns.is-mobile(v-model="listsOfTasks" @end="updateListOrder" :options="draggableOpts")
      list.column.imdone-list(v-for='list in listsOfTasks' :key="list.name" :list='list.name' :tasks="list.tasks" :selectedTask="selectedTask" :repoURL="repoURL"
        v-on:update-list="updateList" v-on:update-task-order="updateTaskOrder"
        v-on:show-detail="showDetail" v-on:file-link="fileLink"
        v-on:delete-list="deleteList")
      .column.new-list(slot="footer")
        button.button.is-white(v-if="!addListFormShown" @click="showAddListForm")
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
  detail.detail(v-if="selectedTask" :task="selectedTask" :repoURL="repoURL" v-on:close-detail="closeDetail")
</template>
<script>
import Draggable from 'vuedraggable'
import Buefy from 'buefy'
import List from '@/components/list'
import Detail from '@/components/detail'
import _ from 'lodash'

export default {
  name: 'imdone-board',
  components: {List, Detail, Draggable, 'b-icon': Buefy.Icon},
  props: ['tasks', 'config', 'allowUpdates', 'repoURL'],
  data: function () {
    return {
      listsOfTasks: this.tasks,
      selectedTask: null,
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
  methods: {
    showAddListForm () {
      this.addListFormShown = true
      this.$nextTick(() => this.$refs.newListInput.focus())
    },
    hideAddListForm () {
      this.addListFormShown = false
    },
    deleteList (name) {
      this.config.lists = this.config.lists.filter(list => list.name !== name)
      this.listsOfTasks = this.listsOfTasks.filter(list => list.name !== name)
      this.$emit('update-config', this.config)
    },
    addList () {
      if (!this.newListName) return
      const config = this.config
      if (_.find(config.lists, {name: this.newListName})) return
      config.lists.push({name: `${this.newListName}`, hidden: false})
      this.listsOfTasks.push({name: `${this.newListName}`, hidden: false, tasks: []})
      this.$emit('update-config', config)
      this.newListName = null
      this.hideAddListForm()
    },
    updateList ({name, tasks}) {
      if (!this.allowUpdates) return
      this.listsOfTasks.find(list => list.name === name).tasks = tasks
    },
    updateListOrder () {
      const config = _.cloneDeep(this.config)
      config.lists = this.listsOfTasks.map(({name, hidden, ignore}) => ({name, hidden, ignore}))
      this.$emit('update-config', config)
    },
    updateTaskOrder ({newList, oldList, newIndex, oldIndex, taskId}) {
      // TODO: Listen for the update-task event in parent component and modify file using github edit api id:4
      // Jesse
      // jesse@piascik.net
      // https://github.com/imdone/imdone-vue-lib/issues/7
      if (!this.allowUpdates) {
        this.$toast.open({
          message: 'Your don\'t have permission to update this board.',
          type: 'is-warning',
          position: 'is-top',
          queue: false,
          duration: 5000
        })
        return
      }
      const list = this.listsOfTasks.find(list => list.name === newList)
      const task = list.tasks.find(task => task.id === taskId)
      task.list = newList
      this.$emit('update-task-order', {task, tasks: this.listsOfTasks})
      console.log(task)
    },
    showDetail (task) {
      this.selectedTask = task
    },
    closeDetail () {
      this.selectedTask = null
    },
    fileLink () {
      debugger
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
  width: 30vw;
  left: 70vw;
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
    right: 30vw;
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
        width: 340px;
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
