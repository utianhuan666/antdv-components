import type { CSSProperties, VNode, VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import { cloneVNode, defineComponent, Fragment, h, isVNode } from 'vue'
import { proTheme } from '../../../provider'
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
      key: index,
      ...props,
      style: {
        ...(props.style as CSSProperties | undefined),
      },
    })
  })
}

/**
 * 一般用于放多个按钮
 */
const FieldOptions = defineComponent<FieldOptionsProps>({
  name: 'FieldOptions',
  props: ['text', 'mode', 'render', 'fieldProps'],
  setup(rawProps, { expose }) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-field-option')
    const { token } = proTheme.useToken()

    // 镜像 React useImperativeHandle(ref, () => ({}))
    expose({})

    return () => {
      const text = props.text ?? []
      const mode = props.mode ?? 'read'
      const style: CSSProperties = {
        display: 'flex',
        gap: `${token.value.margin}px`,
        alignItems: 'center',
      }

      if (props.render) {
        const doms = props.render(text, { mode, ...props.fieldProps }, <></>) as FieldOptionsProps['text']
        if (!doms || !Array.isArray(doms) || doms.length < 1)
          return null
        return (
          <div style={style} class={prefixCls.value}>
            {addArrayKeys(doms as VNodeChild[])}
          </div>
        )
      }

      if (!text || !Array.isArray(text)) {
        if (!isVNode(text))
          return null
        return text
      }

      return (
        <div style={style} class={prefixCls.value}>
          {addArrayKeys(text as VNodeChild[])}
        </div>
      )
    }
  },
})

export default FieldOptions
