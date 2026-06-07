import type { CSSProperties, VNode, VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import { cloneVNode, defineComponent, Fragment, h, isVNode } from 'vue'
import { useStyle } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

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

function renderOptions(
  doms: VNodeChild[],
  prefixCls: string,
  hashId: string,
  wrapSSR: (node: VNodeChild) => VNodeChild,
) {
  return wrapSSR(
    <div
      class={[prefixCls, hashId]}
    >
      {addArrayKeys(doms)}
    </div>,
  )
}

const FieldOptions = defineComponent({
  name: 'FieldOptions',
  props: ['text', 'mode', 'render', 'fieldProps'],
  setup(rawProps) {
    const props = rawProps as FieldOptionsProps
    const prefixCls = useProPrefixCls('pro-field-option')
    const { wrapSSR, hashId } = useStyle('FieldOptions', token => ({
      [`.${prefixCls.value}`]: {
        display: 'flex',
        gap: token.margin,
        alignItems: 'center',
      },
    }))

    return () => {
      const text = props.text ?? []
      const mode = props.mode ?? 'read'

      if (props.render) {
        const doms = props.render(text, { mode, ...props.fieldProps }, <></>) as FieldOptionsProps['text']
        if (!doms || !Array.isArray(doms) || doms.length < 1)
          return null
        return renderOptions(doms as VNodeChild[], prefixCls.value, hashId, wrapSSR)
      }

      if (!text || !Array.isArray(text)) {
        if (!isVNode(text))
          return null
        return text
      }

      return renderOptions(text as VNodeChild[], prefixCls.value, hashId, wrapSSR)
    }
  },
}) as unknown as ProFieldFC<{
  text?: VNodeChild | VNodeChild[]
}>

export default FieldOptions
