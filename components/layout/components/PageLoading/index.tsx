import type { SpinProps } from 'antdv-next'
import type { PropType } from 'vue'
import { Spin } from 'antdv-next'
import { defineComponent } from 'vue'

export const PageLoading = defineComponent({
  name: 'PageLoading',
  inheritAttrs: false,
  props: {
    tip: null as any,
    spinning: Boolean,
    delay: Number,
    indicator: null as any,
    size: String as PropType<SpinProps['size']>,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { size: _size, ...spinProps } = props

      return (
        <div style={{ paddingBlockStart: 100, textAlign: 'center' }}>
          <Spin {...attrs} {...spinProps} size="large" />
          {slots.default?.()}
          {props.tip ? <div class="ant-spin-text">{props.tip}</div> : null}
        </div>
      )
    }
  },
})

export default PageLoading
