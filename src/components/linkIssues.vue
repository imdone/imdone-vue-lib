<template lang="pug">
.link-issues
  .columns
    .column.is-12
      b-table.is-size-7(v-if="taskIssues" :data="taskIssues")
        template(slot-scope="props")
          b-table-column(field="number" label="Number")
            a(:href="props.row.html_url" target="_blank") {{ props.row.number }}
          b-table-column(field="title" label="Title")
            a(:href="props.row.html_url" target="_blank") {{ props.row.title }}
          b-table-column.is-narrow.has-text-centered(field="state" label="State")
            b-tag.has-text-weight-bold(:class="stateText(props.row.state)")
              octicon(:icon="stateIcon(props.row.state)")
              span.is-capitalized &nbsp;{{ props.row.state }}
          b-table-column.is-narrow.has-text-centered(field="actions")
            a.is-small(v-on:click="unlinkIssue(props.row)" :title="`unlink ${ props.row.number }`")
              b-icon(pack="fa" icon="unlink" size="is-small")
  h3.subtitle.is-4.has-text-left Link Issues
  newIssue(v-if="newIssueShown" :task="task" :repoURL="repoURL" :baseURL="baseURL" :allowUpdates="allowUpdates" v-on:cancel="toggleNewIssue")
  .issue-search(v-else)
    .columns
      .column.is-9
        b-field(custom-class="is-small")
          b-select(placeholder="Filters" size="is-small")
            option Open issues and PRs
            option Your Issues
            option Your PRs
            option Assigned to you
            option Mentioning you
          b-input(type="search" :placeholder="defaultSearch" size="is-small" v-model="userSearch" @keyup.native.enter="searchIssues")
      .column.is-3.has-text-right
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
              b-tag.has-text-weight-bold(:class="stateText(props.row.state)")
                octicon(:icon="stateIcon(props.row.state)")
                span.is-capitalized &nbsp;{{ props.row.state }}
            b-table-column.is-narrow.has-text-centered(field="actions")
              a.is-small(v-if="!hasIssue(props.row)" v-on:click="linkIssue(props.row)" :title="`link ${ props.row.number }`")
                b-icon(pack="fa" icon="link" size="is-small")
              a.is-small(v-if="hasIssue(props.row)" v-on:click="unlinkIssue(props.row)" :title="`unlink ${ props.row.number }`")
                b-icon(pack="fa" icon="unlink" size="is-small")

</template>
<script>
import Buefy from 'buefy'
import axios from 'axios'
import Octicon, { Octicons } from 'octicons-vue'
import newIssue from '@/components/newIssue'
import * as _ from 'lodash'

export default {
  name: 'imdone-link-issues',
  components: {
    'b-table': Buefy.Table,
    'b-table-column': Buefy.TableColumn,
    'b-icon': Buefy.Icon,
    'b-tag': Buefy.Tag,
    'b-field': Buefy.Field,
    'b-select': Buefy.Select,
    'b-input': Buefy.Input,
    Octicon,
    newIssue
  },
  props: ['task', 'repoURL', 'baseURL', 'allowUpdates', 'searchIssuesURL'],
  data () {
    return {
      activeTab: 0,
      Octicons,
      defaultSearch: 'is:issue is:open',
      userSearch: null,
      searchResults: null,
      taskIssues: [],
      repoFullName: null,
      newIssueShown: false
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
    }
  },
  methods: {
    toggleNewIssue () {
      this.newIssueShown = !this.newIssueShown
    },
    searchIssues () {
      axios.get(`${this.searchIssuesURL}?per_page=8&q=${this.searchString}`)
      .then(response => {
        this.searchResults = response.data
      })
    },
    stateIcon (state) {
      return state === 'open' ? Octicons.issueOpened : Octicons.issueClosed
    },
    stateText (state) {
      return state === 'open' ? 'is-success' : 'is-danger'
    },
    linkIssue (issue) {
      this.task.addIssue(issue)
      this.task.issues = [...this.task.issues, issue]
      this.taskIssues = this.task.issues
      this.updateTask()
    },
    unlinkIssue (issue) {
      this.task.removeIssue(issue)
      this.task.issues = this.task.issues.filter(i => i.number !== issue.number)
      this.taskIssues = this.task.issues
      this.updateTask()
    },
    updateTask () {
      axios.put(`/api/1.0/board/${this.repoFullName}/task`, this.task)
      .then(response => {
        console.log(response)
      })
      .catch(err => {
        console.log(err)
      })
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
