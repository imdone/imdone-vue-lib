import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
import * as checkbox from 'markdown-it-checkbox'
import * as emoji from 'markdown-it-emoji'
import eol from 'eol'
import path from 'path'

const md = new MarkdownIt({html: true, breaks: true})
md.use(checkbox)
md.use(emoji)
export default {
  text (task) {
    const html = md.render(task.getText({stripMeta: true, sanitize: true, stripTags: true, stripContext: true}))
    const $ = cheerio.load(html)
    $('a').attr('target', '_blank')
    return $.html()
  },
  description (task, lines) {
    const descAry = eol.split(task.getTextAndDescription())
    const description = lines
                        ? eol.split(task.getTextAndDescription()).slice(0, lines - 1).join(eol.lf)
                        : task.getTextAndDescription()
    const html = md.render(description)
    const $ = cheerio.load(html)
    $('a').each(function () {
      const href = $(this).attr('href')
      if (/\w+:\/\//.test(href)) return $(this).attr('target', '_blank')
      const [filePath, line] = href.split(':')
      $(this).attr('file-path', filePath)
      $(this).attr('file-line', line)
      $(this).attr('href', '#')
    })
    $('img').each(function () {
      const src = $(this).attr('src')
      if (!/\w+:\/\//.test(src)) {
        const imgPath = path.join(task.repoId, src)
        $(this).attr('src', `file://${imgPath}`)
      }
    })
    // TODO:10 Support sorting of tasks in list id:43 +feature
    $('input[type=checkbox]').closest('li').css('list-style', 'none')
    // $('input[type=checkbox]').attr('disabled', 'true')
    return {
      lines: descAry,
      html: $.html()
    }
  }
}
