<template lang="pug">
.new-issue
  h3.subtitle.is-5.has-text-left New Issue
  b-notification(v-if="error" type="is-warning" v-on:close="clearError") {{ error }}
  .columns
    .column.is-12
      b-field
        b-input(placeholder="Title" v-model="title" @keyup.native.enter="createIssue" ref="titleField")
      b-field
        b-input(placeholder="Leave a comment" v-model="body" maxlength="2000" type="textarea" @keyup.native.enter="createIssue")
  .level
    .level-left
    .level-right
      .level-item.has-text-right
        button.button(v-on:click="$emit('cancel')") Cancel
      .level-item.has-text-right
        button.button.is-imdone-primary(:disabled="!this.title" v-on:click="createIssue") Submit new issue
</template>
<script>
import { Field } from 'buefy/dist/components/field'
import { Input } from 'buefy/dist/components/input'
import { Notification } from 'buefy/dist/components/notification'
import axios from 'axios'

export default {
  name: 'imdone-new-issue',
  components: {
    'b-field': Field,
    'b-input': Input,
    'b-notification': Notification
  },
  props: ['task', 'repoURL', 'baseURL', 'allowUpdates', 'createIssueURL'],
  data () {
    return {
      title: null,
      body: null,
      error: null,
      lastError: null
    }
  },
  mounted () {
    this.setIssueDefaults()
  },
  watch: {
    task () {
      this.setIssueDefaults()
    }
  },
  methods: {
    setIssueDefaults () {
      this.title = this.task.getText({stripMeta: true})
      this.body = this.task.getTextAndDescription()
      this.$nextTick(() => {
        this.$refs.titleField.$refs.input.focus()
        this.$refs.titleField.$refs.input.select()
      })
    },
    clearError () {
      this.error = null
    },
    createIssue () {
      this.$emit('loading', true)
      axios.post(this.createIssueURL, {title: this.title, body: this.body})
      .then(({data}) => {
        this.$emit('new-issue', data)
        this.$emit('cancel')
      })
      .catch(err => {
        this.lastError = err
        this.error = 'We encountered an error creating your issue.  Please try again later.'
      })
      .then(() => this.$emit('loading', false))
    }
  }
}
</script>
