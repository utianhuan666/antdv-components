import type { VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import useStyle from './style'

export interface ProCardActionsProps {
  actions?: VNodeChild[] | VNodeChild
  prefixCls?: string
}

const Actions = defineComponent({
  name: 'ProCardActions',
  props: ['actions', 'prefixCls'],
  setup(rawProps) {
    const props = rawProps as ProCardActionsProps
    const { wrapSSR, hashId } = useStyle(props.prefixCls || 'ant-pro-card')

    return () => {
      const actions = Array.isArray(props.actions) ? props.actions : [props.actions]
      const filtered = actions.filter(action => action != null)
      if (!filtered.length)
        return null

      const prefixCls = props.prefixCls || 'ant-pro-card'

      return wrapSSR(
        <ul class={clsx(`${prefixCls}-actions`, hashId)}>
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
