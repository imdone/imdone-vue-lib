<template lang="pug">
.card.list(v-if='visible')
  header.card-header
    p.card-header-title {{listName}}
    a.card-header-icon(@click="deleteList" v-if="tasks.length === 0 && !board.filter && !ignored")
      b-icon(pack="fa" icon="trash" size="is-small")
    .card-header-icon(v-else-if="ignored")
      b-icon(pack="fa" icon="archive" size="is-small")
    .card-header-icon(v-else)
      .tag.is-info {{tasks.length}}
  .card-content
    .overflow-container(ref="tasksEl")
      p.ignore-text(v-if="ignored") Cards dropped here will be ignored
      draggable.tasks(v-else :data-list="listName" v-model="tasks" :options="{group:'cards'}" @end="onEnd")
        card(v-for="task in tasks"
          :selectedTask="selectedTask"
          :activeTask="activeTask"
          :task="task"
          :key="task.id"
          :data-id="task.id"
          :repoURL="repoURL"
          :allowUpdates="allowUpdates"
          v-show="!ignored"
          v-on:show-edit="showEdit"
          v-on:file-link="fileLink"
          v-on:text-clicked="textClicked"
          v-on:tag-clicked='tagClicked'
          v-on:context-clicked='contextClicked'
          v-on:card-in-focus="cardInFocus")
  .card-footer
    button.button.is-white.has-text-left.is-smaller(@click.stop="addCard")
      b-icon.has-text-left(pack="fa" icon="plus" size="is-small")
      span.button-text Add a card
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
  // BACKLOG: Should accept a v-model **list** in the format {name, hidden, tasks} id:41
  props: ['value', 'selectedTask', 'repoURL', 'activeTask', 'allowUpdates', 'board', 'taskAdded'],
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
    },
    visible () {
      return !this.value.hidden
    },
    ignored () {
      return this.value.ignore
    }
  },
  watch: {
    value () {
      this.innerTasks = this.value.tasks
    }
  },
  methods: {
    cardInFocus ({task}) {
      this.$emit('card-in-focus', {task})
    },
    addCard () {
      this.$emit('add-card', this.listName)
    },
    scrollToEnd () {
      const el = this.$refs.tasksEl
      el.scrollTop = el.scrollHeight
    },
    textClicked (params) {
      this.$emit('text-clicked', params)
    },
    tagClicked (data) {
      this.$emit('tag-clicked', data)
    },
    contextClicked (data) {
      this.$emit('context-clicked', data)
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
    showEdit (task) {
      this.$emit('show-edit', task)
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
  .card-footer {
    display: -webkit-inline-box;
    border-top: 0px;
    button.button {
      color:gray;
      width: 100%;
      display: inherit;
      .button-text {
        vertical-align: top;
      }
    }
  }
  .list {
    max-height: 100%;
    min-width: 300px;
    max-width: 450px;
    width: 20vw;
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
  .ignore-text {
    margin: 1em;
    text-align: center;
  }
</style>
