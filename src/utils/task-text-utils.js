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
  description (task, lines) {
    const descAry = task.getTextAndDescription().split('\n')
    const description = lines
                        ? task.getTextAndDescription().split('\n').slice(0, lines - 1).join('\n')
                        : task.getTextAndDescription()
    const html = md.render(description)
    const $ = cheerio.load(html)
    $('a').each(function () {
      $(this).attr('target', '_blank')
    })
    // DONE: Support updating task lists from UI id:44
    // - [x] Just like this
    // TODO: Support sorting of tasks in list id:43 +feature
    $('input[type=checkbox]').closest('li').css('list-style', 'none')
    // $('input[type=checkbox]').attr('disabled', 'true')
    return {
      lines: descAry,
      html: $.html()
    }
  }
}
