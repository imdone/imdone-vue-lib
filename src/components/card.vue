<template lang="pug">
article.message(:class="{'is-success': selected, 'is-info': !selected}" v-on:click="showDetail")
  //- .message-header
  //-   .task-text.has-text-left(v-html="text")
  .message-header
    .card-actions
      .level
        .level-left
        .level-right
          .level-item
            a(:href="fileEditLink" target="_blank")
             b-icon(pack="fa" icon="pencil-square" size="is-small")
  .message-body.is-size-7
    .task-text.has-text-left(v-html="text")
    .tags.imdone-tags(v-if="tags.length > 0")
      .tag.is-success(v-for="tag in tags") {{tag}}
    .tags.imdone-contexts(v-if="contexts.length > 0")
      .tag.is-info(v-for="context in contexts") {{context}}
    .source
      a(:href="fileLink" target="_blank") {{task.source.path}}:{{task.line}}
</template>
<script>
import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
import Buefy from 'buefy'
// import Task from 'imdone-core/lib/task'

const md = new MarkdownIt()

export default {
  name: 'imdone-card',
  props: ['task', 'selectedTask', 'repoURL'],
  components: {
    'b-icon': Buefy.Icon
  },
  computed: {
    text () {
      const html = md.render(this.task.getText({stripMeta: true, sanitize: true, stripTags: true, stripContext: true}))
      const $ = cheerio.load(html)
      $('a').attr('target', '_blank')
      return $.html()
    },
    tags () {
      return this.task.allTags
    },
    contexts () {
      return this.task.allContext
    },
    selected () {
      return (this.selectedTask && this.selectedTask.id === this.task.id)
    },
    fileLink () {
      return `${this.repoURL}${this.task.source.path}#L${this.task.line}`
    },
    fileEditLink () {
      const repoEditURL = this.repoURL.replace('/blob/', '/edit/')
      return `${repoEditURL}${this.task.source.path}#L${this.task.line}`
    }
  },
  methods: {
    showDetail () {
      this.$emit('show-detail', this.task)
    },
    emitFileLink () {
      this.$emit('file-link', this.task)
    }
  }
}
</script>
<style lang="scss" scoped>
.message {
  max-width: 300px;
  a {
    text-decoration: none;
  }
  .message-header {
    .card-actions {
      width: 100%;
      a {
        text-decoration: none;
      }
    }
  }
  .message-body {
    word-break: break-word;
    text-align: left;
    .tags {
      margin-bottom: 1em;
    }
    .task-text {
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
