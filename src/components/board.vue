<template lang="pug">
.board-wrapper
  .board(:class="{'has-detail': selectedTask}")
    draggable.columns.is-mobile(v-model="listsOfTasks" @end="updateListOrder")
      list.column(v-for='list in listsOfTasks' :key="list.name" :list='list.name' :tasks="list.tasks" :selectedTask="selectedTask" :repoURL="repoURL"
        v-on:update-list="updateList" v-on:update-task-order="updateTaskOrder"
        v-on:show-detail="showDetail" v-on:file-link="fileLink")
  detail.detail(v-if="selectedTask" :task="selectedTask" :repoURL="repoURL" v-on:close-detail="closeDetail")
</template>
<script>
import Draggable from 'vuedraggable'
import List from '@/components/list'
import Detail from '@/components/detail'
import _ from 'lodash'

export default {
  name: 'imdone-board',
  components: {List, Detail, Draggable},
  props: ['tasks', 'config', 'allowUpdates', 'repoURL'],
  data: function () {
    return {
      listsOfTasks: this.tasks,
      selectedTask: null
    }
  },
  methods: {
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
    }
  }
}
</style>
