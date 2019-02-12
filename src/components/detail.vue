<template lang="pug">
.detail
  .overflow-container
    .panel
      .panel-heading.has-text-left.has-text-weight-bold
        .level
          .level-left.task-text
            .level-item(@click.prevent="textClicked" v-html="text")
          .level-right
            .level-item
              button(class="delete" aria-label="close" v-on:click="close")
      .panel-block.is-block
        .columns
          .column.is-10.has-text-left.break-word
            a.button(@click="emitFileLink" :href="fileURL" :target="target" :title="`Open ${fileLinkText}`")
              b-icon(pack="fa" icon="file" size="is-small")
              span &nbsp;{{fileLinkText}}
          .column.has-text-right
            a.button(v-if="allowUpdates && fileEditLink" @click="emitFileLink" :href="fileEditLink" target="_blank" title="`Edit ${fileLinkText} on GitHub`")
              b-icon(pack="fa" icon="pencil" size="is-small")
      .panel-block.is-block(v-if="allowUpdates && allowDetailUpdates")
        b-tabs(v-if="repoURL" v-model="activeTab")
          b-tab-item(label="Comment")
            b-loading(:is-full-page="false" :active="isLoading")
            .columns
              .column.is-3.has-text-left.has-text-weight-bold List
              .column.is-9.has-text-left {{task.list}}
            .columns
              .column.is-3.has-text-left.has-text-weight-bold Description
              .column.is-9.has-text-left.task-description.break-word(@click="textClicked" v-html="description" ref="description")
            .columns(v-if="blame && (blame.name || blame.email)")
              .column.is-3.has-text-left.has-text-weight-bold Author
              .column.is-9.has-text-left(v-if="blame.name") {{blame.name}} - #[a(:href="authorEmail" target="_blank" v-if="blame.email") {{blame.email}}]
            .columns(v-if="date")
              .column.is-3.has-text-left.has-text-weight-bold Date Added
              .column.is-9.has-text-left {{date}}
            .columns(v-if="commit")
              .column.is-3.has-text-left.has-text-weight-bold Commit
              .column.is-9.has-text-left #[a(:href="commitLink" target="_blank") {{commit.substring(0,7)}}]
            .columns
              .column.is-3.has-text-left.has-text-weight-bold Tags
              .column.is-9.has-text-left
                input-tag.imdone-tags(placeholder="Add Tag (e.g. debt, feature, perf)" v-model="tags" :validate="validateTag" :add-tag-on-keys="addTagKeys" tagClass="is-imdone-primary")
            .columns
              .column.is-3.has-text-left.has-text-weight-bold Context
              .column.is-9.has-text-left
                input-tag.imdone-tags(placeholder="Add Context (e.g. aws, database, cache)" v-model="context"  :validate="validateTag" :add-tag-on-keys="addTagKeys" tagClass="is-info")
            .level
              .level-left
              .level-right
                .level-item.has-text-right
                  button.button.is-imdone-primary(:disabled="saveDisabled" v-on:click="saveTask")
                    span Save
          b-tab-item(label="Linked Issues")
            linkIssues(:task="task"
              :repoURL="repoURL"
              :baseURL="baseURL"
              :allowUpdates="allowUpdates"
              :searchIssuesURL="searchIssuesURL"
              :createIssueURL="createIssueURL")
        div(v-else)
          b-loading(:is-full-page="false" :active="isLoading")
          .columns
            .column.is-3.has-text-left.has-text-weight-bold List
            .column.is-9.has-text-left {{task.list}}
          .columns
            .column.is-3.has-text-left.has-text-weight-bold Description
            .column.is-9.has-text-left.task-description.break-word(@click="textClicked" v-html="description" ref="description")
          .columns(v-if="blame && (blame.name || blame.email)")
            .column.is-3.has-text-left.has-text-weight-bold Author
            .column.is-9.has-text-left(v-if="blame.name") {{blame.name}} - #[a(:href="authorEmail" target="_blank" v-if="blame.email") {{blame.email}}]
          .columns(v-if="date")
            .column.is-3.has-text-left.has-text-weight-bold Date Added
            .column.is-9.has-text-left {{date}}
          .columns(v-if="commit")
            .column.is-3.has-text-left.has-text-weight-bold Commit
            .column.is-9.has-text-left #[a(:href="commitLink" target="_blank") {{commit.substring(0,7)}}]
          .columns
            .column.is-3.has-text-left.has-text-weight-bold Tags
            .column.is-9.has-text-left
              input-tag.imdone-tags(placeholder="Add Tag (e.g. debt, feature, perf)" v-model="tags" :validate="validateTag" :add-tag-on-keys="addTagKeys" tagClass="is-imdone-primary")
          .columns
            .column.is-3.has-text-left.has-text-weight-bold Context
            .column.is-9.has-text-left
              input-tag.imdone-tags(placeholder="Add Context (e.g. aws, database, cache)" v-model="context"  :validate="validateTag" :add-tag-on-keys="addTagKeys" tagClass="is-info")
          .level
            .level-left
            .level-right
              .level-item.has-text-right
                button.button.is-imdone-primary(:disabled="saveDisabled" v-on:click="saveTask")
                  span Save
      .panel-block.is-block(v-else)
        .columns
          .column.is-3.has-text-left.has-text-weight-bold List
          .column.is-9.has-text-left {{task.list}}
        .columns
          .column.is-3.has-text-left.has-text-weight-bold Description
          .column.is-9.has-text-left.task-description.break-word(@click="textClicked" v-html="description" ref="description")
        .columns(v-if="blame && (blame.name || blame.email)")
          .column.is-3.has-text-left.has-text-weight-bold Author
          .column.is-9.has-text-left(v-if="blame.name") {{blame.name}} - #[a(:href="authorEmail" target="_blank" v-if="blame.email") {{blame.email}}]
        .columns(v-if="date")
          .column.is-3.has-text-left.has-text-weight-bold Date Added
          .column.is-9.has-text-left {{date}}
        .columns(v-if="commit")
          .column.is-3.has-text-left.has-text-weight-bold Commit
          .column.is-9.has-text-left #[a(:href="commitLink" target="_blank") {{commit.substring(0,7)}}]
        .columns(v-if="hasTags")
          .column.is-3.has-text-left.has-text-weight-bold Tags
          .column.is-9.has-text-left
            .tags.imdone-tags
              .tag.is-imdone-primary(v-for="tag in tags") {{tag}}
        .columns(v-if="hasContext")
          .column.is-3.has-text-left.has-text-weight-bold Context
          .column.is-9.has-text-left
            .tags.imdone-tags
              .tag.is-info(v-for="ctx in context") {{ctx}}

</template>
<script>
import * as moment from 'moment'
import LinkIssues from '@/components/linkIssues'
import { Icon } from 'buefy/dist/components/Icon'
import { Tabs, TabItem } from 'buefy/dist/components/Tabs'
import { Tag } from 'buefy/dist/components/Tag'
import { Loading } from 'buefy/dist/components/Loading'
import * as _ from 'lodash'
import axios from 'axios'
import InputTag from '@/components/InputTag'
import compare from 'just-compare'
import taskTextUtils from '../utils/task-text-utils'

export default {
  name: 'imdone-detail',
  components: {
    'b-icon': Icon,
    'b-tabs': Tabs,
    'b-tab-item': TabItem,
    'b-tag': Tag,
    'b-loading': Loading,
    LinkIssues,
    InputTag
  },
  props: ['task', 'repoURL', 'baseURL', 'allowUpdates', 'allowDetailUpdates', 'searchIssuesURL', 'createIssueURL'],
  data () {
    return {
      activeTab: 0,
      linkIssuesActive: false,
      tags: this.task.tags,
      context: this.task.context,
      addTagKeys: [13, 188, 32],
      saveDisabled: true,
      isLoading: false,
      lastError: null,
      repoFullName: null
    }
  },
  created () {
    if (!this.baseURL) return
    const parts = this.baseURL.split('/')
    this.repoFullName = `${parts[3]}/${parts[4]}`
  },
  watch: {
    task () {
      this.tags = this.task.tags
      this.context = this.task.context
    },
    tags () {
      this.saveDisabled = !this.shouldBeSaved()
    },
    context () {
      this.saveDisabled = !this.shouldBeSaved()
    }
  },
  methods: {
    setLoading (val) {
      this.isLoading = val
    },
    close () {
      this.$emit('close-detail')
    },
    validateTag (tag) {
      return /^\S+$/i.test(tag)
    },
    shouldBeSaved () {
      const tags = [...this.tags]
      const taskTags = [...this.task.tags]
      const tagsSame = compare(tags, taskTags)
      const ctx = [...this.context]
      const taskCtx = [...this.task.context]
      const ctxSame = compare(ctx, taskCtx)
      return !(tagsSame && ctxSame)
    },
    saveTask () {
      this.setLoading(true)
      this.task.tags = this.tags
      this.task.context = this.context
      this.updateTask()
      .catch(error => {
        this.lastError = error
      })
      .then(() => {
        this.setLoading(false)
      })
    },
    updateTask () {
      return axios.put(`/api/1.0/board/${this.repoFullName}/task`, this.task)
    },
    emitFileLink () {
      this.$emit('file-link', this.task)
    },
    textClicked (event) {
      if (event.target.type !== 'checkbox') event.preventDefault()
      this.$emit('text-clicked', {event, task: this.task, description: this.$refs.description})
    }
  },
  computed: {
    hasTags () {
      return this.tags.length > 0
    },
    hasContext () {
      return this.context.length > 0
    },
    fileLinkText () {
      return `${this.task.source.path}:${this.task.line}`
    },
    target () {
      if (this.repoURL) return '_blank'
    },
    commit () {
      return _.get(this, 'blame.commit')
    },
    commitLink () {
      return `${this.baseURL}/blob/${this.commit}/${this.task.source.path}#L${this.blame.line}`
    },
    fileURL: function () {
      if (!this.repoURL) return '#'
      return `${this.repoURL}${this.task.source.path}#L${this.task.line}`
    },
    blame: function () {
      return this.task.blame
    },
    date () {
      if (!_.get(this, 'blame.date')) return
      return moment(this.blame.date).format('lll')
    },
    authorEmail: function () {
      return `mailto:${this.blame.email}`
    },
    text () {
      return taskTextUtils.text(this.task)
    },
    description () {
      return taskTextUtils.description(this.task).html
    },
    metaData: function () {
      const meta = []
      const allMeta = this.task.allMeta
      for (let key in allMeta) {
        meta.push({key, value: allMeta[key].join(',')})
      }
      return meta
    },
    fileEditLink () {
      if (!this.repoURL) return
      const repoEditURL = this.repoURL.replace('/blob/', '/edit/')
      return `${repoEditURL}${this.task.source.path}#L${this.task.line}`
    }
  }
}
</script>
<style lang="scss">
.detail {
  display: flex;
  flex: 1;
  min-height: 0;
  max-height: 100vh;
  font-size: .9rem;
  .b-tabs {
    width: 100%;
  }
  .break-word {
    word-break: break-word
  }
  .overflow-container {
    flex: 1;
    overflow-y: auto;
  }
  .panel {
    margin: .75rem;
  }
  .task-text {
    max-width: 90%;
    display: block;
  }
  .task-description {
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
  .imdone-tags {
    padding: 8px 8px 0px 8px;
  }
}

</style>
