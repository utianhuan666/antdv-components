import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldValueEnumType } from '../Select/types'
import { defineComponent } from 'vue'
import { objectToMap, proFieldParsingText } from '../Select'

export default defineComponent({
  name: 'FieldCheckboxRead',
  props: {
    text: { type: [String, Number, Array] as PropType<string | number | (string | number)[]>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    optionsValueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const parsedText = proFieldParsingText(
        props.text,
        objectToMap(props.valueEnum || props.optionsValueEnum),
      )

      if (props.render) {
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, <>{parsedText}</>) ?? null
      }

      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {parsedText}
        </div>
      )
    }
  },
})
