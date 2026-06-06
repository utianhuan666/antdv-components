import type { SetupContext, VNodeChild } from 'vue'
import { isVNode } from 'vue'
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

function FieldIndexColumn(props: IndexColumnProps, { slots }: SetupContext) {
  const prefixCls = useProPrefixCls('pro-field-index-column')
  const text = props.text ?? 1
  const displayValue = getSlotText(slots.default?.(), text)
  const isTopThree = Number(displayValue) > 3

  if (props.border) {
    return (
      <div
        class={[prefixCls.value, `${prefixCls.value}-border`, { 'top-three': isTopThree }]}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          color: '#fff',
          fontSize: '12px',
          lineHeight: '12px',
          backgroundColor: isTopThree ? '#979797' : '#314659',
          borderRadius: '9px',
        }}
      >
        {displayValue}
      </div>
    )
  }

  return (
    <div
      class={prefixCls.value}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
      }}
    >
      {displayValue}
    </div>
  )
}

export default FieldIndexColumn
