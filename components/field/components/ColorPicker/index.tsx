import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { ColorPicker } from 'antdv-next'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

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
  name: 'FieldColorPicker',
  props: {
    text: { type: String as PropType<string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      if (isProFieldReadMode(props.mode)) {
        const dom = (
          <ColorPicker
            value={props.text}
            open={false}
            {...props.fieldProps}
          />
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const style = { display: 'table-cell', ...props.fieldProps?.style }
        const dom = (
          <ColorPicker
            presets={[DEFAULT_PRESETS]}
            {...props.fieldProps}
            style={style}
          />
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps, style }, dom)
        }
        return dom
      }

      return null
    }
  },
})
