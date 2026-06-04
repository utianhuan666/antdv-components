import type { PropType, VNodeChild } from 'vue'
import { defineComponent, isVNode } from 'vue'

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

export default defineComponent({
  name: 'FieldIndexColumn',
  props: {
    border: { type: Boolean, default: false },
    text: { type: Number as PropType<number>, default: 1 },
  },
  setup(props, { slots }) {
    return () => {
      const displayValue = getSlotText(slots.default?.(), props.text)
      const isTopThree = Number(displayValue) > 3

      if (props.border) {
        return (
          <div
            class={['ant-pro-field-index-column', 'ant-pro-field-index-column-border', { 'top-three': isTopThree }]}
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
          class="ant-pro-field-index-column"
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
  },
})
