import type { ButtonProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import { Button, Space } from 'antdv-next'
import { defineComponent } from 'vue'

export interface SubmitterProps<T = any> {
  form?: T
  submitButtonProps?: ButtonProps
  resetButtonProps?: ButtonProps
  searchConfig?: {
    submitText?: VNodeChild
    resetText?: VNodeChild
  }
  render?: false | ((props: SubmitterProps<T>, dom: VNodeChild[]) => VNodeChild)
  onSubmit?: () => void
  onReset?: () => void
}

const Submitter = defineComponent<SubmitterProps>({
  name: 'ProFormSubmitter',
  props: ['form', 'submitButtonProps', 'resetButtonProps', 'searchConfig', 'render', 'onSubmit', 'onReset'],
  setup(rawProps) {
    const props = rawProps
    return () => {
      const dom = [
        <Button {...props.resetButtonProps as any} onClick={props.onReset}>{props.searchConfig?.resetText ?? '重 置'}</Button>,
        <Button type="primary" {...props.submitButtonProps as any} onClick={props.onSubmit}>{props.searchConfig?.submitText ?? '提 交'}</Button>,
      ]
      if (props.render === false)
        return null
      if (typeof props.render === 'function')
        return props.render(props, dom)
      return <Space>{dom}</Space>
    }
  },
})

export default Submitter
