import type { CSSProperties, VNode, VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import { cloneVNode, Fragment, h, isVNode } from 'vue'

type FieldOptionsProps = NonNullable<ProFieldFC<{
  text?: VNodeChild | VNodeChild[]
}>['__props']>

function addArrayKeys(doms: VNodeChild[]) {
  return doms.map((dom, index) => {
    if (!isVNode(dom))
      return h(Fragment, { key: index }, [dom])

    const props = (dom as VNode).props || {}
    return cloneVNode(dom, {
      key: dom.key ?? index,
      ...props,
      style: {
        ...(props.style as CSSProperties | undefined),
      },
    })
  })
}

function renderOptions(doms: VNodeChild[]) {
  return (
    <div
      class="ant-pro-field-option"
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      {addArrayKeys(doms)}
    </div>
  )
}

const FieldOptions: ProFieldFC<{
  text?: VNodeChild | VNodeChild[]
}> = (props) => {
  const typedProps = props as FieldOptionsProps
  const text = typedProps.text ?? []
  const mode = typedProps.mode ?? 'read'

  if (typedProps.render) {
    const doms = typedProps.render(text, { mode, ...typedProps.fieldProps }, <></>) as FieldOptionsProps['text']
    if (!doms || !Array.isArray(doms) || doms.length < 1) {
      return null
    }
    return renderOptions(doms as VNodeChild[])
  }

  if (!text || !Array.isArray(text)) {
    if (!isVNode(text))
      return null
    return text
  }

  return renderOptions(text as VNodeChild[])
}

export default FieldOptions
