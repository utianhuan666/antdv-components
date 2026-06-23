import { Spin } from 'antdv-next'
import { defineComponent } from 'vue'

export const PageLoading = defineComponent({
  name: 'PageLoading',
  inheritAttrs: false,
  props: ['tip', 'spinning', 'delay', 'indicator', 'size'],
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
