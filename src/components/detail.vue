<template lang="pug">
.detail
  .overflow-container
    .panel.is-size-6.description
      .panel-heading.has-text-left.has-text-weight-bold
        .columns
          .column.is-11(v-html="text")
          .column.is-1
            button(class="delete" aria-label="delete" v-on:click="close")
      .panel-block.is-size-7
        .container
          .columns
            .column.is-3.has-text-left.has-text-weight-bold List
            .column.is-9.has-text-left {{task.list}}
          .columns
            .column.is-3.has-text-left.has-text-weight-bold Description
            .column.is-9.has-text-left.description(v-html="description")
          .columns
            .column.is-3.has-text-left.has-text-weight-bold Author
            .column.is-9.has-text-left {{blame.name}} - {{blame.email}}
          .columns(v-if="tags.length > 0")
            .column.is-3.has-text-left.has-text-weight-bold Tags
            .column.is-9.has-text-left
              .tags.imdone-tags
                .tag.is-success(v-for="tag in tags") {{tag}}
          .columns(v-if="contexts.length > 0")
            .column.is-3.has-text-left.has-text-weight-bold Context
            .column.is-9.has-text-left
              .tags.imdone-contexts
                .tag.is-info(v-for="context in contexts") {{context}}
          .columns
            .column.is-3.has-text-left.has-text-weight-bold File
            .column.is-9.has-text-left {{task.source.path}}:{{task.line}}
      .panel-block
        .container
          h2.has-text-left.has-text-weight-bold Metadata
          b-table.is-size-7(:data="metaData" :columns="columns")
</template>
<script>
import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
import * as checkbox from 'markdown-it-checkbox'
import Buefy from 'buefy'
const md = new MarkdownIt()
md.use(checkbox)

export default {
  name: 'imdone-detail',
  components: {
    'b-table': Buefy.Table
  },
  props: ['task', 'repoURL'],
  methods: {
    close () {
      this.$emit('close-detail')
    }
  },
  computed: {
    blame: function () {
      return this.task.blame || {name: 'Anonymous', email: 'anonymous-user@anon.com'}
    },
    text: function () {
      const html = md.render(this.task.getText({stripMeta: true, sanitize: true, stripTags: true, stripContext: true}))
      const $ = cheerio.load(html)
      $('a').attr('target', '_blank')
      return $.html()
    },
    tags: function () {
      return this.task.allTags
    },
    contexts: function () {
      return this.task.allContext
    },
    description: function () {
      const html = md.render(this.task.description.join('\n\n'))
      const $ = cheerio.load(html)
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
    columns: function () {
      return [
        {
          field: 'key',
          label: 'Key'
        },
        {
          field: 'value',
          label: 'Value'
        }
      ]
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
  .overflow-container {
    flex: 1;
    overflow-y: auto;
  }
  .panel {
    margin: .75rem;
  }
  .description {
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.17em; }
    h4 { font-size: 1.12em; }
    h5 { font-size: .83em; }
    h6 { font-size: .75em; }
    ul {
      list-style: disc;
    }
  }
}

</style>
