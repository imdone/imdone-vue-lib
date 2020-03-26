<template lang="pug">
  .modal.is-active
    .modal-background(@click="close")
    .board-modal-content.has-text-left
      taskEditor(
        :editorTheme="editorTheme"
        ref="editor"
        :repo='repo'
        :task="task"
        :list="list"
        :template="template"
        v-model="content"
        v-on:input="onInput"
        v-on:close="close"
        v-on:save-task="saveTask"
        v-on:new-task="newTask"
      )
    button.modal-close.is-large(aria-label="close" @click="close")
</template>
<script>
import TaskEditor from '@/components/taskEditor'
export default {
  components: { TaskEditor },
  props: ['task', 'list', 'repo', 'template', 'editorTheme'],
  data: function () {
    return {
      content: '',
      originalContent: ''
    }
  },
  created () {
    if (this.task) this.content = this.task.getRawTextAndDescription()
    else if (this.template) (this.content = this.template)
    this.originalContent = this.content.toString()
    //- DOING:0 Add easter egg to display JSON
    // console.log('Editing Task:', stringify(this.task))
  },
  methods: {
    isModified () {
      return this.originalContent !== this.content
    },
    close () {
      if (this.isModified()) {
        const dialog = this.$buefy.dialog.confirm({
          title: 'Content Has Changed',
          message: `What do you want to do?`,
          cancelText: 'Continue Editing',
          confirmText: 'Close Editor',
          type: 'is-success',
          canCancel: ['button'],
          focusOn: 'cancel',
          trapFocus: true,
          onConfirm: (evt) => {
            this.$emit('close')
          },
          onCancel: () => {
            this.$refs.editor.focusEditor()
            dialog.close()
            return true
          }
        })
      } else {
        this.$emit('close')
      }
    },
    saveTask (opts) {
      this.$emit('save-task', opts)
      this.$emit('close')
    },
    newTask (opts) {
      this.$emit('new-task', opts)
      this.$emit('close')
    },
    onInput (modifiedContent) {
      this.content = modifiedContent
    }
  }
}
</script>
<style lang="scss" scoped>
.board-modal-content {
  margin: 0 auto;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
}
</style>


