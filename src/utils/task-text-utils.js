import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
import * as checkbox from 'markdown-it-checkbox'
const md = new MarkdownIt({html: true, breaks: true})
md.use(checkbox)
export default {
  text (task) {
    const html = md.render(task.getText({stripMeta: true, sanitize: true, stripTags: true, stripContext: true}))
    const $ = cheerio.load(html)
    $('a').attr('target', '_blank')
    return $.html()
  },
  description (task) {
    const html = md.render(task.getTextAndDescription())
    const $ = cheerio.load(html)
    $('a').each(function () {
      $(this).attr('target', '_blank')
    })
    // TODO: Support updating task lists from UI id:36
    $('input[type=checkbox]').closest('li').css('list-style', 'none')
    $('input[type=checkbox]').attr('disabled', 'true')
    return $.html()
  }
}
