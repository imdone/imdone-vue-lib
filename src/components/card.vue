<template lang="pug">
article.message.is-small.is-info
  //- .message-header
  //-   .task-text.has-text-left(v-html="text")
  .message-body
    .task-text.has-text-left(v-html="text")
    .tags.imdone-tags
      .tag.is-success(v-for="tag in tags") {{tag}}
    .tags.imdone-contexts
      .tag.is-info(v-for="context in contexts") {{context}}
</template>
<script>
import * as MarkdownIt from 'markdown-it'
const md = new MarkdownIt()
export default {
  name: 'imdone-card',
  props: ['task'],
  computed: {
    text: function () {
      return md.render(this.task.getText({stripMeta: true, sanitize: true, stripTags: true, stripContext: true}))
    },
    tags: function () {
      return this.task.allTags
    },
    contexts: function () {
      return this.task.allContext
    }
  }
}
</script>
<style lang="scss">
.message {
  max-width: 300px;
  .message-body {
    word-break: break-word;
    text-align: left;
    .task-text {
      font-size: 14px;
      margin-bottom: 1.5em;
      h1,h2,h3,h4,h5,ul {
        margin: .2em 0;
      }
      h1 {
        font-size: 1.5em;
      }
      h2 {
        font-size: 1.35em;
      }
      h3 {
        font-size: 1.2em;
      }
      h4 {
        font-size: 1.05em;
      }
      h5 {
        font-size: 1em;
      }
      ul {
        margin-left: 1.2em;
      }
    }
  }
}
</style>
