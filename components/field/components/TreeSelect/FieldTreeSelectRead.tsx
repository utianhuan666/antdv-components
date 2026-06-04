import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldValueEnumType } from '../Select/types'
import { defineComponent } from 'vue'
import { objectToMap, proFieldParsingText } from '../Select'

export default defineComponent({
  name: 'FieldTreeSelectRead',
  props: {
    text: { type: null as unknown as PropType<any>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    optionsValueEnum: { type: Map as PropType<Map<any, any> | undefined>, default: undefined },
    options: { type: Array as PropType<any[]>, default: () => [] },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
  },
  setup(props) {
    return () => {
      const dom = (
        <>
          {proFieldParsingText(props.text, objectToMap(props.valueEnum || props.optionsValueEnum))}
        </>
      )

      if (props.render)
        return props.render(props.text, { mode: props.mode, ...props.fieldProps, treeData: props.options }, dom) ?? props.emptyText
      return dom
    }
  },
})
