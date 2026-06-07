import type { ProFieldFC } from '../../types'
import type { FieldDigitRangeProps, Value, ValuePair } from './types'
import { defineComponent, ref, watch } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDigitRangeEdit from './FieldDigitRangeEdit'
import FieldDigitRangeRead from './FieldDigitRangeRead'

export type { FieldDigitRangeProps, Value, ValuePair }
type FieldDigitRangeFieldProps = NonNullable<ProFieldFC<FieldDigitRangeProps>['__props']>

const FieldDigitRange = defineComponent(
  (rawProps: { [key: string]: unknown }) => {
    const props = rawProps as FieldDigitRangeFieldProps
    const intl = useIntl()
    const fieldProps = () => props.fieldProps ?? {}
    const valuePair = ref<ValuePair | undefined>(fieldProps().value ?? fieldProps().defaultValue)
    const valuePairRef = ref<ValuePair | undefined>(valuePair.value)

    watch(
      () => fieldProps().value,
      (val) => {
        valuePair.value = val
        valuePairRef.value = val
      },
    )

    const setValuePair = (updater: ValuePair | undefined | ((prev: ValuePair | undefined) => ValuePair | undefined)) => {
      const prev = valuePair.value
      const next = typeof updater === 'function' ? updater(prev) : updater
      valuePair.value = next
      valuePairRef.value = next
      fieldProps().onChange?.(next)
    }

    return () => {
      const {
        text = [],
        mode = 'read',
        render,
        formItemRender,
        placeholder,
        separator = '~',
        separatorWidth = 30,
      } = props
      const currentFieldProps = fieldProps()

      if (isProFieldReadMode(mode)) {
        return FieldDigitRangeRead({
          text,
          mode,
          render,
          formItemRender,
          fieldProps: currentFieldProps,
          placeholder,
          separator,
          separatorWidth,
        })
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldDigitRangeEdit({
          text,
          mode,
          render,
          formItemRender,
          fieldProps: currentFieldProps,
          placeholder,
          separator,
          separatorWidth,
          valuePair: valuePair.value,
          valuePairRef,
          setValuePair,
          token: {},
          placeholderValue: currentFieldProps?.placeholder || placeholder || [
            intl.getMessage('tableForm.inputPlaceholder', '请输入'),
            intl.getMessage('tableForm.inputPlaceholder', '请输入'),
          ],
        })
      }

      return null
    }
  },
  {
    name: 'FieldDigitRange',
    props: [
      'text',
      'mode',
      'render',
      'formItemRender',
      'fieldProps',
      'emptyText',
      'placeholder',
      'separator',
      'separatorWidth',
    ],
  },
)

export default FieldDigitRange
