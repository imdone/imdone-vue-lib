<template lang="pug">
.board
  .columns
    list.column(v-for='list in lists' :key="list.name" :list='list.name' :tasks="list.tasks" v-on:update-list="updateList")
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
      listsOfTasks: []
    }
  },
  methods: {
    updateList: function ({name, tasks}) {
      this.listsOfTasks.find(list => list.name === name).tasks = tasks
    }
  },
  computed: {
    // DOING:30 This should be given to the component and should come from the imdone.io service
    lists: function () {
      if (this.listsOfTasks.length > 1) return this.listsOfTasks
      const listsMap = new Map()
      this.config.lists.forEach(list => {
        list.tasks = []
        listsMap.set(list.name, list)
      })
      this.tasks.forEach((task) => {
        const name = task.list
        if (!listsMap.get(name)) listsMap.set(name, {name, hidden: false, tasks: []})
        listsMap.get(name).tasks.push(task)
      })
      listsMap.forEach((list, name) => {
        this.listsOfTasks.push(list)
      })
      return this.listsOfTasks
    }
  }
}
</script>
<style lang="scss">
.board {
  position: absolute;
  margin: 10px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  .columns {
    max-height: 100%;
    .column {
      max-width: 340px;
      min-height: 0px;
      max-height: 100%;
      padding: 0;
      margin: 10px;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
