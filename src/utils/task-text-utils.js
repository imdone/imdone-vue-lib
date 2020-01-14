import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
import * as checkbox from 'markdown-it-checkbox'
import * as emoji from 'markdown-it-emoji'
import removeMD from 'remove-markdown'
import eol from 'eol'
import path from 'path'
import template from 'lodash.template'
import _ from 'lodash'

const md = new MarkdownIt({html: true, breaks: true})
md.use(checkbox)
md.use(emoji)

const CONTENT_TOKEN = '__CONTENT__'
function formatDescription (task, description) {
  const emptyResult = {
    description: '',
    encodedText: '',
    encodedMD: ''
  }
  if (!task) return emptyResult
  const frontMatterProps = _.get(task, 'frontMatter.props') || {}
  const frontMatterComputed = _.get(task, 'frontMatter.computed') || {}
  const props = {...frontMatterProps, content: CONTENT_TOKEN}
  const computed = {...frontMatterComputed}
  let encodedText
  let encodedMD
  try {
    for (let [key, value] of Object.entries(computed)) {
      const computedTemplate = `\${${template(value)({...props, ...computed})}}`
      const computedValue = template(computedTemplate)({})
      computed[key] = computedValue
    }
    description = template(description)({...props, ...computed})
    const linkRegex = /\[([^[]+)\](\(.*\))/gm
    let plainDescription = removeMD(description.replace(linkRegex, '$2'), {stripListLeaders: false})
    plainDescription = plainDescription.replace(/:\w+:/g, match => {
      const html = md.render(match)
      const $ = cheerio.load(html)
      return $.text().trim()
    })
    encodedText = encodeURIComponent(plainDescription)
    encodedMD = encodeURIComponent(description)
    description = description.replace(CONTENT_TOKEN, encodedText)
  } catch (e) {
    return emptyResult
  }
  return { description, encodedText, encodedMD }
}

export default {
  description (task, lines) {
    if (!task) {
      return {
        lines: [],
        html: '',
        encodedText: '',
        encodedMD: ''
      }
    }
    const descAry = eol.split(task.getTextAndDescription())
    const truncDesc = lines
                        ? eol.split(task.getTextAndDescription()).slice(0, lines).join(eol.lf)
                        : task.getTextAndDescription()
    let {description} = formatDescription(task, truncDesc)
    let {encodedText, encodedMD} = formatDescription(task, task.getTextAndDescription())
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
      html: $.html(),
      encodedText,
      encodedMD
    }
  },
  formatText (text, data) {
    return template(text)(data)
  },
  formatDescription
}
