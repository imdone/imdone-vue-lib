import * as MarkdownIt from 'markdown-it'
import * as cheerio from 'cheerio'
import * as checkbox from 'markdown-it-checkbox'
import * as imageSize from 'markdown-it-imsize'
import * as emoji from 'markdown-it-emoji'
import removeMD from 'remove-markdown'
import eol from 'eol'
import path from 'path'
import template from 'lodash.template'
import _ from 'lodash'

const md = new MarkdownIt({html: true, breaks: true})
md.use(checkbox)
.use(emoji)
.use(imageSize)

const CONTENT_TOKEN = '__CONTENT__'
let fs

function getEncodedDescription (description) {
  const linkRegex = /\[([^[]+)\](\(.*\))/gm
  let plainDescription = removeMD(description.replace(linkRegex, '$2'), {stripListLeaders: false})
  plainDescription = plainDescription.replace(/:\w+:/g, match => {
    const html = md.render(match)
    const $ = cheerio.load(html)
    return $.text().trim()
  })
  const encodedText = encodeURIComponent(plainDescription)
  const encodedMD = encodeURIComponent(description)
  description = description
    .replace(CONTENT_TOKEN, encodedText)
    .replace(/(?<!!)\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => { // URI encode file links
      return `[${p1}](${p2.replace(/ /g, '%20')})`
    })
  return {encodedMD, encodedText, description}
}
function removeDisplayComments (description) {
  return description.replace(/<!--\s*\[([\s\S]*?)\]\s*-->/g, '$1')
}

function formatDescription (task, description, mustache) {
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
  const taskProps = _.pick(task, 'progress', 'line', 'list', 'source', 'due', 'created', 'completed', 'tags', 'context', 'meta', 'allTags', 'allContext', 'allMeta')
  try {
    for (let [key, value] of Object.entries(computed)) {
      const computedTemplate = `\${${template(value)({...props, ...computed})}}`
      const computedValue = template(computedTemplate)({})
      computed[key] = computedValue
    }
  } catch (e) {
    return {...emptyResult, description}
  }

  if (mustache) description = removeDisplayComments(description)

  const data = {...props, ...computed, ...taskProps}
  const opts = { interpolate: /(?<!`)\${([\s\S]+?)}/g }
  try {
    description = template(description, opts)(data)
  } catch (e) {
    description = description.replace(opts.interpolate, `~~\${${e}}~~`)
  }

  if (mustache) {
    const opts = { interpolate: /(?<!`){{([\s\S]+?)}}/g }
    try {
      description = template(description, opts)(data)
    } catch (e) {
      description = description.replace(opts.interpolate, `~~{{${e}}}~~`)
    }
  }

  return getEncodedDescription(description)
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
    const textAndDescription = task.getTextAndDescription()
    const descAry = eol.split(textAndDescription)
    const truncDesc = lines
                        ? eol.split(textAndDescription).slice(0, lines).join(eol.lf)
                        : textAndDescription
    let {description} = formatDescription(task, truncDesc, true)
    let {encodedText, encodedMD} = formatDescription(task, textAndDescription, true)
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

    $('code[class*="language-"]').each(function () {
      const codeEl = $(this)
      const code = codeEl.text()
      const $toolbar = cheerio.load(`<div class="code-toolbar"><a href="#" class="copy-code">Copy Code</a></div>`)
      $toolbar('.copy-code').attr('data-code', code)
      codeEl.parent().after($toolbar('body').html())
    })

    $('img').each(function () {
      const src = $(this).attr('src')
      if (!/\w+:\/\//.test(src)) {
        const taskImgPath = _.get(task, 'source.path')
        const repoPath = task.repoId
        let imgPath = path.join(repoPath, src)
        if (taskImgPath) {
          const taskFileDirAry = taskImgPath.split(path.sep)
          taskFileDirAry.pop()
          const taskFileDir = taskFileDirAry.join(path.sep)
          const filePath = decodeURIComponent(path.join(taskFileDir, src))
          const fullFilePath = path.join(repoPath, filePath)
          if (fs.existsSync(fullFilePath)) imgPath = fullFilePath
        }
        $(this).attr('src', `file://${imgPath}`)
      }
    })
    //- TODO:10 Support sorting of tasks in list id:43 +feature
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
  formatDescription,
  setFs (_fs) {
    fs = _fs
  },
  renderMarkdown (markdown) {
    return md.render(markdown)
  },
  removeMD
}
