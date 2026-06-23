import type { VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import useStyle from './style'

export interface ProCardActionsProps {
  actions?: VNodeChild[] | VNodeChild
  prefixCls?: string
}

const Actions = defineComponent<ProCardActionsProps>({
  name: 'ProCardActions',
  props: ['actions', 'prefixCls'],
  setup(rawProps) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-card', computed(() => props.prefixCls))
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const actions = props.actions
      if (Array.isArray(actions) && actions.length) {
        return wrapSSR(
          <ul class={clsx(`${prefixCls.value}-actions`, hashId)}>
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
        <ul class={clsx(`${prefixCls.value}-actions`, hashId)}>
          {actions}
        </ul>,
      )
    }
  },
})

export default Actions
