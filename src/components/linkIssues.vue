<template lang="pug">
.link-issues
  b-loading(:is-full-page="false" :active="isLoading")
  .columns
    .column.is-12
      b-table.is-size-7(v-if="taskIssues" :data="taskIssues")
        template(slot-scope="props")
          b-table-column(field="number" label="Number")
            a(:href="props.row.html_url" target="_blank") {{ props.row.number }}
          b-table-column(field="title" label="Title")
            a(:href="props.row.html_url" target="_blank") {{ props.row.title }}
          b-table-column.is-narrow.has-text-centered(field="state" label="State")
            span.icon(:class="stateText(props.row.state)")
              octicon(:icon="stateIcon(props.row.state)")
          b-table-column.is-narrow.has-text-centered(field="actions" label="Link")
            a.is-small(v-on:click="unlinkIssue(props.row)" :title="`unlink ${ props.row.number }`")
              b-icon.link-icon(pack="fa" icon="unlink" size="is-small")
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
    h3.subtitle.is-5.has-text-left Link Issues
    .level
      .level-left
        .level-item
          b-field(custom-class="is-small")
            p.control.is-expanded
              b-input(type="search" :placeholder="defaultSearch" size="is-small" v-model="userSearch" @keyup.native.enter="searchIssues(1)")
            p.control
              button.button.is-small.is-info(v-on:click="searchIssues(1)") Search
      .level-right
        .level-item
          button.button.is-success.is-small(v-on:click="toggleNewIssue") New Issue
    .columns(v-if="searchResults")
      .column.is-12
        b-table.is-size-7(:data="searchResults.items")
          template(slot-scope="props")
            b-table-column(field="number" label="Number")
              a(:href="props.row.html_url" target="_blank") {{ props.row.number }}
            b-table-column(field="title" label="Title")
              a(:href="props.row.html_url" target="_blank") {{ props.row.title }}
            b-table-column.is-narrow.has-text-centered(field="state" label="State")
              span.icon(:class="stateText(props.row.state)")
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
import * as _ from 'lodash'

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
      defaultSearch: 'is:issue is:open',
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
    this.taskIssues = this.task.issues
    this.linkIssuesActive = (this.taskIssues.length === 0)
    const parts = this.baseURL.split('/')
    this.repoFullName = `${parts[3]}/${parts[4]}`
  },
  watch: {
    task () {
      this.taskIssues = this.task.issues
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
      return state === 'open' ? 'has-text-success' : 'has-text-danger'
    },
    addIssue (issue) {
      this.task.addIssue(issue)
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
  },
  computed: {
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
  }
}
</script>
<style lang="scss">
.link-icon {
  i {
    margin-top: 10px;
  }
}
.loading-overlay {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  align-items: center;
  display: none;
  justify-content: center;
  overflow: hidden; }
  .loading-overlay.is-active {
    display: flex; }
  .loading-overlay.is-full-page {
    z-index: 999;
    position: fixed; }
    .loading-overlay.is-full-page .loading-icon:after {
      top: calc(50% - 2.5em);
      left: calc(50% - 2.5em);
      width: 5em;
      height: 5em; }
  .loading-overlay .loading-background {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    background: #7f7f7f;
    background: rgba(255, 255, 255, 0.5); }
  .loading-overlay .loading-icon {
    position: relative; }
    .loading-overlay .loading-icon:after {
      animation: spinAround 500ms infinite linear;
      border: 2px solid #dbdbdb;
      border-radius: 290486px;
      border-right-color: transparent;
      border-top-color: transparent;
      content: "";
      display: block;
      height: 1em;
      position: relative;
      width: 1em;
      position: absolute;
      top: calc(50% - 1.5em);
      left: calc(50% - 1.5em);
      width: 3em;
      height: 3em;
      border-width: 0.25em; }
</style>
