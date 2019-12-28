<template lang="pug">
  .modal.is-active
    .modal-background(@click="close")
    .board-modal-content.has-text-left
      taskEditor(
        :repo='repo'
        :task="task"
        :list="list"
        :template="template"
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
  props: ['task', 'list', 'repo', 'template'],
  methods: {
    close () {
      this.$emit('close')
    },
    saveTask (opts) {
      this.$emit('save-task', opts)
    },
    newTask (opts) {
      this.$emit('new-task', opts)
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


