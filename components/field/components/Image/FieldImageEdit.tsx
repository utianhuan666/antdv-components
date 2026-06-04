import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldImageProps } from './types'
import { Input } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldImageEdit',
  props: {
    text: { type: String as PropType<FieldImageProps['text']>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    placeholderValue: { type: String, default: '请输入' },
  },
  setup(props) {
    return () => {
      const dom = (
        <Input
          placeholder={props.placeholderValue}
          {...props.fieldProps}
        />
      )
      if (props.formItemRender) {
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
