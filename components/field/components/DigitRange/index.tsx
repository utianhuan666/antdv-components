import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldDigitRangeProps, Value, ValuePair } from './types'
import { Input, InputNumber } from 'antdv-next'
import { defineComponent, ref, watch } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

export type { FieldDigitRangeProps, Value, ValuePair }

export default defineComponent({
  name: 'FieldDigitRange',
  props: {
    text: { type: Array as PropType<ValuePair>, default: () => [] },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
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
        const { fieldProps, separator } = props
        const getContent = (number: Value) => {
          const digit = new Intl.NumberFormat(undefined, {
            minimumSignificantDigits: 2,
            ...(fieldProps?.intlProps || {}),
          }).format(Number(number))
          return fieldProps?.formatter?.(digit) || digit
        }
        const text = props.text
        const dom = (
          <span>
            {getContent(text[0])}
            {' '}
            {separator}
            {' '}
            {getContent(text[1])}
          </span>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const { fieldProps, separator, separatorWidth } = props
        const placeholderValue: string | string[] = fieldProps?.placeholder
          || props.placeholder
          || ['???', '???']

        const getInputNumberPlaceholder = (index: number) =>
          Array.isArray(placeholderValue) ? placeholderValue[index] : placeholderValue

        const handleChange = (index: number, changedValue: Value) => {
          const newValuePair = [...(valuePair.value || [])]
          newValuePair[index] = changedValue === null ? undefined : changedValue
          setValuePair(newValuePair)
        }

        const handleGroupBlur = () => {
          if (Array.isArray(valuePair.value)) {
            const [value0, value1] = valuePair.value
            if (
              typeof value0 === 'number'
              && typeof value1 === 'number'
              && value0 > value1
            ) {
              setValuePair([value1, value0])
              return
            }
            if (value0 === undefined && value1 === undefined) {
              setValuePair(undefined)
            }
          }
        }

        // Strip value/defaultValue/onChange from fieldProps spread
        const { value: _v, defaultValue: _dv, onChange: _oc, id, ...restFieldProps } = fieldProps

        const dom = (
          <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }} onBlur={handleGroupBlur}>
            <InputNumber
              {...({
                ...restFieldProps,
                placeholder: getInputNumberPlaceholder(0),
                id: id ? `${id}-0` : undefined,
                style: { width: `calc((100% - ${separatorWidth}px) / 2)` },
                value: valuePair.value?.[0],
                defaultValue: fieldProps.defaultValue?.[0],
                onChange: (changedValue: Value) => handleChange(0, changedValue),
              } as any)}
            />
            <Input
              style={{
                width: `${separatorWidth}px`,
                textAlign: 'center',
                borderInlineStart: '0',
                borderInlineEnd: '0',
                pointerEvents: 'none',
              }}
              placeholder={separator}
              disabled
            />
            <InputNumber
              {...({
                ...restFieldProps,
                placeholder: getInputNumberPlaceholder(1),
                id: id ? `${id}-1` : undefined,
                style: {
                  width: `calc((100% - ${separatorWidth}px) / 2)`,
                  borderInlineStart: '0',
                },
                value: valuePair.value?.[1],
                defaultValue: fieldProps.defaultValue?.[1],
                onChange: (changedValue: Value) => handleChange(1, changedValue),
              } as any)}
            />
          </span>
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      return null
    }
  },
})
