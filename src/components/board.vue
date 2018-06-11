<template lang="pug">
.board
  .columns
    list.column(v-for='list in listsOfTasks' :key="list.name" :list='list.name' :tasks="list.tasks" v-on:update-list="updateList" v-on:update-task="updateTask")
</template>
<script>
import List from '@/components/list'
// import * as _ from 'lodash'
export default {
  name: 'imdone-board',
  components: {
    List
  },
  props: ['tasks', 'config'],
  data: function () {
    return {
      listsOfTasks: this.tasks
    }
  },
  methods: {
    updateList: function ({name, tasks}) {
      this.listsOfTasks.find(list => list.name === name).tasks = tasks
    },
    updateTask: function ({newList, oldList, newIndex, oldIndex, taskId}) {
      // TODO: Listen for the update-task event in parent component and modify file using github edit api id:4
      // Jesse
      // jesse@piascik.net
      // https://github.com/imdone/imdone-vue-lib/issues/7
      const list = this.listsOfTasks.find(list => list.name === newList)
      const task = list.tasks.find(task => task.id === taskId)
      task.list = newList
      console.log(task)
    }
  }
}
</script>
<style lang="scss">
.board {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 20px;
  overflow-x: auto;
  .columns {
    max-height: 100%;
    height: 100%;
    width: max-content;
    .column {
      min-height: 0px;
      padding: 0;
      margin: 0 10px;
      display: flex;
      flex: 0 0 340px;
      flex-direction: column;
    }
  }
}
</style>
