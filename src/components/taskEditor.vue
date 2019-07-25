<template lang="pug">
  .task-editor-wrapper
    codemirror.imdone-editor.is-small(
      @ready="onCmReady"
      v-model="content" 
      :options="cmOptions")
    .level
      .level-left
        .level-item
          button.button.is-info(@click.stop="saveTask") Save
</template>

<script>
// require component
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/markdown/markdown'

export default {
  components: { codemirror },
  props: [ 'task' ],
  data: function () {
    return {
      content: ''
    }
  },
  mounted () {
    if (this.task) this.content = this.task.getRawTextAndDescription()
  },
  computed: {
    cmOptions () {
      return {
        // codemirror options
        tabSize: 2,
        mode: 'markdown',
        theme: 'abcdef',
        lineWrapping: true,
        lineNumbers: true,
        line: true,
        firstLineNumber: this.task.line,
        extraKeys: {
          'Cmd-S': this.saveTask,
          'Ctrl-S': this.saveTask,
          'Esc': this.close
        }
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }
  },
  methods: {
    saveTask () {
      this.$emit('save-task', {task: this.task, content: this.content})
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
</style>
