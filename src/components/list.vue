<template lang="pug">
.card.list(v-if='visible')
  header.card-header
    p.card-header-title 
      a(@click="filterClicked" v-if="filter" :title="filter") {{listName}}
      span(v-else) {{listName}}
    a.card-header-icon(@click="filterClicked" v-if="filter" :title="filter")
      b-icon(pack="fa" icon="filter" size="is-small")
    a.card-header-icon(@click="deleteList" v-if="tasks.length === 0 && !board.filter && !ignored")
      b-icon(pack="fa" icon="trash" size="is-small")
    .card-header-icon(v-else-if="ignored")
      b-icon(pack="fa" icon="archive" size="is-small")
    .card-header-icon(v-else)
      .tag.is-light {{tasks.length}}
  .card-content
    .overflow-container(ref="tasksEl")
      p.ignore-text(v-if="ignored") Cards dropped here will not be displayed
      draggable.tasks(:data-list="listName" v-model="tasks" :group="group" @end="onEnd" :draggable="draggable")
        card(v-for="(task, index) in tasks"
          :board="board"
          :showFileLinks="showFileLinks"
          :selectedTask="selectedTask"
          :activeTask="activeTask"
          :task="task"
          :key="task.id"
          :data-id="task.id"
          :repoURL="repoURL"
          :allowUpdates="allowUpdates"
          :config="board.config"
          :maxLines="maxLines"
          v-on:show-edit="showEdit"
          v-on:show-delete="showDelete"
          v-on:file-link="fileLink"
          v-on:text-clicked="textClicked"
          v-on:meta-clicked='metaClicked'
          v-on:tag-clicked='tagClicked'
          v-on:context-clicked='contextClicked'
          v-on:card-in-focus="cardInFocus")
  .card-footer(v-if="!filter")
    button.button.is-primary.has-text-left.is-smaller(@click.stop="addCard")
      b-icon.has-text-left(pack="fa" icon="plus" size="is-small")
      span.button-text Add a card
</template>
<script>
import { BIcon } from 'buefy/dist/esm/icon'
import Draggable from 'vuedraggable'
import Card from '@/components/card'
export default {
  name: 'imdone-list',
  components: {
    Card,
    Draggable,
    BIcon
  },
  //- TODO:50 Should accept a v-model **list** in the format {name, hidden, tasks} id:41
  props: ['value', 'selectedTask', 'repoURL', 'activeTask', 'allowUpdates', 'board', 'showFileLinks', 'maxLines'],
  data () {
    return {
      innerTasks: this.value.tasks,
      filtered: false
    }
  },
  computed: {
    tasks: {
      get () {
        return this.ignored ? [] : this.innerTasks
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
    },
    filter () {
      return this.value.filter
    },
    draggable () {
      if (this.filter) return
      return '.task-card'
    },
    group () {
      if (this.filter) return
      return 'cards'
    }
  },
  watch: {
    value () {
      this.innerTasks = this.value.tasks
    }
  },
  created () {
    if (this.$services) this.$services.on('filtered', this.onFiltered)
  },
  destroyed () {
    if (this.$services) this.$services.off('filtered', this.onFiltered)
  },
  updated () {
    if (this.filtered) {
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollToTop()
          this.filtered = false
        }, 250)
      })
    }
  },
  methods: {
    filterClicked () {
      this.$emit('filter-clicked', this.filter)
    },
    onFiltered ({path}) {
      if (path === this.board.path) this.filtered = true
    },
    scrollToTop () {
      const tasksEl = this.$refs.tasksEl
      if (!tasksEl) return
      tasksEl.scrollTop = 0
    },
    cardInFocus ({task}) {
      this.$emit('card-in-focus', {task})
    },
    addCard () {
      this.$emit('add-card', this.listName)
    },
    textClicked (params) {
      this.$emit('text-clicked', params)
    },
    metaClicked (data) {
      this.$emit('meta-clicked', data)
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
    showDelete (task) {
      this.$emit('show-delete', task)
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
    min-height: 90%;
  }
  .ignore-text {
    margin: 1em;
    text-align: center;
  }
</style>
