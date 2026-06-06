import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import useStyle from './style'

const Divider = defineComponent({
  name: 'ProCardDivider',
  props: ['type', 'orientation', 'class', 'className', 'style'],
  setup(props) {
    const prefixCls = useProPrefixCls('pro-card')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const orientation = props.orientation || props.type || 'vertical'

      return wrapSSR(
        <div
          class={clsx(
            `${prefixCls.value}-divider`,
            props.class,
            props.className,
            hashId,
            {
              [`${prefixCls.value}-divider-${orientation}`]: orientation,
            },
          )}
          style={props.style as any}
        />,
      )
    }
  },
})

export default Divider
