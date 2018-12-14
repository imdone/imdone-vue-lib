<template lang="pug">
.link-issues
  b-loading(:is-full-page="false" :active="isLoading")
  .columns
    .column.is-12
      b-table(v-if="hasTaskIssues" :data="taskIssues")
        template(slot-scope="props")
          b-table-column(field="number" label="#")
            a(:href="props.row.html_url" target="_blank") {{ props.row.number }}
          b-table-column(field="title" label="Title")
            a(:href="props.row.html_url" target="_blank") {{ props.row.title }}
          b-table-column.is-narrow.has-text-centered(field="state" label="State")
            span.icon(:class="stateText(props.row.state)" :title="props.row.state")
              octicon(:icon="stateIcon(props.row.state)")
          b-table-column.is-narrow.has-text-centered(field="actions" label="Link")
            a.is-small(v-on:click="unlinkIssue(props.row)" :title="`unlink ${ props.row.number }`")
              b-icon.link-icon(pack="fa" icon="unlink" size="is-small")
  //- TODO: This should cover the whole link issues tab id:39 +enhancement
  newIssue(v-if="newIssueShown && allowUpdates"
    :task="task"
    :repoURL="repoURL"
    :baseURL="baseURL"
    :allowUpdates="allowUpdates"
    :createIssueURL="createIssueURL"
    v-on:cancel="toggleNewIssue"
    v-on:new-issue="linkIssue"
    v-on:loading="setLoading")
  .issue-search(v-if="!newIssueShown && allowUpdates")
    h3.subtitle.is-5.has-text-left Add Issue
    .columns
      .column.is-8
        b-field
          p.control.is-expanded
            b-input(class="is-full-width" type="search" :placeholder="defaultSearch" v-model="userSearch" @keyup.native.enter="searchIssues(1)")
          p.control
            button.button.is-info(v-on:click="searchIssues(1)") Search
      .column.is-4
        button.button.is-pulled-right.is-imdone-primary(v-on:click="toggleNewIssue") New Issue
    .columns(v-if="hasSearchResults")
      .column.is-12
        b-table(:data="searchResults.items")
          template(slot-scope="props")
            b-table-column(field="number" label="#")
              a(:href="props.row.html_url" target="_blank") {{ props.row.number }}
            b-table-column(field="title" label="Title")
              a(:href="props.row.html_url" target="_blank") {{ props.row.title }}
            b-table-column.is-narrow.has-text-centered(field="state" label="State")
              span.icon(:class="stateText(props.row.state)" :title="props.row.state")
                octicon(:icon="stateIcon(props.row.state)")
            b-table-column.is-narrow.has-text-centered(field="actions" label="Link")
              a.is-small(v-if="!hasIssue(props.row)" v-on:click="linkIssue(props.row)" :title="`link ${ props.row.number }`")
                b-icon.link-icon(pack="fa" icon="link" size="is-small")
              a.is-small(v-if="hasIssue(props.row)" v-on:click="unlinkIssue(props.row)" :title="`unlink ${ props.row.number }`")
                b-icon.link-icon(pack="fa" icon="unlink" size="is-small")
        b-pagination(
          v-if="searchResults.total_count > perPage"
          :total="searchResults.total_count"
          :current.sync="currentPage"
          size="is-small"
          order="is-centered"
          iconPack="fa"
          :per-page="perPage")

</template>
<script>
import { Icon } from 'buefy/dist/components/Icon'
import { Table, TableColumn } from 'buefy/dist/components/Table'
import { Tag } from 'buefy/dist/components/Tag'
import { Field } from 'buefy/dist/components/Field'
import { Select } from 'buefy/dist/components/Select'
import { Input } from 'buefy/dist/components/Input'
import { Pagination } from 'buefy/dist/components/Pagination'
import { Loading } from 'buefy/dist/components/Loading'
import axios from 'axios'
import Octicon, { Octicons } from 'octicons-vue'
import newIssue from '@/components/newIssue'
import _ from 'lodash'

export default {
  name: 'imdone-link-issues',
  components: {
    'b-table': Table,
    'b-table-column': TableColumn,
    'b-icon': Icon,
    'b-tag': Tag,
    'b-field': Field,
    'b-select': Select,
    'b-input': Input,
    'b-pagination': Pagination,
    'b-loading': Loading,
    Octicon,
    newIssue
  },
  props: ['task', 'repoURL', 'baseURL', 'allowUpdates', 'searchIssuesURL', 'createIssueURL'],
  data () {
    return {
      activeTab: 0,
      Octicons,
      defaultSearch: 'type:issue is:open',
      userSearch: null,
      searchResults: null,
      searchResponse: null,
      taskIssues: [],
      repoFullName: null,
      newIssueShown: false,
      currentPage: 1,
      perPage: 8,
      isLoading: false,
      lastError: null
    }
  },
  created () {
    if (!this.searchResults) this.searchIssues()
    if (!this.task.issues) this.task.issues = []
    this.taskIssues = this.task.issues
    this.linkIssuesActive = (this.taskIssues.length === 0)
    const parts = this.baseURL.split('/')
    this.repoFullName = `${parts[3]}/${parts[4]}`
  },
  computed: {
    hasTaskIssues () {
      return this.taskIssues && this.taskIssues.length > 0
    },
    hasSearchResults () {
      return this.searchResults && this.searchResults.items.length > 0
    },
    searchString () {
      return this.userSearch || this.defaultSearch
    },
    showLinkIssues () {
      return this.allowUpdates && !this.linkIssuesActive
    },
    issues () {
      return this.task.issues
    },
    commit () {
      return _.get(this, 'blame.commit')
    },
    blame: function () {
      return this.task.blame
    }
  },
  watch: {
    task () {
      this.taskIssues = this.task.issues || []
      this.linkIssuesActive = (this.taskIssues.length === 0)
    },
    currentPage () {
      this.searchIssues()
    }
  },
  methods: {
    setLoading (val) {
      this.isLoading = val
    },
    toggleNewIssue () {
      this.newIssueShown = !this.newIssueShown
    },
    searchIssues (page) {
      if (page) this.currentPage = page
      axios.get(`${this.searchIssuesURL}?per_page=${this.perPage}&q=${this.searchString}&page=${this.currentPage}`)
      .then(response => {
        this.searchResponse = response
        this.searchResults = response.data
      })
    },
    stateIcon (state) {
      return state === 'open' ? Octicons.issueOpened : Octicons.issueClosed
    },
    stateText (state) {
      return state === 'open' ? 'has-text-imdone-primary' : 'has-text-danger'
    },
    addIssue (issue) {
      this.task.addIssue(issue)
      if (!this.task.issues) this.task.issues = []
      this.task.issues = [...this.task.issues, issue]
      this.taskIssues = this.task.issues
    },
    removeIssue (issue) {
      this.task.removeIssue(issue)
      this.task.issues = this.task.issues.filter(i => i.number !== issue.number)
      this.taskIssues = this.task.issues
    },
    linkIssue (issue) {
      this.setLoading(true)
      this.addIssue(issue)
      this.updateTask()
      .catch(error => {
        this.lastError = error
        this.removeIssue(issue)
      })
      .then(() => {
        this.setLoading(false)
      })
    },
    unlinkIssue (issue) {
      this.setLoading(true)
      this.removeIssue(issue)
      this.updateTask()
      .catch(error => {
        this.lastError = error
        this.addIssue(issue)
      })
      .then(() => {
        this.setLoading(false)
      })
    },
    updateTask () {
      return axios.put(`/api/1.0/board/${this.repoFullName}/task`, this.task)
    },
    hasIssue (issue) {
      return this.task.hasIssueNumber(issue.number)
    }
  }
}
</script>
<style lang="scss">
.link-icon {
  i {
    margin-top: 10px;
  }
}
</style>
