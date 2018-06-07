<template lang="pug">
.board
  .columns
    list.column(v-for='list in lists' :key="list.name" :list='list')
</template>
<script>
import List from '@/components/list'
import * as _ from 'lodash'
export default {
  name: 'imdone-board',
  components: {
    List
  },
  props: ['tasks', 'config'],
  computed: {
    lists: function () {
      const lists = {}
      this.tasks.forEach((task) => {
        const name = task.list
        if (!lists[name]) lists[name] = {name, tasks: []}
        lists[name].tasks.push(task)
      })
      return _.values(lists)
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
  bottom: 40px;
  left: 0;
  .columns {
    max-height: 100vh;
    .column {
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
