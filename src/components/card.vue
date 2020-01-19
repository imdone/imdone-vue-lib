<template lang="pug">
article.message.task-card(
  tabindex="0"
  @click="cardInFocus"
  @mouseover="activate"
  @mouseout="inactivate"
  @blur="inactivate"
  :class="clazz"
  v-bind="meta")
  //- .message-header
  //-   .task-text.has-text-left(v-html="text")
  .message-body.toggle-parent
    .tags.card-actions.is-size-6(v-show="isActive")
      .tag.is-white
        b-tooltip(label="Open file" position="is-left" type="is-info" :delay="500" :animated="true")
          a(@click="emitFileLink" :href="fileLink" :target="target")
            octicon(:icon="Octicons.link")
        b-tooltip(label="Edit card" position="is-left" type="is-info" :delay="500" :animated="true")
          a(@click.stop.prevent="showEdit")
            octicon(:icon="Octicons.pencil")
        b-tooltip(label="Delete card" position="is-left" type="is-info" :delay="500" :animated="true")
          a(@click.stop.prevent="showDelete")
            octicon(:icon="Octicons.trashcan")
        b-tooltip(v-for='link in links' :label='link.title' :key='link.icon' position="is-left" type="is-info" :delay="500" :animated="true")
          a.action-link(@click="textClicked" :href='link.href' target='_blank')
            b-icon.is-small(:pack='link.pack' :icon='link.icon')

      //- .level
      //-   .level-left
      //-   .level-right.toggle-parent
      //-     .level-item.is-info.toggle.actions(v-show="isActive")
      //-       a(@click="emitFileLink" :href="fileLink" :target="target" :title="`${task.source.path}:${task.line}`")
      //-         octicon(:icon="Octicons.link")
      //-       a(@click.stop.prevent="showEdit" title="Edit")
      //-         octicon(:icon="Octicons.pencil")
      //-       a(@click.stop.prevent="showDelete" title="Delete")
      //-         octicon(:icon="Octicons.trashcan")
      //-     .level-item(v-if="task.blame && task.blame.email")
      //-       img.gravatar(v-if="task.blame && task.blame.email" :src="gravatarURL" :title="name")
      //-       b-icon(v-else pack="fa" icon="user" size="is-small" title="No author found")
    .task-text.task-description.has-text-left(@click="textClicked" v-html="description.html" ref="description")
    .toggle-full-desc(v-if="descIsOverMax && fullDesc")
      b-tooltip(label="Collapse description" position="is-left" type="is-info" :delay="500" :animated="true")
        a(@click.stop="fullDesc = false")
          octicon(:icon="Octicons.fold")
    .toggle-full-desc(v-if="descIsOverMax && !fullDesc")
      b-tooltip(label="Expand description" position="is-left" type="is-info" :delay="500" :animated="true")
        a(@click.stop="fullDesc = true")
          octicon(:icon="Octicons.unfold")
    //- TODO:0 Display progress of task lists like [github](https://help.github.com/articles/about-task-lists/) id:37
    // - [Issues · imdone/imdone-vue-lib](https://github.com/imdone/imdone-vue-lib/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)
    // - [ ] Create vue component
    .tags.imdone-tags(v-if="tags.length > 0")
      b-tooltip(v-for="tag in tags" :key="tag" :label="`Filter by '${tag}'`" type="is-info" :delay="500" :animated="true")
        a.tag.is-imdone-primary(@click.stop='tagClicked(tag)') {{tag}}
    .tags.imdone-contexts(v-if="contexts.length > 0")
      b-tooltip(v-for="context in contexts" :key="context" :label="`Filter by '${context}'`" type="is-info" :delay="500" :animated="true")
        a.tag.is-info(@click.stop='contextClicked(context)') {{context}}
    .tags.due(v-if="due")
      .tag(:class="dueClass") Due {{dueDisplay}}
</template>
<script>
import * as gravatar from 'gravatar'
import { Icon } from 'buefy/dist/components/Icon'
import { Tooltip } from 'buefy/dist/components/ToolTip'
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
    'b-icon': Icon,
    'b-tooltip': Tooltip,
    Octicon
  },
  created () {
    this.fullDesc = this.expandByDefault
  },
  watch: {
    active: {
      immediate: true,
      handler (val) {
        // if (val) console.log('active:', {val, task: this.task, isMoved: this.task.isMoved})
        if (val && this.$el) this.$nextTick(() => this.$el.focus())
      }
    },
    task: {
      immediate: true,
      handler (val, oldVal) {
        // console.log('task:', {val, oldVal, isMoved: val.isMoved})
        if ((this.active && oldVal && val.index !== oldVal.index) || (this.active === false && !oldVal)) this.$nextTick(() => this.$el.focus())
        this.stopRefresh()
        this.startRefresh()
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
    dueClass () {
      if (this.due > new Date()) return 'is-warning'
      return 'is-danger'
    },
    links () {
      let links = []
      if (!this.task) return links
      const frontMatter = this.task.frontMatter
      if (frontMatter && frontMatter.links) {
        links = frontMatter.links.map(({pack, icon, title, href}) => {
          const { encodedText, encodedMD } = this.description
          const frontMatterCopy = {...frontMatter}
          frontMatterCopy.props.encodedText = encodedText
          frontMatterCopy.props.encodedMD = encodedMD
          frontMatterCopy.props.task = this.task
          href = taskTextUtils.formatDescription({frontMatter: frontMatterCopy}, href).description
          return {pack, icon, title, href}
        })
      }
      return links
    },
    clazz () {
      let clazz = this.task.customClass || 'is-info'
      // DOING:5 Move this to imdone-settings as task.customClass
      if (this.activeOrSelected) clazz += ' active'
      return clazz
    },
    meta () {
      const att = {}
      const meta = this.task.allMeta
      for (const key in meta) {
        att[`data-meta-${key}`] = meta[key].join(',')
      }
      return att
    },
    due () {
      return this.task.due && new Date(this.task.due)
    },
    dueDisplay () {
      return moment().to(moment(this.due))
    },
    description () {
      const task = this.task
      const desc = this.fullDesc ? taskTextUtils.description(task) : taskTextUtils.description(task, this.maxDescLines)
      desc.html += `<!-- Refresh count: ${this.count} -->`
      return desc
    },
    descTruncated () {
      return this.description.lines.length > this.maxDescLines
    },
    descIsOverMax () {
      return this.task && this.task.description && this.task.description.length + 1 > this.maxDescLines
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
      border-top: 1px solid;
      border-right: 1px solid;
      border-bottom: 1px solid;
    }
    // DOING:10 Set border color same as left border
    // border-color: #18a84f;
    // filter: brightness(93%)// hue-rotate(-90deg);
    // .tag {
    //   filter: hue-rotate(90deg);
    // }
  }
  .tags {
    color: #ffffff;
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
      }
      margin-bottom: .25rem;
    }
    .level {
      margin-top: 5px;
      .level-item {
        margin: 5px;
      }
    }
    .action-link {
      width: 12px;
      height: 18px;
      padding-left: .5em;
      padding-top: .10em;
    }
  }
  .message-body {
    // border-top: 1px solid transparent;
    // border-right: 1px solid transparent;
    // border-bottom: 1px solid transparent;
    background: inherit;
    word-break: break-word;
    text-align: left;
    padding: 2px 1em .35em 1em;
    font-size: .9rem !important;
    .tags {
      margin-top: .25rem;
      margin-bottom: 0;
      padding-bottom: 0;
      margin-right: .25rem;
      .b-tooltip {
        a {
          text-decoration: none;
        }
        margin-right: 5px;
        margin-bottom: .25rem;
      }

      .tag {
        margin-bottom: .25rem;
      }
    }
    .toggle-full-desc {
      position: relative;
      height: 1.5rem;
      span {
        position: absolute;
        bottom: 0;
        right: 0;
      }
    }
  }
  .task-text {
    margin-top: .5rem;
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
          margin-right: 1em;
          margin-left: -2em;
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
        border: 1px solid #ddd;
        padding: 6px 13px
    }

    tr {
        border-top: 1px solid #ccc
    }

    tr:nth-child(2n) {
        background-color: #f8f8f8
    }
  } 
}
</style>
