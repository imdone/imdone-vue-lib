<template lang="pug">
  .task-editor-wrapper
    .level.task-editor-header
      .level-left
        .level-item
          .tag.is-large.is-black.list-name {{listName}}
    codemirror.imdone-editor.is-small(
      @ready="onCmReady"
      v-model="localValue"
      :options="cmOptions")
    .level
      .level-left
        .level-item(v-if="task")
          button.button.is-info(@click.stop="saveTask") Save
        .level-item(v-else)
          button.button.is-info(@click.stop="newTask") Add Card

</template>

<script>
// require component
import { codemirror } from 'vue-codemirror'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/mode/gfm/gfm'
import './autosuggest'
// import stringify from 'json-stringify-safe'

export default {
  components: { codemirror },
  props: ['task', 'list', 'repo', 'template', 'value'],
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
    cmOptions () {
      const saveFunc = this.task ? this.saveTask : this.newTask
      return {
        // codemirror options
        tabSize: 2,
        mode: 'gfm',
        theme: 'abcdef',
        lineWrapping: true,
        lineNumbers: true,
        line: true,
        firstLineNumber: this.line,
        extraKeys: {
          'Cmd-S': saveFunc,
          'Ctrl-S': saveFunc,
          'Esc': this.close,
          Tab: function (cm) {
            var spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
            cm.replaceSelection(spaces)
          }
        },
        autoSuggest: [
          {
            mode: 'gfm',
            startChar: '+',
            listCallback: () => {
              return this.repo.allTags.map(tag => ({text: tag, displayText: tag + ' '}))
            }
          },
          {
            mode: 'gfm',
            startChar: '@',
            listCallback: () => {
              return this.repo.allContext.map(context => ({text: context, displayText: context + ' '}))
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
      cm.focus()
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
  }
}
</style>
