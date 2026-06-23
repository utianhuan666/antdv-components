import type { TooltipProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import { Typography } from 'antdv-next'
import { isObject } from 'es-toolkit/compat'
import { isVNode } from 'vue'

export interface ProEllipsisTooltip {
  showTitle?: boolean
  tooltip?: TooltipProps
}

export type ProEllipsis = ProEllipsisTooltip | boolean

function isNeedTranText(item: any): boolean {
  if (item?.valueType?.toString().startsWith('date')) {
    return true
  }
  if (item?.valueType === 'select' || item?.valueEnum) {
    return true
  }
  return false
}

function getEllipsis(item: any): ProEllipsisTooltip | boolean {
  if (item.ellipsis?.showTitle === false) {
    return false
  }
  return item.ellipsis
}

function normalizeCopyText(text: unknown) {
  // Avoid copying non-string values and trim end to prevent trailing spaces.
  // (e.g. some browsers may include Typography's copy separator whitespace)
  return text === null || text === undefined ? '' : String(text).trimEnd()
}

function genEllipsis(dom: VNodeChild, item: any, text: string, rawText: unknown) {
  const ellipsis = getEllipsis(item)
  if (!ellipsis) {
    return false
  }
  /** 有些 valueType 需要设置copy的为string */
  const needTranText = isNeedTranText(item)

  // renderText 返回 VNode 时，使用 dom 作为 tooltip 避免 [object Object]
  const isRenderTextReturningVNode = isVNode(rawText)

  // 支持一下 tooltip 的关闭，合并 ellipsis.tooltip 自定义属性（placement 等）
  if ((needTranText || isRenderTextReturningVNode) && item?.tooltip !== false) {
    const tooltipTitle = <div class="pro-table-tooltip-text">{dom}</div>
    if (isObject(ellipsis) && isObject(ellipsis.tooltip)) {
      return {
        tooltip: {
          title: tooltipTitle,
          ...ellipsis.tooltip,
        },
      }
    }
    return {
      tooltip: tooltipTitle,
    }
  }

  if (!text) {
    return false
  }

  // 如果 ellipsis 是对象且包含 tooltip 属性,合并 tooltip 的属性
  if (isObject(ellipsis) && isObject(ellipsis.tooltip)) {
    return {
      tooltip: {
        title: text,
        ...ellipsis.tooltip,
      },
    }
  }
  return {
    tooltip: text,
  }
}

/**
 * 生成 Copyable 或 Ellipsis 的 dom
 *
 * @param dom 渲染后的 DOM 节点
 * @param item 列配置
 * @param text renderText 的返回值，可能是 string/number 或 VNode
 * @param copyText 用于复制的原始文本，当 renderText 返回 VNode 时避免复制 [object Object]
 */
export function genCopyable(dom: VNodeChild, item: any, text: string | VNodeChild, copyText?: unknown) {
  if (!item.copyable && !item.ellipsis)
    return dom

  const normalizedText = normalizeCopyText(text)
  // renderText 返回 VNode 时使用原始文本避免复制 [object Object]
  const resolvedCopyText
    = copyText !== undefined ? normalizeCopyText(copyText) : normalizedText
  const ellipsis = genEllipsis(dom, item, normalizedText, text)

  // `Typography.Text` with `copyable` will render an internal separator whitespace
  // between text and icon. When users "multi-click to select all" in a table cell,
  // that whitespace can be selected and copied, causing pasted text to end with spaces.
  // Render the copy icon in a separate node to keep the selectable text clean.
  if (item.copyable) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          maxWidth: '100%',
        }}
      >
        <Typography.Text
          style={{
            flex: 1,
            minWidth: 0,
            margin: 0,
            padding: 0,
          }}
          title=""
          ellipsis={ellipsis}
        >
          {dom}
        </Typography.Text>
        {resolvedCopyText
          ? (
              <span style={{ flex: 'none', userSelect: 'none' }}>
                <Typography.Text
                  style={{ margin: 0, padding: 0 }}
                  // Render icon only; no extra selectable separator text nodes.
                  copyable={{ text: resolvedCopyText, tooltips: ['', ''] }}
                />
              </span>
            )
          : null}
      </span>
    )
  }

  return (
    <Typography.Text
      style={{
        width: '100%',
        margin: 0,
        padding: 0,
      }}
      title=""
      ellipsis={ellipsis}
    >
      {dom}
    </Typography.Text>
  )
}
