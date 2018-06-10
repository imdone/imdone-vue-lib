<template lang="pug">
article.message.is-small.is-info
  //- .message-header
  //-   .task-text.has-text-left(v-html="text")
  .message-body
    .task-text.has-text-left(v-html="text")
    .tags.imdone-tags(v-if="tags.length > 0")
      .tag.is-success(v-for="tag in tags") {{tag}}
    .tags.imdone-contexts(v-if="contexts.length > 0")
      .tag.is-info(v-for="context in contexts") {{context}}
    .source
      a(href="#") {{task.source.path}}
</template>
<script>
import * as MarkdownIt from 'markdown-it'
const md = new MarkdownIt()
// DOING: set target="_blank" on anchors in task text +feature id:0
// Jesse
// jesse@piascik.net
// https://github.com/imdone/imdone-vue-lib/issues/1
// TODO: programatically set source.path href action +feature id:1
// Jesse
// jesse@piascik.net
// https://github.com/imdone/imdone-vue-lib/issues/2
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
    .tags {
      margin-bottom: 1em;
    }
    .task-text {
      font-size: 14px;
      margin-bottom: 1em;
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
