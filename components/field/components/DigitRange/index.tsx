import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldDigitRangeProps, Value, ValuePair } from './types'
import { defineComponent, ref, watch } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDigitRangeEdit from './FieldDigitRangeEdit'
import FieldDigitRangeRead from './FieldDigitRangeRead'

export type { FieldDigitRangeProps, Value, ValuePair }

export default defineComponent({
  name: 'FieldDigitRange',
  props: {
    text: { type: Array as PropType<ValuePair>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    separator: { type: String, default: '~' },
    separatorWidth: { type: Number, default: 30 },
  },
  setup(props) {
    const valuePair = ref<ValuePair | undefined>(props.fieldProps.value ?? props.fieldProps.defaultValue)

    // Sync with external value changes
    watch(
      () => props.fieldProps.value,
      (val) => {
        valuePair.value = val
      },
    )

    const setValuePair = (updater: ValuePair | undefined | ((prev: ValuePair | undefined) => ValuePair | undefined)) => {
      const prev = valuePair.value
      const next = typeof updater === 'function' ? updater(prev) : updater
      valuePair.value = next
      props.fieldProps.onChange?.(next)
    }

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldDigitRangeRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            separator={props.separator}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldDigitRangeEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
            separator={props.separator}
            separatorWidth={props.separatorWidth}
            valuePair={valuePair.value}
            setValuePair={setValuePair}
            placeholderValue={props.fieldProps?.placeholder || props.placeholder || ['请输入', '请输入']}
          />
        )
      }

      return null
    }
  },
})
