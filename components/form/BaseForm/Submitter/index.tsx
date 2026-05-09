import type { PropType } from 'vue'
import type { SubmitterContext, SubmitterProps } from '../../typing'
import { Button, Space } from 'antdv-next'
import { defineComponent } from 'vue'

const SubmitterButtonProps = {
  searchConfig: { type: Object as PropType<SubmitterProps['searchConfig']>, default: () => ({}) },
  submitButtonProps: { type: [Boolean, Object] as PropType<SubmitterProps['submitButtonProps']>, default: () => ({}) },
  resetButtonProps: { type: [Boolean, Object] as PropType<SubmitterProps['resetButtonProps']>, default: () => ({}) },
  onSubmit: { type: Function as PropType<() => void>, default: undefined },
  onReset: { type: Function as PropType<() => void>, default: undefined },
  render: { type: [Boolean, Function] as PropType<SubmitterProps['render']>, default: undefined },
  context: { type: Object as PropType<SubmitterContext>, required: true },
}

const Submitter = defineComponent({
  name: 'ProFormSubmitter',
  props: SubmitterButtonProps,
  setup(props) {
    return () => {
      const { searchConfig, submitButtonProps, resetButtonProps } = props
      const submitText = searchConfig?.submitText ?? '提 交'
      const resetText = searchConfig?.resetText ?? '重 置'

      const dom = []
      if (resetButtonProps !== false) {
        dom.push(
          <Button
            key="reset"
            {...(typeof resetButtonProps === 'object' ? resetButtonProps : {})}
            onClick={() => {
              props.onReset?.()
              ;(resetButtonProps as Record<string, any>)?.onClick?.()
            }}
          >
            {resetText}
          </Button>,
        )
      }
      if (submitButtonProps !== false) {
        dom.push(
          <Button
            key="submit"
            type="primary"
            {...(typeof submitButtonProps === 'object' ? submitButtonProps : {})}
            onClick={() => {
              props.onSubmit?.()
              ;(submitButtonProps as Record<string, any>)?.onClick?.()
            }}
          >
            {submitText}
          </Button>,
        )
      }

      if (props.render === false)
        return null
      if (typeof props.render === 'function')
        return props.render(props.context!, dom)

      return <Space>{dom}</Space>
    }
  },
})

export default Submitter
