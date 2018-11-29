<template lang="pug">
.detail
  .overflow-container
    .panel
      .panel-heading.has-text-left.has-text-weight-bold
        .columns
          .column.is-11(v-html="text")
          .column.is-1.delete-column
            button(class="delete" aria-label="close" v-on:click="close")
      .panel-block.is-block
        .columns
          .column.is-10.has-text-left.break-word
            a(:href="fileURL" target="_blank")
              b-icon(pack="fa" icon="file" size="is-small")
              span &nbsp;{{task.source.path}}:{{task.line}}
          .column.has-text-right
            a.button(v-if="allowUpdates" :href="fileEditLink" target="_blank" title="Edit on GitHub")
              b-icon(pack="fa" icon="pencil" size="is-small")
      .panel-block
        b-tabs(v-model="activeTab")
          b-tab-item(label="Comment")
            b-loading(:is-full-page="false" :active="isLoading")
            .columns
              .column.is-3.has-text-left.has-text-weight-bold List
              .column.is-9.has-text-left {{task.list}}
            .columns
              .column.is-3.has-text-left.has-text-weight-bold Description
              .column.is-9.has-text-left.task-description.break-word(v-html="description")
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
                input-tag.imdone-tags(v-if="allowUpdates" placeholder="Add Tag (e.g. debt, feature, perf)" v-model="tags" :validate="validateTag" :add-tag-on-keys="addTagKeys" tagClass="is-imdone-primary")
                .tags.imdone-tags(v-else)
                  .tag.is-info(v-for="tag in tags") {{tag}}
            .columns
              .column.is-3.has-text-left.has-text-weight-bold Context
              .column.is-9.has-text-left
                input-tag.imdone-tags(v-if="allowUpdates" placeholder="Add Context (e.g. aws, database, cache)" v-model="context"  :validate="validateTag" :add-tag-on-keys="addTagKeys" tagClass="is-info")
                .tags.imdone-tags(v-else)
                  .tag.is-info(v-for="ctx in context") {{ctx}}
            .level
              .level-left
              .level-right
                .level-item.has-text-right
                  button.button.is-imdone-primary(:disabled="saveDisabled" v-if="allowUpdates" v-on:click="saveTask")
                    span Save
          b-tab-item(v-if="allowUpdates" label="Linked Issues")
            linkIssues(:task="task"
              :repoURL="repoURL"
              :baseURL="baseURL"
              :allowUpdates="allowUpdates"
              :searchIssuesURL="searchIssuesURL"
              :createIssueURL="createIssueURL")

</template>
<script>
import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
import * as checkbox from 'markdown-it-checkbox'
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

const md = new MarkdownIt({html: true, breaks: true})
md.use(checkbox)

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
  props: ['task', 'repoURL', 'baseURL', 'allowUpdates', 'searchIssuesURL', 'createIssueURL'],
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
    }
  },
  computed: {
    commit () {
      return _.get(this, 'blame.commit')
    },
    commitLink () {
      return `${this.baseURL}/blob/${this.commit}/${this.task.source.path}#L${this.blame.line}`
    },
    fileURL: function () {
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
    text: function () {
      const html = md.render(this.task.getText({stripMeta: true, sanitize: true, stripTags: true, stripContext: true}))
      const $ = cheerio.load(html)
      $('a').attr('target', '_blank')
      return $.html()
    },
    description: function () {
      const description = _.clone(this.task.description)
      const text = this.task.getText({stripMeta: true, sanitize: true, stripTags: true, stripContext: true})
      const descriptionMD = description.join('\n')
      const sep = (description.length > 0 && (!description[0].trim() || description[0].trim().startsWith('-'))) ? `\n  \n` : ' '
      const html = md.render(`${text}${sep}${descriptionMD}`)
      const $ = cheerio.load(html)
      $('a').each(function () {
        $(this).attr('target', '_blank')
      })
      // TODO: Support updating task lists from UI id:36
      $('input[type=checkbox]').closest('li').css('list-style', 'none')
      $('input[type=checkbox]').attr('disabled', 'true')
      return $.html()
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
  background: #fff;
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
  .delete-column {
    padding-top: .9em;
  }
  .description {
    hr {
      margin: 1rem 0;
    }
  }
  .task-description {
    ul {
      list-style: disc;
    }
  }
  .imdone-tags {
    padding: 8px 8px 0px 8px;
  }
}

</style>
