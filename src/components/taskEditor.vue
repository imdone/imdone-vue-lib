<template lang="pug">
  .task-editor-wrapper
    .level.task-editor-header
      .level-left
        .level-item
          .tag.is-large.list-name.has-text-weight-semibold.CodeMirror(:class="`cm-s-${theme}`") {{listName}}
    codemirror.imdone-editor.is-small(
      @ready="onCmReady"
      v-model="localValue"
      :options="cmOptions")
    .level
      .level-left.has-text-weight-semibold
        .level-item(v-if="task")
          button.button.is-info(@click.stop="saveTask") Save
        .level-item(v-else)
          button.button.is-info(@click.stop="newTask") Add Card

</template>

<script>
// require component
import { codemirror } from 'vue-codemirror'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/comment/comment'
import 'codemirror/mode/gfm/gfm'
import './autosuggest'
// import stringify from 'json-stringify-safe'
function compareText (a, b) {
  var nameA = a.text.toUpperCase()
  var nameB = b.text.toUpperCase()
  if (nameA < nameB) return -1
  if (nameA > nameB) return 1
  return 0
}

export default {
  components: { codemirror },
  props: ['task', 'list', 'repo', 'template', 'value', 'editorTheme'],
  data: function () {
    return {
      innerList: this.list,
      localValue: null
    }
  },
  watch: {
    localValue () {
      this.emitInput()
    }
  },
  created () {
    this.localValue = this.value.toString()
  },
  computed: {
    listName () {
      if (this.task) return this.task.list
      else if (this.innerList) return this.innerList
    },
    line () {
      if (!this.task) return 0
      return this.task.line
    },
    noContent () {
      return !this.localValue || this.localValue.trim() === ''
    },
    theme () {
      return this.editorTheme || 'blackboard'
    },
    cmOptions () {
      const saveFunc = this.task ? this.saveTask : this.newTask
      return {
        // codemirror options
        tabSize: 2,
        mode: 'gfm',
        theme: this.theme,
        lineWrapping: true,
        lineNumbers: true,
        line: true,
        firstLineNumber: this.line,
        indentWithTabs: false,
        indentUnit: 2,
        extraKeys: {
          'Shift-Tab': 'indentLess',
          'Cmd-/': 'toggleComment',
          'Ctrl-/': 'toggleComment',
          'Cmd-S': saveFunc,
          'Ctrl-S': saveFunc,
          'Esc': this.close,
          'Tab': function betterTab (cm) {
            if (cm.somethingSelected()) {
              cm.indentSelection('add')
            } else {
              cm.replaceSelection(cm.getOption('indentWithTabs') ? '\t'
                : Array(cm.getOption('indentUnit') + 1).join(' '), 'end', '+input')
            }
          }
        },
        autoSuggest: [
          {
            mode: 'gfm',
            startChar: '+',
            listCallback: () => {
              return this.repo.allTags.map(tag => ({text: tag, displayText: tag + ' '}))
                .sort(compareText)
            }
          },
          {
            mode: 'gfm',
            startChar: '@',
            listCallback: () => {
              return this.repo.allContext.map(context => ({text: context, displayText: context + ' '}))
                .sort(compareText)
            }
          }
        ]
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }
  },
  methods: {
    saveTask () {
      if (this.noContent) return
      this.$emit('save-task', {task: this.task, content: this.localValue})
    },
    newTask () {
      if (this.noContent) return
      this.$emit('new-task', {list: this.innerList, content: this.localValue})
    },
    close () {
      this.$emit('close')
    },
    onCmReady (cm) {
      this.cm = cm
      this.focusEditor()
    },
    focusEditor () {
      if (this.cm) this.cm.focus()
    },
    emitInput () {
      this.$emit('input', this.localValue)
    }
  }
}
</script>

<style lang="scss">
@import "../../node_modules/codemirror/lib/codemirror.css";
@import "../../node_modules/codemirror/theme/abcdef.css";
@import "../../node_modules/codemirror/theme/lesser-dark.css";
@import "../../node_modules/codemirror/theme/material-ocean.css";
@import "../../node_modules/codemirror/theme/midnight.css";
@import "../../node_modules/codemirror/theme/blackboard.css";
@import "../../node_modules/codemirror/theme/mdn-like.css";
@import "../../node_modules/codemirror/theme/eclipse.css";
@import "../../node_modules/codemirror/addon/hint/show-hint.css";
.imdone-editor {
  width: calc(100vw - 400px);
  min-width: 200px;
  .CodeMirror {
    height: calc(100vh - 400px) !important;
    min-height: 400px;
    .CodeMirror-cursor {
      width: 3px;
    }
  }
}
.CodeMirror-hints {
  z-index: 999;
  background: #000;
}
.CodeMirror-hint {
  color: #fff;
}
.task-editor-wrapper {
  .level {
    margin-top: 20px;
  }
}
.task-editor-header {
  margin: 0;
  padding: 1em 0;
  .list-name {
    position: relative;
    font-family: inherit;
  }
}
</style>
