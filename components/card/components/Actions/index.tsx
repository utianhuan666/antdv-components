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
      const actions = props.actions
      if (Array.isArray(actions) && actions.length) {
        return wrapSSR(
          <ul class={clsx(`${prefixCls.value}-actions`, hashId, props.className)} style={props.style}>
            {actions.map((action, index) => (
              <li
                key={`action-${index}`}
                class={clsx(`${prefixCls.value}-actions-item`, hashId)}
                style={{ width: `${100 / actions.length}%`, padding: 0, margin: 0 }}
              >
                {action}
              </li>
            ))}
          </ul>,
        )
      }

      return wrapSSR(
        <ul class={clsx(`${prefixCls.value}-actions`, hashId, props.className)} style={props.style}>
          {actions}
        </ul>,
      )
    }
  },
})

export default Actions
