<template lang="pug">
.card.list
  header.card-header
    p.card-header-title {{list}}
    //- a.card-header-icon(href='#' aria-label='more options')
    //-   span.icon
    //-     b-icon(pack="fa" icon="angle-up" size="is-small")
    //-     b-icon(pack="fa" icon="angle-down" size="is-small" aria-hidden='true')
  .card-content
    .overflow-container
      draggable.tasks(:data-list="list" v-model="sortedTasks" :options="{group:'cards'}" @end="onEnd")
        card(v-for="task in tasks" :selectedTask="selectedTask" :task="task" :key="task.id" :data-id="task.id"
          v-on:show-detail="showDetail" v-on:file-link="fileLink")
</template>
<script>
import Draggable from 'vuedraggable'
import Card from '@/components/card'
export default {
  name: 'imdone-list',
  components: {
    Card,
    Draggable
  },
  props: ['list', 'tasks', 'selectedTask'],
  computed: {
    sortedTasks: {
      get () {
        return this.tasks
      },
      set (value) {
        this.$emit('update-list', {name: this.list, tasks: value})
      }
    }
  },
  methods: {
    onEnd ({item, to, from, newIndex, oldIndex}) {
      const newList = to.dataset.list
      const oldList = from.dataset.list
      const taskId = item.dataset.id
      this.$emit('update-task', {newList, oldList, newIndex, oldIndex, taskId})
    },
    showDetail (task) {
      this.$emit('show-detail', task)
    },
    fileLink (task) {
      this.emit('file-link', task)
    }
  }
}
</script>
<style lang="scss" scoped>
  .list {
    max-height: 100%;
    width: 340px;
    margin-top: 5px;
    margin-bottom: 5px;
  }
  .card-content {
    display: flex;
    flex: 1;
    min-height: 0px;
    padding: 0;
  }
  .overflow-container {
    flex: 1;
    overflow: auto;
  }
  .tasks {
    padding: 1.5em;
  }
</style>
