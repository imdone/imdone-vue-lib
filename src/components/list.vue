<template lang="pug">
.card.list
  header.card-header
    p.card-header-title {{listName}}
    a.card-header-icon(@click="deleteList" v-if="tasks.length === 0 && !board.filter")
      b-icon(pack="fa" icon="trash" size="is-small")
    .card-header-icon(v-else)
      .tag.is-info {{tasks.length}}
  .card-content
    .overflow-container
      draggable.tasks(:data-list="listName" v-model="tasks" :options="{group:'cards'}" @end="onEnd")
        card(v-for="task in tasks"
          :selectedTask="selectedTask"
          :task="task"
          :key="task.id"
          :data-id="task.id"
          :repoURL="repoURL"
          :allowUpdates="allowUpdates"
          v-on:show-detail="showDetail"
          v-on:file-link="fileLink"
          v-on:text-clicked="textClicked")
</template>
<script>
import { Icon } from 'buefy/dist/components/Icon'
import Draggable from 'vuedraggable'
import Card from '@/components/card'
export default {
  name: 'imdone-list',
  components: {
    Card,
    Draggable,
    'b-icon': Icon
  },
  // DOING: Should accept a v-model **list** in the format {name, hidden, tasks} id:41
  props: ['value', 'selectedTask', 'repoURL', 'allowUpdates', 'board'],
  data () {
    return {
      innerTasks: this.value.tasks
    }
  },
  computed: {
    tasks: {
      get () {
        return this.innerTasks
      },
      set (value) {
        this.innerTasks = value
        this.$emit('input', {
          hidden: this.value.hidden,
          name: this.listName,
          tasks: value
        })
      }
    },
    listName () {
      return this.value.name
    }
  },
  watch: {
    value () {
      this.innerTasks = this.value.tasks
    }
  },
  methods: {
    textClicked (event) {
      this.$emit('text-clicked', event)
    },
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
      this.$emit('delete-list', this.listName)
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
