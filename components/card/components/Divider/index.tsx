import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import useStyle from './style'

const Divider = defineComponent({
  name: 'ProCardDivider',
  props: ['type', 'orientation', 'class', 'className', 'style'],
  setup(props) {
    const { wrapSSR, hashId } = useStyle('ant-pro-card')

    return () => {
      const orientation = props.orientation || props.type || 'vertical'

      return wrapSSR(
        <div
          class={clsx(
            'ant-pro-card-divider',
            props.class,
            props.className,
            hashId,
            {
              [`ant-pro-card-divider-${orientation}`]: orientation,
            },
          )}
          style={props.style as any}
        />,
      )
    }
  },
})

export default Divider
