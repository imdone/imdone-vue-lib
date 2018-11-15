<template lang="pug">
.new-issue
  .columns
    .column.is-12
      b-field
        b-input(placeholder="Title")
      b-field
        b-input(placeholder="Leave a comment" maxlength="200" type="textarea")
  .columns
    .column.is-6
    .column.has-text-right
      button.button.is-small(v-on:click="$emit('cancel')") Cancel
    .column.has-text-right
      button.button.is-success.is-small Submit new issue
</template>
<script>
import Buefy from 'buefy'

export default {
  name: 'imdone-new-issue',
  components: {
    'b-field': Buefy.Field,
    'b-input': Buefy.Input
  },
  props: ['task', 'repoURL', 'baseURL', 'allowUpdates'],
  data () {
    return {
    }
  },
  created () {
  }
}
</script>
