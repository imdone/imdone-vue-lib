<template lang="pug">
article.message.task-card(
  tabindex="0"
  @click="cardInFocus"
  @mouseover="activate"
  @mouseout="inactivate"
  @blur="inactivate"
  :class="clazz"
  v-bind="meta")
  .message-body.toggle-parent
    .tags.card-actions.is-size-6(v-show="isActive")
      .tag
        b-tooltip(label="Open file" position="is-left" type="is-info" :delay="500" :animated="true")
          a(@click="emitFileLink" :href="fileLink" :target="target")
            octicon(:icon="Octicons.link")
        b-tooltip(label="Edit card" position="is-left" type="is-info" :delay="500" :animated="true")
          a(@click.stop.prevent="showEdit")
            octicon(:icon="Octicons.pencil")
        b-tooltip(label="Delete card" position="is-left" type="is-info" :delay="500" :animated="true")
          a(@click.stop.prevent="showDelete")
            octicon(:icon="Octicons.trashcan")
        b-tooltip(v-for='link, i in links' :label='link.title' :key='link.icon + i' position="is-left" type="is-info" :delay="500" :animated="true")
          a.action-link(@click="textClicked" :href='link.href || null' :data-action='link.action || null' :target='link.href ? "_blank" : null')
            b-icon.is-medium(:pack='link.pack' :icon='link.icon')
    .task-progress.columns(v-if="tasksTotal")
      .column.is-2.progress-ratio
        i.far.fa-check-square.is-small(style="color:gray;") 
        | &nbsp;{{tasksCompleted}}/{{tasksTotal}}
      .column
        progress.progress.is-small(:class="progressClass" :value="tasksCompleted" :max="tasksTotal")
    .task-text.task-description.has-text-left(@click="textClicked" v-html="description.html" ref="description")
    .tags.imdone-tags(v-if="tags.length > 0")
      b-tooltip(v-for="tag in tags" :key="tag" :label="`Filter by '${tag}'`" type="is-info" :delay="500" :animated="true")
        a.tag.is-imdone-primary(@click.stop='tagClicked(tag)') {{tag}}
    .tags.imdone-contexts(v-if="contexts.length > 0")
      b-tooltip(v-for="context in contexts" :key="context" :label="`Filter by '${context}'`" type="is-info" :delay="500" :animated="true")
        a.tag.is-info(@click.stop='contextClicked(context)') {{context}}
    .tags.completed(v-if="completed")
      .tag(:class="completedClass") Completed {{completedDisplay}}
    .tags.due(v-else-if="due")
      .tag(:class="dueClass") Due {{dateDisplay(due)}}
    .imdone-meta(v-if="meta.length > 0")
      span(v-for="pair in meta" :key="`${task.id}-${pair.key}`")
        b-tooltip(v-for="value, index in pair.values" :key="`${task.id}-${pair.key}-${index}`" :label="`Filter by '${pair.key}:${value}'`" type="is-info" :delay="500" :animated="true")
          a.tags.has-addons(@click.stop='metaClicked(pair.key, value)')
            span.tag.is-grey {{pair.key}}
            span.tag {{displayMeta(pair.key, value)}}
    .toggle-full-desc(v-if="descIsOverMax && fullDesc")
      b-tooltip(label="Collapse description" position="is-left" type="is-info" :delay="500" :animated="true")
        a(@click.stop="fullDesc = false")
          octicon(:icon="Octicons.chevronUp")
    .toggle-full-desc(v-if="descIsOverMax && !fullDesc")
      b-tooltip(label="Expand description" position="is-left" type="is-info" :delay="500" :animated="true")
        a(@click.stop="fullDesc = true")
          octicon(:icon="Octicons.chevronDown")

</template>
<script>
import * as gravatar from 'gravatar'
import { Icon } from 'buefy/dist/components/icon'
import { Tooltip } from 'buefy/dist/components/tooltip'
import Octicon, { Octicons } from 'octicons-vue'
import taskTextUtils from '../utils/task-text-utils'
import moment from 'moment'

export default {
  name: 'imdone-card',
  props: ['task', 'selectedTask', 'activeTask', 'repoURL', 'allowUpdates', 'showFileLinks', 'config', 'maxLines'],
  data () {
    return {
      maxDescLines: 6,
      Octicons,
      fullDesc: false,
      isActive: false,
      refreshId: null,
      refreshInterval: null,
      count: 0
    }
  },
  components: {
    Icon,
    Tooltip,
    Octicon
  },
  created () {
    this.fullDesc = this.expandByDefault
  },
  mounted () {
    this.highlightCodeBlocks()
  },
  updated () {
    this.highlightCodeBlocks()
  },
  watch: {
    active: {
      immediate: true,
      handler (val) {
        if (val && this.$el) this.$el.focus()
      }
    },
    task: {
      immediate: true,
      handler (val, oldVal) {
        if ((this.active && oldVal && val.index !== oldVal.index) || (this.active === false && !oldVal)) this.$nextTick(() => this.$el.focus())
        this.stopRefresh()
        this.startRefresh()
        if (!val || !oldVal) return
        if ((!val.meta.expand && oldVal.meta.expand) || (val.meta.expand && !oldVal.meta.expand)) this.fullDesc = this.expandByDefault
      }
    },
    maxLines: {
      immediate: true,
      handler (val, oldVal) {
        this.maxDescLines = this.maxLines || 6
      }
    }
  },
  computed: {
    progressClass () {
      return (this.tasksCompleted === this.taskTotal) ? 'is-success' : 'is-info'
    },
    tasksCompleted () {
      return this.task.progress.completed
    },
    tasksTotal () {
      return this.task.progress.total
    },
    links () {
      let links = []
      if (!this.task) return links
      const frontMatter = this.task.frontMatter
      if (frontMatter && frontMatter.links) {
        links = frontMatter.links.map(({pack, icon, title, href, action}) => {
          const { encodedText, encodedMD } = this.description
          const frontMatterCopy = {props: {}, ...frontMatter}
          frontMatterCopy.props.encodedText = encodedText
          frontMatterCopy.props.encodedMD = encodedMD
          href = taskTextUtils.formatDescription({frontMatter: frontMatterCopy}, href).description
          action = taskTextUtils.formatDescription({...this.task, frontMatter: frontMatterCopy}, action).description
          title = taskTextUtils.formatDescription({...this.task, frontMatter: frontMatterCopy}, title).description
          return {pack, icon, title, href, action}
        })
      }
      return links
    },
    clazz () {
      let clazz = this.task.customClass || 'is-info'
      //- DOING:5 Move this to imdone-settings as task.customClass
      if (this.activeOrSelected) clazz += ' active'
      return clazz
    },
    meta () {
      return Object.keys(this.task.allMeta)
        .filter(key => key !== 'due')
        .sort()
        .map(key => ({key, values: this.task.allMeta[key]}))
    },
    due () {
      return this.task.due && new Date(this.task.due)
    },
    dueClass () {
      if (this.due > new Date()) return 'is-warning'
      return 'is-danger'
    },
    completed () {
      return this.task.completed && new Date(this.task.completed)
    },
    completedDisplay () {
      return moment().to(moment(this.completed))
    },
    completedClass () {
      if (this.due && (this.completed > this.due)) return 'is-danger'
      return 'is-imdone-primary'
    },
    description () {
      const task = this.task
      const desc = this.fullDesc ? taskTextUtils.description(task) : taskTextUtils.description(task, this.maxDescLines)
      desc.html += `<!-- Refresh count: ${this.count} -->`
      return desc
    },
    cardMarkdown () {
      return taskTextUtils.getCardMarkdown(this.task)
    },
    descIsOverMax () {
      return this.task && this.task.description && this.cardMarkdown.totalLines > this.maxDescLines
    },
    expandByDefault () {
      return this.task && this.task.meta && this.task.meta.expand && this.task.meta.expand.length > 0
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
    active () {
      return (this.activeTask && this.activeTask.id === this.task.id)
    },
    activeOrSelected () {
      return this.active || this.selected
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
    dateDisplay (date) {
      return moment().to(moment(date))
    },
    displayMeta (key, value) {
      if (['created', 'completed'].includes(key)) return (new Date(value)).toLocaleString()
      return value
    },
    highlightCodeBlocks () {
      if (window.Prism) {
        try {
          window.Prism.highlightAllUnder(this.$refs.description)
        } catch (e) {
          // console.error('Trouble highlighting code block', e)
        }
      }
    },
    startRefresh () {
      if (this.task.meta.refresh) {
        this.refreshInterval = parseInt(this.task.meta.refresh[0])
      } else if (this.task.frontMatter && this.task.frontMatter.refresh) {
        this.refreshInterval = this.task.frontMatter.refresh
      }
      this.$nextTick(() => {
        if (this.refreshInterval) this.refreshId = setInterval(this.increment, this.refreshInterval)
      })
    },
    stopRefresh () {
      if (this.refreshId) {
        clearInterval(this.refreshId)
        this.refreshId = null
      }
      if (this.refreshInterval) this.refreshInterval = null
    },
    increment () {
      this.count++
    },
    cardInFocus () {
      if (!this.active) this.$emit('card-in-focus', {task: this.task})
    },
    activate () {
      this.isActive = true
    },
    inactivate () {
      this.isActive = false
    },
    inactivateUnlessInFocus () {
      if (!this.isActive) this.inactivate()
    },
    metaClicked (key, value) {
      this.$emit('meta-clicked', {task: this.task, meta: {key, value}})
    },
    tagClicked (tag) {
      this.$emit('tag-clicked', {task: this.task, tag})
    },
    contextClicked (context) {
      this.$emit('context-clicked', {task: this.task, context})
    },
    textClicked (event) {
      if (event.target.type !== 'checkbox') event.preventDefault()
      this.$emit('text-clicked', {event, task: this.task, description: this.$refs.description})
    },
    showDetail (event) {
      this.$emit('show-detail', this.task)
    },
    showEdit (event) {
      this.$emit('show-edit', this.task)
    },
    showDelete (event) {
      this.$emit('show-delete', this.task)
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
  background: inherit;
  position: relative;
  cursor: -webkit-grab;
  padding: 1px 1px 1px 0;
  &:focus {
    outline: none;
  }
  &:not(:last-child) {
    margin-bottom: .75em;
  }
  &.active {
    padding: 0;
    .message-body {
      outline: none;
      border-top: 1px solid;
      border-right: 1px solid;
      border-bottom: 1px solid;
    }
  }
 .toggle {
    background: inherit;
    opacity: 0.8;
  }
  .toggle-parent {
    background: inherit;
  }
  .card-actions {
    position: absolute;
    top: 2px;
    right: .25rem;
    .tag {
      a {
        text-decoration: none;
        margin-right: 5px;
        .icon {
          &.is-medium {
            width: 1.5rem;
          }
        }
      }
      margin-bottom: .25rem;
      padding-right:0;
    }
    a.tags {
      text-decoration: none;
    }
  .level {
      margin-top: 5px;
      .level-item {
        margin: 5px;
      }
    }
  }
  .message-body {
    background: inherit;
    word-break: break-word;
    text-align: left;
    padding: 2px 1em .35em 1em;
    font-size: .9rem !important;
    .task-progress {
      margin: .5em 0 0 0;
      padding: 0;
      .progress-ratio {
        font-size: .8em;
        line-height: 2em;
        width: 4em;
      }
      .column {
        padding: 0;
      }
      .progress {
        height: .5em;
        margin-bottom: .5em;
        margin-top: .5em;
      }
    }
    .tags {
      margin-top: .25rem;
      margin-bottom: 0;
      padding-bottom: 0;
      margin-right: .25rem;
      .b-tooltip {
        a {
          text-decoration: none;
        }
      }
      .tag {
        margin-right: 5px;
        margin-bottom: .25rem;
      }
      span.tag {
        margin-right: 0;
      }
      &.has-addons {
        margin-right: 5px;
      }
    }
    .toggle-full-desc {
      text-align: center;
      position: relative;
      height: 1rem;
      margin-top: -.4em;
    }
  }
  .task-text {
    hr {
      height: 1px;
      margin: .5rem 0;
    }
    margin-top: .25rem;
    margin-bottom: .5em;
    blockquote {
      margin-left: 1em;
      font-style: italic;
    }
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
    ol {
      margin-left: 1em;
    }
    ul {
      margin-left: 1.2em;
      list-style: disc;
      li {
        input[type=checkbox] {
          margin-right: .6em;
          margin-left: -1.6em;
        }
      }
    }
  }
  .task-description {
    table {
        border-collapse: collapse;
        border-spacing: 0;
        display: block;
        margin-bottom: 1rem;
        overflow: auto;
        width: 100%
    }

    th {
        font-weight: 700
    }

    td, th {
        padding: 6px 13px
    }

    .number {
      background-color: inherit !important;
      border-radius: none !important;
      font-size: inherit !important;
      height: inherit !important;
      padding: 0;
      justify-content: baseline;
      min-width: 0;
      margin-right: 0;
    }
    .code-toolbar {
      text-align: right;
      font-size: .9em;
    }
    pre[class*="language-"] {
      margin-bottom: .25em;
      margin-top: .5em;
      &>code {
        font-size: .9em;
        margin: 0;
      }
    }
  } 
}
</style>
