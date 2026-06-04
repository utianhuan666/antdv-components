import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldImageProps } from './types'
import { Image } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldImageRead',
  props: {
    text: { type: String as PropType<FieldImageProps['text']>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    width: { type: Number as PropType<number>, default: undefined },
  },
  setup(props) {
    return () => {
      const dom = (
        <Image
          width={props.width || 32}
          src={props.text}
          {...props.fieldProps}
        />
      )
      if (props.render) {
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
