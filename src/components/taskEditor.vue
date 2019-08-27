<template lang="pug">
  .task-editor-wrapper
    .level.task-editor-header
      .level-left
        .level-item
          .tag.is-large.is-black.list-name {{listName}}
    codemirror.imdone-editor.is-small(
      @ready="onCmReady"
      v-model="content" 
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
import 'codemirror/mode/markdown/markdown'

export default {
  components: { codemirror },
  props: [ 'task', 'list' ],
  data: function () {
    return {
      content: ''
    }
  },
  mounted () {
    if (this.task) this.content = this.task.getRawTextAndDescription()
  },
  computed: {
    listName () {
      if (this.task) return this.task.list
      else if (this.list) return this.list
    },
    line () {
      if (!this.task) return 0
      return this.task.line
    },
    noContent () {
      return !this.content || this.content.trim() === ''
    },
    cmOptions () {
      const saveFunc = this.task ? this.saveTask : this.newTask
      return {
        // codemirror options
        tabSize: 2,
        mode: 'markdown',
        theme: 'abcdef',
        lineWrapping: true,
        lineNumbers: true,
        line: true,
        firstLineNumber: this.line,
        extraKeys: {
          'Cmd-S': saveFunc,
          'Ctrl-S': saveFunc,
          'Esc': this.close
        }
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }
  },
  methods: {
    saveTask () {
      if (this.noContent) return
      this.$emit('save-task', {task: this.task, content: this.content})
      this.close()
    },
    newTask () {
      if (this.noContent) return
      this.$emit('new-task', {list: this.list, content: this.content})
      this.close()
    },
    close () {
      this.$emit('close')
    },
    onCmReady (cm) {
      cm.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/codemirror/lib/codemirror.css";
@import "../../node_modules/codemirror/theme/abcdef.css";
.imdone-editor {
  width: calc(100vw - 400px);
  min-width: 1px;
  max-width: 1000px;
}
.level {
  margin-top: 20px;
}
.task-editor-header {
  margin: 0;
  padding: 1em 0;
  .list-name {
    position: relative;
  }
}
</style>