import type MarkdownIt from 'markdown-it'
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'
import type Token from 'markdown-it/lib/token.mjs'
import type { Options } from './pre-wrapper'
// @ts-expect-error this
import container from 'markdown-it-container'
import { nanoid } from 'nanoid'
import { extractTitle, getAdaptiveThemeMarker } from './pre-wrapper'

type ContainerArgs = [typeof container, string, { render: RenderRule }]

export interface ContainerOptions {
  infoLabel?: string
  noteLabel?: string
  tipLabel?: string
  warningLabel?: string
  dangerLabel?: string
  detailsLabel?: string
  importantLabel?: string
  cautionLabel?: string
}

export function containerPlugin(
  md: MarkdownIt,
  options: Options = { hasSingleTheme: false },
  containerOptions?: ContainerOptions,
) {
  md.use(...createContainer('tip', containerOptions?.tipLabel || 'TIP', md))
    .use(...createContainer('info', containerOptions?.infoLabel || 'INFO', md))
    .use(...createContainer('warning', containerOptions?.warningLabel || 'WARNING', md))
    .use(...createContainer('danger', containerOptions?.dangerLabel || 'DANGER', md))
    .use(...createContainer('details', containerOptions?.detailsLabel || 'Details', md))
    .use(container as typeof container, 'v-pre', {
      render: (tokens: Token[], idx: number) => (tokens[idx]!.nesting === 1 ? '<div v-pre>\n' : '</div>\n'),
    })
    .use(container as typeof container, 'raw', {
      render: (tokens: Token[], idx: number) => (tokens[idx]!.nesting === 1 ? '<div class="vp-raw">\n' : '</div>\n'),
    })
    .use(...createCodeGroup(options))
}

function createContainer(klass: string, defaultTitle: string, md: MarkdownIt): ContainerArgs {
  return [
    container as typeof container,
    klass,
    {
      render(tokens, idx, _options, env) {
        const token = tokens[idx]!
        const info = token.info.trim().slice(klass.length).trim()
        const attrs = md.renderer.renderAttrs(token)
        if (token.nesting === 1) {
          const title = md.renderInline(info || defaultTitle, {
            references: (env as { references?: unknown }).references,
          })
          if (klass === 'details') return `<details class="${klass} custom-block"${attrs}><summary>${title}</summary>\n`
          return `<div class="${klass} custom-block"${attrs}><p class="custom-block-title">${title}</p>\n`
        }
        return klass === 'details' ? '</details>\n' : '</div>\n'
      },
    },
  ]
}

function createCodeGroup(options: Options): ContainerArgs {
  return [
    container as typeof container,
    'code-group',
    {
      render(tokens, idx) {
        if (tokens[idx]!.nesting === 1) {
          const name = nanoid(5)
          let tabs = ''
          let checked = 'checked="checked"'

          for (let i = idx + 1; !(tokens[i]!.nesting === -1 && tokens[i]!.type === 'container_code-group_close'); ++i) {
            const token = tokens[i]!
            const isHtml = token.type === 'html_block'
            if ((token.type === 'fence' && token.tag === 'code') || isHtml) {
              const title = extractTitle(isHtml ? token.content : token.info, isHtml)
              if (title) {
                const id = nanoid(7)
                tabs += `<input type="radio" name="group-${name}" id="tab-${id}" ${checked}><label for="tab-${id}">${title}</label>`
                if (checked && !isHtml) token.info += ' active'
                checked = ''
              }
            }
          }

          return `<div class="vp-code-group${getAdaptiveThemeMarker(options)}"><div class="tabs">${tabs}</div><div class="blocks">\n`
        }
        return '</div></div>\n'
      },
    },
  ]
}
