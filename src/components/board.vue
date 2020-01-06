<template lang="pug">
div
  taskEditorModal(
    :repo="board"
    v-if="selectedTask" 
    :task="selectedTask" 
    v-on:close="closeEdit"
    v-on:save-task="saveTask"
  )
  taskEditorModal(
    :repo="board"
    v-if="innerNewCardList" 
    :list="innerNewCardList" 
    :template="cardTemplate"
    v-on:close="closeEdit"
    v-on:new-task="newTask"
  )
  //- multipane.board-main(v-on:paneResizeStop="resizeStop")
  .board-main
    //- .imdone-pane(:style="{width: '100%'}" ref="boardPanel")
    .board
      draggable.columns.is-mobile(:list="lists" @end="updateListOrder" :options="draggableOpts")
        list.column.imdone-list(v-for='(list, index) in lists'
          v-if="lists"
          :data-list="list.name"
          :key="list.name"
          v-model="lists[index]"
          :showFileLinks="showFileLinks"
          :board="board"
          :selectedTask="selectedTask"
          :activeTask="activeTask"
          :repoURL="repoURL"
          :allowUpdates="allowUpdates"
          :maxLines="maxLines"
          v-on:update-task-order="updateTaskOrder"
          v-on:show-edit="showEdit"
          v-on:show-delete="showDelete"
          v-on:file-link="emitFileLink"
          v-on:delete-list="deleteList"
          v-on:text-clicked="textClicked"
          v-on:tag-clicked='tagClicked'
          v-on:context-clicked='contextClicked'
          v-on:add-card="addCard"
          v-on:card-in-focus="cardInFocus")
        .column.new-list(slot="footer" v-if="allowUpdates")
          button#new-list-button.button.is-white.has-text-left.block(v-if="!addListFormShown" @click="showAddListForm")
            b-icon(pack="fa" icon="plus" size="is-small")
            | &nbsp;&nbsp;Add another list
          .card(v-if="addListFormShown")
            .card-content
              .control
                input.input(type="text" placeholder="Enter list name..." v-model="newListName" ref="newListInput" @keyup.enter="addList" @keyup.esc="hideAddListForm")
              .control
                button.button.is-imdone-primary.is-small.add-list-btn(@click="addList") Add List
                a(@click="hideAddListForm")
                  b-icon(pack="fa" icon="times" size="is-small")
    //- multipane-resizer(v-if="detailOpen")
    //- detail.imdone-pane.detail(
    //-   v-if="detailOpen"
    //-   :task="selectedTask"
    //-   :repoURL="repoURL"
    //-   :baseURL="baseURL"
    //-   :allowUpdates="allowUpdates"
    //-   :allowFileEdit="allowFileEdit"
    //-   :searchIssuesURL="searchIssuesURL"
    //-   :createIssueURL="createIssueURL"
    //-   v-on:close-detail="closeDetail"
    //-   v-on:file-link="emitFileLink"
    //-   v-on:text-clicked="textClicked")

</template>
<script>
import Draggable from 'vuedraggable'
import { Icon } from 'buefy/dist/components/Icon'
import List from '@/components/list'
import Detail from '@/components/detail'
import TaskEditorModal from '@/components/taskEditorModal'
import _ from 'lodash'
import taskTextUtils from '../utils/task-text-utils'
// import { Multipane, MultipaneResizer } from 'vue-multipane'

export default {
  name: 'imdone-board',
  components: {List, Detail, Draggable, 'b-icon': Icon, TaskEditorModal},
  // components: {List, Detail, Draggable, 'b-icon': Icon, Multipane, MultipaneResizer, TaskEditorModal},
  // TODO:60 Should accept a v-model **board** in the format `{config, lists}` where lists is a list of tasks in the format `{name, hidden, tasks}` id:40
  props: [
    'board',
    'allowUpdates',
    'allowFileEdit',
    'repoURL',
    'baseURL',
    'selectedTask',
    'activeTask',
    'newCardList',
    'searchIssuesURL',
    'createIssueURL',
    'showFileLinks',
    'frontMatter'
  ],
  data: function () {
    return {
      innerNewCardList: this.newCardList,
      detailOpen: false,
      boardPanelWidth: '60%',
      addListFormShown: false,
      newListName: null,
      innerLists: this.board.lists,
      draggableOpts: {
        group: {
          name: 'lists',
          pull: false
        },
        draggable: '.imdone-list'
      }
    }
  },
  computed: {
    lists: {
      get () {
        return this.innerLists
      },
      set (lists) {
        this.innerLists = lists
      }
    },
    config () {
      return this.board.config
    },
    maxLines () {
      return this.config.settings && this.config.settings.maxLines
    },
    cardTemplate () {
      return this.frontMatter && taskTextUtils.formatDescription({frontMatter: this.frontMatter}, this.frontMatter.template).description
    }
  },
  watch: {
    board () {
      this.innerLists = this.board.lists
    },
    newCardList () {
      this.innerNewCardList = this.newCardList
    }
  },
  methods: {
    cardInFocus ({task}) {
      this.$emit('card-in-focus', {task})
    },
    addCard (list) {
      this.innerNewCardList = list
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
    showAddListForm () {
      if (!this.allowUpdates) return this.emitUpdateError('show add')
      this.addListFormShown = true
      this.$nextTick(() => this.$refs.newListInput.focus())
    },
    hideAddListForm () {
      this.addListFormShown = false
    },
    deleteList (name) {
      if (!this.allowUpdates) return this.emitUpdateError('delete list')
      this.$emit('delete-list', name)
    },
    addList () {
      if (!this.allowUpdates) return this.emitUpdateError('add list')
      if (!this.newListName) return
      if (!/^([A-Z]+[A-Z-_]+?)$/.test(this.newListName)) {
        this.$nextTick(() => {
          this.$refs.newListInput.focus()
          this.$refs.newListInput.select()
        })
        return this.$emit('list-name-error', 'List names must be all caps, must be at least 2 characters in length and can include [-] and [_]')
      }
      const config = this.config
      if (_.find(config.lists, {name: this.newListName})) return
      this.$emit('add-list', `${this.newListName}`)
      this.newListName = null
      this.hideAddListForm()
    },
    updateListOrder (update) {
      if (!this.allowUpdates) return this.emitUpdateError('list order')
      this.$emit('update-list-order', update)
    },
    emitUpdateError (error) {
      this.$emit('update-error', error)
    },
    updateTaskOrder ({newList, oldList, newIndex, oldIndex, taskId}) {
      if (!this.allowUpdates) return this.emitUpdateError('task order')
      const list = this.lists.find(list => list.name === newList)
      const task = list.tasks.find(task => task.id === taskId)
      this.$emit('update-task-order', {task, tasks: this.lists, newList, oldList, newIndex, oldIndex, taskId})
    },
    showEdit (task) {
      this.$emit('task-selected', task)
    },
    showDelete (task) {
      this.$emit('show-delete', task)
    },
    closeEdit () {
      this.$emit('task-unselected')
      this.innerNewCardList = null
    },
    saveTask (opts) {
      this.$emit('save-task', opts)
    },
    newTask (opts) {
      this.$emit('new-task', opts)
    },
    // showDetail (task) {
    //   this.$emit('task-selected', task)
    //   this.$refs.boardPanel.style.width = this.boardPanelWidth
    //   this.$refs.boardPanel.style.maxWidth = '75%'
    // },
    // closeDetail () {
    //   this.$emit('task-unselected')
    //   this.$refs.boardPanel.style.width = '100%'
    //   this.$refs.boardPanel.style.maxWidth = '100%'
    // },
    // resizeStop (pane, container, size) {
    //   this.boardPanelWidth = this.$refs.boardPanel.style.width
    // },
    emitFileLink (task) {
      this.$emit('file-link', task)
    }
  }
}
</script>
<style lang="scss" scoped>
.layout-v > .multipane-resizer {
  margin: 0; left: 0;
  position: relative;
  width: 12px;
  &:before {
    display: block;
    content: "";
    width: 3px;
    height: 40px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -20px;
    margin-left: -1.5px;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
  }
  &:hover {
    &:before {
      border-color: #999;
    }
  }
}
.imdone-pane {
  text-align: left;
  padding: 15px;
  overflow: hidden;
  // border: 1px solid #ccc;
}
.board-main {
  // border: 1px solid #F0F0F0;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
.board {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 20px 20px 0px 20px;
  overflow-x: auto;
  overflow-y: auto;
  .columns {
    padding-top: 10px;
    max-height: 100%;
    height: 100%;
    width: max-content;
    .column {
      min-height: 0px;
      padding: 0;
      margin: 0 10px;
      display: flex;
      flex-direction: column;
      &.new-list {
        width: 330px;
        .card-content {
          padding: .25em;
          .control {
            padding: .25em;
            .add-list-btn {
              margin-right: 1em;
            }
          }
        }
      }
    }
  }
}
</style>
