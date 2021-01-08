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
    .replace(/(?<!!)\[(.*?)\]\((.*?)( ".*?")?\)/g, (match, p1, p2, p3) => { // URI encode file links
      const title = p3 || ''
      const link = `[${p1}](${p2.replace(/\s/g, '%20')}${title})`
      return link.replace(/%20(".*?"\))$/, ' $1')
    })
  return {encodedMD, encodedText, description}
}

function removeDisplayComments (description) {
  return description.replace(/<!--\s*\[([\s\S]*?)\]\s*-->/g, '$1')
}

function getTaskProperties (task) {
  const frontMatterProps = _.get(task, 'frontMatter.props') || {}
  const frontMatterComputed = _.get(task, 'frontMatter.computed') || {}
  const props = {...frontMatterProps, content: CONTENT_TOKEN}
  const computed = {...frontMatterComputed}
  const taskProps = _.pick(task, 'text', 'description', 'progress', 'line', 'list', 'source', 'due', 'created', 'completed', 'tags', 'context', 'meta', 'allTags', 'allContext', 'allMeta')
  try {
    for (let [key, value] of Object.entries(computed)) {
      let computedValue = value.toString()
      if (_.isFunction(value) && !_.isEmpty(props) && props.totals) {
        try {
          computedValue = value.apply({...props, ...computed, ...taskProps})
        } catch (e) {
          console.error(`Unable to compute key: ${key} with value: ${computedValue}`, e)
        }
      } else {
        try {
          computedValue = template(value)({...props, ...computed, ...taskProps})
        } catch (e) {
          console.error(`Unable to compute key: ${key} with value: ${computedValue}`, e)
        }
      }
      computed[key] = computedValue
    }
  } catch (e) {
    console.error(e)
    return
  }
  const interpolationProperties = {...props, ...computed, ...taskProps}
  return interpolationProperties
}

function formatDescription (task, description, mustache) {
  const emptyResult = {
    description: '',
    encodedText: '',
    encodedMD: ''
  }
  if (!task) return emptyResult

  const data = getTaskProperties(task)

  if (!data) return {...emptyResult, description}

  const opts = { interpolate: /(?<!`)\${([\s\S]+?)}/g }

  if (mustache) description = removeDisplayComments(description)

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

  // Fix list endings
  // const listEndingRegex = /(\n\s*([-+*]{1}|\d+.)\s.*[\n\r])([^1-9-+* \t])/gm
  // description = description.replace(listEndingRegex, '$1\n$3')

  return getEncodedDescription(description)
}

function getCardMarkdown (task, lines) {
  // - eliminate <!--[ ]--> wrappers
  const taskMD = task.getTextAndDescription().replace(/<!--\s*\[\s*([\s\S]*?)\s*\]\s*-->/gm, '$1')
  // - Split on eol and append lines until visible line count equals lines
  const taskMDArray = []
  let commentTokens = 0
  let totalLines = 0
  eol.split(taskMD).forEach(line => {
    if (/<!--/.test(line)) commentTokens++
    if (commentTokens === 0) totalLines++
    if (/-->/.test(line)) commentTokens--
    if (lines && (totalLines > lines)) return
    taskMDArray.push(line)
  })
  return {totalLines, content: taskMDArray.join(eol.lf)}
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
    let {encodedText, encodedMD, description} = formatDescription(task, getCardMarkdown(task).content, true)
    const html = md.render(formatDescription(task, getCardMarkdown(task, lines).content, true).description)
    const $ = cheerio.load(html)

    $('a').each(function () {
      const href = $(this).attr('href')
      if (/\w+:\/\/|mailto:.*@.*/.test(href)) return $(this).attr('target', '_blank')
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
      html: $.html(),
      encodedText,
      encodedMD,
      markdown: description
    }
  },
  formatText (text, data) {
    return template(text)(data)
  },
  formatDescription,
  getTaskProperties,
  setFs (_fs) {
    fs = _fs
  },
  renderMarkdown (markdown) {
    return md.render(markdown)
  },
  removeMD,
  getCardMarkdown
}
