<template lang="pug">
article.message.task-card(:class="{'is-imdone-primary': selected, 'is-info': !selected}" v-bind="meta" v-on:click="showDetail")
  //- .message-header
  //-   .task-text.has-text-left(v-html="text")
  .message-body
    .card-actions.is-size-6(v-if="task.blame && task.blame.email")
      .level
        .level-left
        .level-right
          .level-item
            img.gravatar(v-if="task.blame && task.blame.email" :src="gravatarURL" :title="name")
            b-icon(v-else pack="fa" icon="user" size="is-small" title="No author found")
    .task-text.has-text-left(@click.prevent="textClicked" v-html="description.html")
    .toggle-full-desc(v-if='descTruncated  && !fullDesc')
      a(@click.stop="fullDesc = true" title="Show full description")
        octicon(:icon="Octicons.unfold")
    .toggle-full-desc(v-if='fullDesc')
      a(@click.stop="fullDesc = false" title="Show truncated description")
        octicon(:icon="Octicons.fold")
    //- TODO: Display progress of task lists like [github](https://help.github.com/articles/about-task-lists/) id:37
    .tags.imdone-tags(v-if="tags.length > 0")
      a.tag.is-imdone-primary(v-for="tag in tags" @click.stop='tagClicked(tag)') {{tag}}
    .tags.imdone-contexts(v-if="contexts.length > 0")
      a.tag.is-info(v-for="context in contexts" @click.stop='contextClicked(context)') {{context}}
    .source
      //- BACKLOG: Add ban icon for ignoring a file or folder id:38
      // - b-icon(v-if="allowUpdates" pack="fa" icon="ban" size="is-small")
      a(@click="emitFileLink" :href="fileLink" :target="target") {{task.source.path}}:{{task.line}}
</template>
<script>
import * as gravatar from 'gravatar'
import { Icon } from 'buefy/dist/components/Icon'
import Octicon, { Octicons } from 'octicons-vue'
import taskTextUtils from '../utils/task-text-utils'

export default {
  name: 'imdone-card',
  props: ['task', 'selectedTask', 'repoURL', 'allowUpdates'],
  data () {
    return {
      maxDescLines: 5,
      Octicons,
      fullDesc: false
    }
  },
  components: {
    'b-icon': Icon,
    Octicon
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
      return taskTextUtils.text(this.task)
    },
    description () {
      return this.fullDesc ? taskTextUtils.description(this.task) : taskTextUtils.description(this.task, this.maxDescLines)
    },
    descTruncated () {
      return this.description.lines.length >= this.maxDescLines
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
    target () {
      if (this.repoURL) return '_blank'
    },
    fileLink () {
      if (!this.repoURL) return '#'
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
    tagClicked (tag) {
      this.$emit('tag-clicked', {task: this.task, tag})
    },
    contextClicked (context) {
      this.$emit('context-clicked', {task: this.task, context})
    },
    textClicked (event) {
      this.$emit('text-clicked', event)
    },
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
<style lang="scss">
img.gravatar {
  border-radius: 50%;
  width: 25px;
}
.task-card {
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
    font-size: .9rem !important;
    .tags {
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }
  .toggle-full-desc {
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
      list-style: disc;
      li {
        input[type=checkbox] {
          margin-right: 1em;
          margin-left: -1.5em;
        }
      }
    }
  }
}
</style>
