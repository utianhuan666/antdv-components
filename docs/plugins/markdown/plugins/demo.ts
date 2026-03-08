import type { MarkdownItEnv, MarkdownItHeader } from '@mdit-vue/types'
import type MarkdownIt from 'markdown-it'
import pathe from 'pathe'

declare module '@mdit-vue/types' {
  interface MarkdownItEnv {
    id?: string
  }
}

function checkWrapper(content: string, wrapper = 'demo') {
  return new RegExp(`<${wrapper}(\\s|>|/)`, 'i').test(content)
}

function flattenHeaders(headers: MarkdownItHeader[] = []) {
  const headerMap = new Map<string, MarkdownItHeader>()

  const visit = (items: MarkdownItHeader[]) => {
    for (const item of items) {
      headerMap.set(item.slug, item)
      if (item.children?.length)
        visit(item.children)
    }
  }

  visit(headers)
  return headerMap
}

function getHeadingSlug(token: { attrs?: [string, string][] | null }) {
  return token.attrs?.find(attr => attr[0] === 'id')?.[1]
}

function getHeadingLevel(token: { tag?: string }) {
  const match = token.tag?.match(/^h([2-6])$/)
  if (!match)
    return null
  return Number(match[1])
}

export function replaceSrcPath(content: string, id: string, root: string, wrapper = 'demo', parentHeader?: MarkdownItHeader) {
  function replaceSrcInTag(tagMatch: string, titleContent?: string) {
    return tagMatch.replace(/(\s|^)src=(['"])(.*?)\2/gi, (srcMatch, prefix, quote, srcValue) => {
      if (!srcValue || srcValue.startsWith('/'))
        return srcMatch

      const dir = pathe.dirname(id)
      const filePath = pathe.resolve(dir, srcValue)
      const relative = pathe.relative(root, filePath)
      const componentsArr = filePath.split('/')
      const demoIndex = componentsArr.reverse().findIndex(dir => dir.toLowerCase() === 'demo')
      const componentDemoPathArr = componentsArr.slice(0, demoIndex + 2)
      const componentDemoPath = componentDemoPathArr.reverse().join('/')

      if (parentHeader && titleContent) {
        const slug = componentDemoPath.replace(/\//g, '-').replace('.vue', '')
        const item = {
          level: parentHeader.level + 1,
          title: titleContent,
          slug,
          link: `#${slug}`,
          children: [],
        }
        if (parentHeader.children)
          parentHeader.children.push(item)
        else
          parentHeader.children = [item]
      }

      return `${prefix}src=${quote}${relative.startsWith('/') ? relative : `/${relative}`}${quote}`
    })
  }

  const closedTag = new RegExp(`(<${wrapper}(?!-)\\b[^>]*>)([\\s\\S]*?)<\\/${wrapper}>`, 'gi')
  let result = content.replace(closedTag, (tagMatch, openTag, titleContent) => {
    return tagMatch.replace(openTag, replaceSrcInTag(openTag, titleContent?.trim()))
  })

  const selfClosing = new RegExp(`<${wrapper}(?!-)\\b[^>]*/\\s*>`, 'gi')
  result = result.replace(selfClosing, tagMatch => replaceSrcInTag(tagMatch))

  const openTag = new RegExp(`<${wrapper}(?!-)\\b[^>]*>`, 'gi')
  return result.replace(openTag, tagMatch => replaceSrcInTag(tagMatch))
}

export function demoPlugin(md: MarkdownIt, config: { root?: string } = {}) {
  const originalRender = md.renderer.render

  md.renderer.render = function render(tokens, options, env: MarkdownItEnv) {
    const root = config.root ?? process.cwd()
    const currentId = env.id || ''
    const headerMap = flattenHeaders(env.headers)
    const activeHeaders = new Map<number, MarkdownItHeader>()

    function getCurrentHeader() {
      const levels = [...activeHeaders.keys()].sort((left, right) => right - left)
      const nearestLevel = levels[0]
      return nearestLevel ? activeHeaders.get(nearestLevel) : undefined
    }

    function processToken(token: { type: string, tag?: string, attrs?: [string, string][] | null, content: string, children?: unknown[] }) {
      if ((token.type === 'html_block' || token.type === 'html_inline') && checkWrapper(token.content))
        token.content = replaceSrcPath(token.content, currentId, root, 'demo', getCurrentHeader())

      if (token.children) {
        for (const child of token.children as typeof token[]) {
          processToken(child)
        }
      }
    }

    for (const token of tokens as typeof tokens & Array<{ type: string, tag?: string, attrs?: [string, string][] | null, content: string, children?: unknown[] }>) {
      if (token.type === 'heading_open') {
        const headingLevel = getHeadingLevel(token)
        const headingSlug = getHeadingSlug(token)

        if (headingLevel && headingSlug) {
          for (const level of [...activeHeaders.keys()]) {
            if (level >= headingLevel)
              activeHeaders.delete(level)
          }

          const header = headerMap.get(headingSlug)
          if (header)
            activeHeaders.set(headingLevel, header)
        }
      }

      processToken(token)
    }

    return originalRender.call(this, tokens, options, env)
  }
}
