import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldDigitRangeProps, Value, ValuePair } from './types'
import { omit } from '@v-c/util'
import { Input, InputNumber } from 'antdv-next'

type Props = NonNullable<ProFieldFC<FieldDigitRangeProps>['__props']> & {
  valuePair: ValuePair | undefined
  valuePairRef: Ref<ValuePair | undefined>
  setValuePair: (
    updater:
      | ValuePair
      | undefined
      | ((prev: ValuePair | undefined) => ValuePair | undefined)
  ) => void
  token: { colorBgContainer?: string }
  placeholderValue: string | string[]
}

export function FieldDigitRangeEdit(props: Props) {
  const {
    text,
    mode: type,
    formItemRender,
    fieldProps,
    separator = '~',
    separatorWidth = 30,
    valuePair,
    valuePairRef,
    setValuePair,
    token,
    placeholderValue,
  } = props

  const getInputNumberPlaceholder = (index: number) =>
    Array.isArray(placeholderValue) ? placeholderValue[index] : placeholderValue

  const handleChange = (index: number, changedValue: Value) => {
    const newValuePair = [...(valuePair || [])]
    newValuePair[index] = changedValue === null ? undefined : changedValue
    valuePairRef.value = newValuePair
    setValuePair(newValuePair)
  }

  const handleGroupBlur = () => {
    if (Array.isArray(valuePairRef.value)) {
      const [value0, value1] = valuePairRef.value
      if (
        typeof value0 === 'number'
        && typeof value1 === 'number'
        && value0 > value1
      ) {
        setValuePair([value1, value0])
        return
      }

      if (value0 === undefined && value1 === undefined)
        setValuePair(undefined)
    }
  }

  const { defaultValue, id } = fieldProps
  const restFieldProps = omit(fieldProps || {}, ['value', 'defaultValue', 'onChange', 'id'])

  const dom = (
    <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }} onBlur={handleGroupBlur}>
      <InputNumber
        {...({
          ...restFieldProps,
          placeholder: getInputNumberPlaceholder(0),
          id: id ? `${id}-0` : undefined,
          style: { width: `calc((100% - ${separatorWidth}px) / 2)` },
          value: valuePair?.[0],
          defaultValue: defaultValue?.[0],
          onChange: (changedValue: Value) => handleChange(0, changedValue),
        } as any)}
      />
      <Input
        style={{
          width: `${separatorWidth}px`,
          textAlign: 'center',
          borderInlineStart: 0,
          borderInlineEnd: 0,
          pointerEvents: 'none',
          backgroundColor: token?.colorBgContainer,
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
            borderInlineStart: 0,
          },
          value: valuePair?.[1],
          defaultValue: defaultValue?.[1],
          onChange: (changedValue: Value) => handleChange(1, changedValue),
        } as any)}
      />
    </span>
  )

  if (formItemRender)
    return formItemRender(text, { mode: type, ...fieldProps }, dom)

  return dom
}

export default FieldDigitRangeEdit
