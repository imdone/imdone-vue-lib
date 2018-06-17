<template lang="pug">
  .panel.is-size-6.description
    .panel-heading.has-text-left.is-size-5(v-html="text")
    .panel-block
      .container
        .columns
          .column.is-4.has-text-left Author
          .column.is-8.has-text-left {{blame.name}} - {{blame.email}}
        .columns
          .column.is-4.has-text-left Description
          .column.is-8.has-text-left(v-html="description")
        .columns
          .column.is-4.has-text-left Tags
          .column.is-8.has-text-left
            .tags.imdone-tags(v-if="tags.length > 0")
              .tag.is-success(v-for="tag in tags") {{tag}}
        .columns
          .column.is-4.has-text-left Context
          .column.is-8.has-text-left
            .tags.imdone-contexts(v-if="contexts.length > 0")
              .tag.is-info(v-for="context in contexts") {{context}}
    .panel-heading.has-text-left.is-size-5 Metadata
    .panel-block
      .container
        b-table(:data="metaData" :columns="columns")
</template>
<script>
import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
const md = new MarkdownIt()

export default {
  name: 'imdone-detail',
  props: ['task', 'repoURL'],
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
      return md.render(this.task.description.join('\n'))
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
<style lang="scss" scoped>
.panel {
  margin: .75rem .75rem .74rem 0;
  overflow-y: auto;
}
.description {
  ul {
    list-style: disc;
  }
}
</style>
