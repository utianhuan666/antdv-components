import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useStyle } from './style'

const Operation = defineComponent({
  name: 'ProStatisticCardOperation',
  props: ['class', 'className', 'style'],
  setup(props, { slots }) {
    const prefixCls = 'ant-pro-card-operation'
    const { wrapSSR, hashId } = useStyle(prefixCls)

    return () => wrapSSR(
      <div class={clsx(prefixCls, props.class, props.className, hashId)} style={props.style as any}>
        {slots.default?.()}
      </div>,
    )
  },
})

export default Operation
