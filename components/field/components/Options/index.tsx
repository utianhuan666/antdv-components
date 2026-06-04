import type { PropType, VNode, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { cloneVNode, defineComponent, Fragment, h, isVNode } from 'vue'

function addArrayKeys(doms: VNodeChild[]) {
  return doms.map((dom, index) => {
    if (!isVNode(dom))
      return h(Fragment, { key: index }, [dom])

    const props = (dom as VNode).props || {}
    return cloneVNode(dom, {
      key: dom.key ?? index,
      ...props,
      style: {
        ...(props.style as Record<string, any> | undefined),
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

export default defineComponent({
  name: 'FieldOptions',
  props: {
    text: { type: [Array, Object, String, Number] as PropType<VNodeChild | VNodeChild[]>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      if (props.render) {
        const doms = props.render(props.text, { mode: props.mode, ...props.fieldProps }, <></>) as VNodeChild[]
        if (!doms || !Array.isArray(doms) || doms.length < 1) {
          return null
        }
        return renderOptions(doms)
      }

      if (!props.text || !Array.isArray(props.text)) {
        if (!isVNode(props.text))
          return null
        return props.text
      }

      return renderOptions(props.text)
    }
  },
})
