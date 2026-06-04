import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { Value, ValuePair } from './types'
import { omit } from '@v-c/util'
import { Input, InputNumber } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldDigitRangeEdit',
  props: {
    text: { type: Array as PropType<ValuePair>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    separator: { type: String, default: '~' },
    separatorWidth: { type: Number, default: 30 },
    valuePair: { type: Array as PropType<ValuePair | undefined>, default: undefined },
    setValuePair: { type: Function as PropType<(updater: ValuePair | undefined | ((prev: ValuePair | undefined) => ValuePair | undefined)) => void>, required: true },
    placeholderValue: { type: [String, Array] as PropType<string | string[]>, required: true },
  },
  setup(props) {
    const getInputNumberPlaceholder = (index: number) =>
      Array.isArray(props.placeholderValue) ? props.placeholderValue[index] : props.placeholderValue

    const handleChange = (index: number, changedValue: Value) => {
      const newValuePair = [...(props.valuePair || [])]
      newValuePair[index] = changedValue === null ? undefined : changedValue
      props.setValuePair(newValuePair)
    }

    const handleGroupBlur = () => {
      if (!Array.isArray(props.valuePair))
        return

      const [value0, value1] = props.valuePair
      if (
        typeof value0 === 'number'
        && typeof value1 === 'number'
        && value0 > value1
      ) {
        props.setValuePair([value1, value0])
        return
      }

      if (value0 === undefined && value1 === undefined)
        props.setValuePair(undefined)
    }

    return () => {
      const { defaultValue, id } = props.fieldProps
      const restFieldProps = omit(props.fieldProps || {}, ['value', 'defaultValue', 'onChange', 'id'])

      const dom = (
        <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }} onBlur={handleGroupBlur}>
          <InputNumber
            {...({
              ...restFieldProps,
              placeholder: getInputNumberPlaceholder(0),
              id: id ? `${id}-0` : undefined,
              style: { width: `calc((100% - ${props.separatorWidth}px) / 2)` },
              value: props.valuePair?.[0],
              defaultValue: defaultValue?.[0],
              onChange: (changedValue: Value) => handleChange(0, changedValue),
            } as any)}
          />
          <Input
            style={{
              width: `${props.separatorWidth}px`,
              textAlign: 'center',
              borderInlineStart: 0,
              borderInlineEnd: 0,
              pointerEvents: 'none',
            }}
            placeholder={props.separator}
            disabled
          />
          <InputNumber
            {...({
              ...restFieldProps,
              placeholder: getInputNumberPlaceholder(1),
              id: id ? `${id}-1` : undefined,
              style: {
                width: `calc((100% - ${props.separatorWidth}px) / 2)`,
                borderInlineStart: 0,
              },
              value: props.valuePair?.[1],
              defaultValue: defaultValue?.[1],
              onChange: (changedValue: Value) => handleChange(1, changedValue),
            } as any)}
          />
        </span>
      )

      if (props.formItemRender)
        return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)

      return dom
    }
  },
})
