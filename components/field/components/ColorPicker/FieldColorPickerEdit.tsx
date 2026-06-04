import type { CSSProperties, PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { ColorPicker } from 'antdv-next'
import { defineComponent } from 'vue'

const DEFAULT_PRESETS = {
  label: 'Recommended',
  colors: [
    '#F5222D',
    '#FA8C16',
    '#FADB14',
    '#8BBB11',
    '#52C41A',
    '#13A8A8',
    '#1677FF',
    '#2F54EB',
    '#722ED1',
    '#EB2F96',
    '#F5222D4D',
    '#FA8C164D',
    '#FADB144D',
    '#8BBB114D',
    '#52C41A4D',
    '#13A8A84D',
    '#1677FF4D',
    '#2F54EB4D',
    '#722ED14D',
    '#EB2F964D',
  ],
}

export default defineComponent({
  name: 'FieldColorPickerEdit',
  props: {
    text: { type: String, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const style = { display: 'table-cell', ...(props.fieldProps?.style as CSSProperties) }
      const dom = (
        <ColorPicker
          presets={[DEFAULT_PRESETS]}
          {...props.fieldProps}
          style={style}
          class={`ant-pro-field-color-picker${props.fieldProps?.class ? ` ${props.fieldProps.class}` : ''}`}
        />
      )
      if (props.formItemRender) {
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps, style }, dom)
      }
      return dom
    }
  },
})
