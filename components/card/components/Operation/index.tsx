import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useStyle } from './style'

const Operation = defineComponent({
  name: 'ProStatisticCardOperation',
  props: ['class', 'className', 'style'],
  setup(props, { slots }) {
    const prefixCls = useProPrefixCls('pro-card-operation')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => wrapSSR(
      <div class={clsx(prefixCls.value, props.class, props.className, hashId)} style={props.style as any}>
        {slots.default?.()}
      </div>,
    )
  },
})

export default Operation
