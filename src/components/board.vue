<template lang="pug">
.board
  .columns
    .column(v-for='list in lists' :key="list.name")
      list(:list='list')
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
  padding: 5px 0;
}
</style>
