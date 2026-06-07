import type { SetupContext, VNodeChild } from 'vue'
import { defineComponent, isVNode } from 'vue'
import { useStyle } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

interface IndexColumnProps {
  border?: boolean
  text?: number
}

function getSlotText(children: VNodeChild[] | undefined, fallback: number) {
  if (!children?.length)
    return fallback
  if (children.length > 1)
    return children

  const child = children[0]
  if (isVNode(child) && (typeof child.children === 'string' || typeof child.children === 'number'))
    return child.children
  return child
}

function setupIndexColumn(props: IndexColumnProps, { slots }: SetupContext) {
  const prefixCls = useProPrefixCls('pro-field-index-column')
  const { hashId } = useStyle('IndexColumn', (token) => {
    const size = token.controlHeightXS + 2
    return {
      [`.${prefixCls.value}`]: {
        'display': 'inline-flex',
        'alignItems': 'center',
        'justifyContent': 'center',
        'width': size,
        'height': size,
        '&-border': {
          'color': token.colorTextLightSolid,
          'fontSize': token.fontSizeSM,
          'lineHeight': 1,
          'backgroundColor': token.colorTextSecondary,
          'borderRadius': size / 2,
          '&.top-three': {
            backgroundColor: token.colorTextQuaternary,
          },
        },
      },
    }
  })

  return () => {
    const text = props.text ?? 1
    const displayValue = getSlotText(slots.default?.(), text)
    const isTopThree = Number(displayValue) > 3

    return (
      <div
        class={[
          prefixCls.value,
          hashId,
          {
            [`${prefixCls.value}-border`]: props.border,
            'top-three': isTopThree,
          },
        ]}
      >
        {displayValue}
      </div>
    )
  }
}

const FieldIndexColumn = defineComponent({
  name: 'FieldIndexColumn',
  props: {
    border: Boolean,
    text: Number,
  },
  setup: setupIndexColumn,
})

export default FieldIndexColumn
