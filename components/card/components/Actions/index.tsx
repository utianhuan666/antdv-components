import type { CSSProperties, VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import useStyle from './style'

export interface ProCardActionsProps {
  actions?: VNodeChild[] | VNodeChild
  prefixCls?: string
  className?: any
  style?: CSSProperties
}

const Actions = defineComponent({
  name: 'ProCardActions',
  props: ['actions', 'prefixCls', 'className', 'style'],
  setup(rawProps) {
    const props = rawProps as ProCardActionsProps
    const prefixCls = useProPrefixCls('pro-card', computed(() => props.prefixCls))
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const actions = Array.isArray(props.actions) ? props.actions : [props.actions]
      const filtered = actions.filter(action => action != null)
      if (!filtered.length)
        return null

      return wrapSSR(
        <ul class={clsx(`${prefixCls.value}-actions`, hashId, props.className)} style={props.style}>
          {filtered.map((action, index) => (
            <li key={index} style={{ width: `${100 / filtered.length}%` }}>
              <span>{action}</span>
            </li>
          ))}
        </ul>,
      )
    }
  },
})

export default Actions
