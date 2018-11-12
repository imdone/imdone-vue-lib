<template lang="pug">
.link-issues
  .columns
    .column.is-12
      b-table.is-size-7(v-if="issues" :data="issues")
        template(slot-scope="props")
          b-table-column(field="number" label="Number")
            a(:href="props.row.html_url" target="_blank") {{ props.row.number }}
          b-table-column(field="title" label="Title")
            a(:href="props.row.html_url" target="_blank") {{ props.row.title }}
          b-table-column.is-narrow.has-text-centered(field="state" label="State")
            b-tag.has-text-weight-bold(:class="stateText(props.row.state)")
              octicon(:icon="stateIcon(props.row.state)")
              span.is-capitalized &nbsp;{{ props.row.state }}
  .columns
    .column.is-12.has-text-right(v-if="linkIssuesActive")
      a.button.is-small(v-on:click="toggleLinkIssues" title="hide")
        b-icon(pack="fa" icon="share-alt" size="is-small")
        span Hide Link Issues
    .column.is-12.has-text-right
      a.button.is-small(v-if="showLinkIssues" v-on:click="toggleLinkIssues" title="link to issue")
        b-icon(pack="fa" icon="share-alt" size="is-small")
        span Link Issues
  div(v-if="linkIssuesActive")
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
        button.button.is-success.is-small New Issue
    .columns(v-if="searchResults")
      .column.is-12
        b-table.is-size-7(:data="searchResults")
          template(slot-scope="props")
            b-table-column(field="number" label="Number")
              a(:href="props.row.html_url" target="_blank") {{ props.row.number }}
            b-table-column(field="title" label="Title")
              a(:href="props.row.html_url" target="_blank") {{ props.row.title }}
            b-table-column.is-narrow.has-text-centered(field="state" label="State")
              b-tag.has-text-weight-bold(:class="stateText(props.row.state)")
                octicon(:icon="stateIcon(props.row.state)")
                span.is-capitalized &nbsp;{{ props.row.state }}
</template>
<script>
import Buefy from 'buefy'
import axios from 'axios'
import Octicon, { Octicons } from 'octicons-vue'
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
    Octicon
  },
  props: ['task', 'repoURL', 'baseURL', 'allowUpdates', 'searchIssuesURL'],
  data () {
    return {
      activeTab: 0,
      Octicons,
      linkIssuesActive: false,
      defaultSearch: 'is:issue is:open',
      userSearch: null,
      searchResults: null
    }
  },
  created () {
    if (!this.searchResults) this.searchIssues()
  },
  methods: {
    searchIssues () {
      debugger
      console.log('searching for issues')
      axios.get(`${this.searchIssuesURL}?q=${this.searchString}`)
      .then(response => {
        this.searchResults = response.data.items
      })
    },
    stateIcon (state) {
      return state === 'open' ? Octicons.issueOpened : Octicons.issueClosed
    },
    stateText (state) {
      return state === 'open' ? 'is-success' : 'is-danger'
    },
    toggleLinkIssues () {
      this.linkIssuesActive = !this.linkIssuesActive
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
    },
    columns () {
      return [
        {
          field: 'number',
          label: 'Number'
        },
        {
          field: 'title',
          label: 'Title'
        }
      ]
    }
  }
}
</script>
