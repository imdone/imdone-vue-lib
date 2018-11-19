<template lang="pug">
article.message(:class="{'is-success': selected, 'is-info': !selected}" v-bind="meta" v-on:click="showDetail")
  //- .message-header
  //-   .task-text.has-text-left(v-html="text")
  .message-body.is-size-7
    .card-actions.is-size-6
      .level
        .level-left
          //- .level-item(v-if="allowUpdates")
          //-   a(:href="fileEditLink" target="_blank" title="edit")
          //-     b-icon(pack="fa" icon="pencil" size="is-small")
          //- .level-item(v-if="allowUpdates")
          //-   a(v-on:click="showIssueLink" title="link to issue")
          //-     b-icon(pack="fa" icon="share-alt" size="is-small")
        .level-right
          .level-item
            img.gravatar(v-if="task.blame && task.blame.email" :src="gravatarURL" :title="name")
            b-icon(v-else pack="fa" icon="user" size="is-small" title="No author found")
    .task-text.has-text-left(v-html="text")
    //- TODO: Display progress of task lists like [github](https://help.github.com/articles/about-task-lists/) id:37


    .tags.imdone-tags(v-if="tags.length > 0")
      .tag.is-success(v-for="tag in tags") {{tag}}
    .tags.imdone-contexts(v-if="contexts.length > 0")
      .tag.is-info(v-for="context in contexts") {{context}}
    .source
      //- BACKLOG: Add ban icon for ignoring a file or folder id:38
      // - b-icon(v-if="allowUpdates" pack="fa" icon="ban" size="is-small")
      a(:href="fileLink" target="_blank") {{task.source.path}}:{{task.line}}
</template>
<script>
import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
import * as gravatar from 'gravatar'
import { Icon } from 'buefy/dist/components/Icon'
// import Task from 'imdone-core/lib/task'

const md = new MarkdownIt()

export default {
  name: 'imdone-card',
  props: ['task', 'selectedTask', 'repoURL', 'allowUpdates'],
  components: {
    'b-icon': Icon
  },
  computed: {
    meta () {
      const att = {}
      const meta = this.task.allMeta
      for (const key in meta) {
        att[`data-meta-${key}`] = meta[key].join(',')
      }
      return att
    },
    text () {
      const html = md.render(this.task.getText({stripMeta: true, sanitize: true, stripTags: true, stripContext: true}))
      const $ = cheerio.load(html)
      $('a').attr('target', '_blank')
      return $.html()
    },
    name () {
      if (!this.task.blame || !this.task.blame.name) return 'no author found'
      return this.task.blame.name
    },
    tags () {
      return this.task.allTags.filter(tag => !!tag)
    },
    contexts () {
      return this.task.allContext.filter(context => !!context)
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
    },
    gravatarURL () {
      if (!this.task.blame) return `https://www.gravatar.com/avatar`
      return gravatar.url(this.task.blame.email, {protocol: 'https', s: '25'})
    }
  },
  methods: {
    showDetail () {
      this.$emit('show-detail', this.task)
    },
    emitFileLink () {
      this.$emit('file-link', this.task)
    },
    showIssueLink () {
      this.$emit('show-issue-link', this.task)
    }
  }
}
</script>
<style lang="scss" scoped>
img.gravatar {
  border-radius: 50%;
  width: 25px;
}
.message {
  cursor: -webkit-grab;
  &:not(:last-child) {
    margin-bottom: .75em;
  }
  max-width: 300px;
  a {
    text-decoration: none !important;
  }
  .card-actions {
    width: 100%;
    a {
      text-decoration: none;
    }
  }
  .message-body {
    word-break: break-word;
    text-align: left;
    padding: 1em;
    .tags {
      margin-bottom: 0;
      padding-bottom: 0;
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
