import type MarkdownIt from 'markdown-it'
import type StateCore from 'markdown-it/lib/rules_core/state_core.mjs'

export function tablePlugin(md: MarkdownIt) {
  md.core.ruler.push('table_api_attribute', (state: StateCore) => {
    const tokens = state.tokens
    let inApiSection = false

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!

      if (token.type === 'heading_open' && token.tag === 'h2') {
        const inlineToken = tokens[i + 1]
        if (inlineToken?.type === 'inline') inApiSection = inlineToken.content.trim().toLowerCase() === 'api'
      }

      if (inApiSection && token.type === 'table_open') {
        const existingClass = token.attrGet('class') || ''
        token.attrSet('class', existingClass ? `${existingClass} component-table-api` : 'component-table-api')
      }
    }

    return true
  })
}
