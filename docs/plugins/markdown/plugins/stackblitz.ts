import type MarkdownIt from 'markdown-it'

export function stackblitzPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]!
    const info = token.info.trim()

    if (!info.startsWith('stackblitz')) return fence(...args)

    const titleMatch = info.match(/\{[^}]*title\s*=\s*"([^"]*)"[^}]*\}/)
    const title = titleMatch?.[1] || ''
    return `<stackblitz code="${encodeURIComponent(token.content)}" title="${escapeHtml(title)}"></stackblitz>`
  }
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
