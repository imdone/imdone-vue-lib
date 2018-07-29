<template lang="pug">
.card.list
  header.card-header
    p.card-header-title {{list}}
    a.card-header-icon(@click="deleteList" v-if="sortedTasks.length === 0")
      b-icon(pack="fa" icon="trash" size="is-small")
    .card-header-icon(v-if="sortedTasks.length > 0")
      .tag.is-info {{sortedTasks.length}}
  .card-content
    .overflow-container
      draggable.tasks(:data-list="list" v-model="sortedTasks" :options="{group:'cards'}" @end="onEnd")
        card(v-for="task in tasks"
          :selectedTask="selectedTask"
          :task="task"
          :key="task.id"
          :data-id="task.id"
          :repoURL="repoURL"
          :allowUpdates="allowUpdates"
          v-on:show-detail="showDetail" v-on:file-link="fileLink")
</template>
<script>
import Buefy from 'buefy'
import Draggable from 'vuedraggable'
import Card from '@/components/card'
export default {
  name: 'imdone-list',
  components: {
    Card,
    Draggable,
    'b-icon': Buefy.Icon
  },
  props: ['list', 'tasks', 'selectedTask', 'repoURL', 'allowUpdates'],
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
      this.$emit('update-task-order', {newList, oldList, newIndex, oldIndex, taskId})
    },
    showDetail (task) {
      this.$emit('show-detail', task)
    },
    fileLink (task) {
      this.$emit('file-link', task)
    },
    deleteList () {
      this.$emit('delete-list', this.list)
    }
  }
}
</script>
<style lang="scss" scoped>
  .card-header {
    height: 3rem;
    cursor: -webkit-grab;
  }
  .list {
    max-height: 100%;
    width: 330px;
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
    padding: .75em;
    min-height: 100%;
  }
</style>
