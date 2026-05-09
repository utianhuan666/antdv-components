import type { PropType } from 'vue'
import type { SubmitterContext, SubmitterProps } from '../../typing'
import { Button } from 'antdv-next'
import { defineComponent } from 'vue'

const SubmitterButtonProps = {
  searchConfig: { type: Object as PropType<SubmitterProps['searchConfig']>, default: () => ({}) },
  submitButtonProps: { type: [Boolean, Object] as PropType<SubmitterProps['submitButtonProps']>, default: () => ({}) },
  resetButtonProps: { type: [Boolean, Object] as PropType<SubmitterProps['resetButtonProps']>, default: () => ({}) },
  onSubmit: { type: Function as PropType<(value?: Record<string, any>) => void>, default: undefined },
  onReset: { type: Function as PropType<(value?: Record<string, any>) => void>, default: undefined },
  render: { type: [Boolean, Function] as PropType<SubmitterProps['render']>, default: undefined },
  context: { type: Object as PropType<SubmitterContext>, required: true },
}

const Submitter = defineComponent({
  name: 'ProFormSubmitter',
  props: SubmitterButtonProps,
  setup(props) {
    return () => {
      const { searchConfig, submitButtonProps, resetButtonProps } = props
      const submitText = searchConfig?.submitText ?? '提交'
      const resetText = searchConfig?.resetText ?? '重置'

      const dom = []
      if (resetButtonProps !== false) {
        const { preventDefault, onClick, ...resetRestProps } = (typeof resetButtonProps === 'object' ? resetButtonProps : {}) as Record<string, any>
        dom.push(
          <Button
            key="reset"
            htmlType="button"
            {...resetRestProps}
            onClick={(event: MouseEvent) => {
              if (!preventDefault)
                props.context!.reset()
              props.onReset?.()
              onClick?.(event)
            }}
          >
            {resetText}
          </Button>,
        )
      }
      if (submitButtonProps !== false) {
        const { preventDefault, onClick, ...submitRestProps } = (typeof submitButtonProps === 'object' ? submitButtonProps : {}) as Record<string, any>
        dom.push(
          <Button
            key="submit"
            type="primary"
            htmlType="button"
            {...submitRestProps}
            onClick={(event: MouseEvent) => {
              if (!preventDefault)
                props.context!.submit()
              props.onSubmit?.()
              onClick?.(event)
            }}
          >
            {submitText}
          </Button>,
        )
      }

      if (props.render === false)
        return null
      const renderDom = typeof props.render === 'function' ? props.render(props.context!, dom) : dom
      if (!renderDom)
        return null

      if (Array.isArray(renderDom)) {
        if (renderDom.length < 1)
          return null
        if (renderDom.length === 1)
          return renderDom[0]
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {renderDom}
          </div>
        )
      }

      return renderDom
    }
  },
})

export default Submitter
