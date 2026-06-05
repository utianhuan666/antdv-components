import type { TooltipProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import { Typography } from 'antdv-next'
import { isVNode } from 'vue'

export interface ProEllipsisTooltip {
  showTitle?: boolean
  tooltip?: TooltipProps
}

export type ProEllipsis = ProEllipsisTooltip | boolean

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNeedTranText(item: any): boolean {
  if (item?.valueType?.toString().startsWith('date'))
    return true
  return item?.valueType === 'select' || item?.valueEnum
}

function getEllipsis(item: any): ProEllipsisTooltip | boolean {
  if (item.ellipsis?.showTitle === false)
    return false
  return item.ellipsis
}

function normalizeCopyText(text: unknown) {
  return text === null || text === undefined ? '' : String(text).trimEnd()
}

function genEllipsis(dom: VNodeChild, item: any, text: string, rawText: unknown) {
  const ellipsis = getEllipsis(item)
  if (!ellipsis)
    return false

  const needTranText = isNeedTranText(item)
  const isRenderTextReturningVNode = isVNode(rawText)
  if ((needTranText || isRenderTextReturningVNode) && item?.tooltip !== false) {
    const tooltipTitle = <div class="pro-table-tooltip-text">{dom}</div>
    if (isObject(ellipsis) && isObject(ellipsis.tooltip))
      return { tooltip: { title: tooltipTitle, ...ellipsis.tooltip } }
    return { tooltip: tooltipTitle }
  }

  if (!text)
    return false
  if (isObject(ellipsis) && isObject(ellipsis.tooltip))
    return { tooltip: { title: text, ...ellipsis.tooltip } }
  return { tooltip: text }
}

export function genCopyable(dom: VNodeChild, item: any, text: string | VNodeChild, copyText?: unknown) {
  if (!item.copyable && !item.ellipsis)
    return dom

  const normalizedText = normalizeCopyText(text)
  const resolvedCopyText = copyText !== undefined ? normalizeCopyText(copyText) : normalizedText
  const ellipsis = genEllipsis(dom, item, normalizedText, text)

  if (item.copyable) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', maxWidth: '100%' }}>
        <Typography.Text style={{ flex: 1, minWidth: 0, margin: 0, padding: 0 }} title="" ellipsis={ellipsis as any}>
          {dom}
        </Typography.Text>
        {resolvedCopyText
          ? (
              <span style={{ flex: 'none', userSelect: 'none' }}>
                <Typography.Text style={{ margin: 0, padding: 0 }} copyable={{ text: resolvedCopyText, tooltips: ['', ''] } as any} />
              </span>
            )
          : null}
      </span>
    )
  }

  return (
    <Typography.Text style={{ width: '100%', margin: 0, padding: 0 }} title="" ellipsis={ellipsis as any}>
      {dom}
    </Typography.Text>
  )
}
