import type { ProFieldFC } from '../../types'
import type { FieldDigitRangeProps, Value, ValuePair } from './types'
import { defineComponent, ref, watch } from 'vue'
import { proTheme, useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDigitRangeEdit from './FieldDigitRangeEdit'
import FieldDigitRangeRead from './FieldDigitRangeRead'

export type { FieldDigitRangeProps, Value, ValuePair }
export type FieldDigitRangeExpose = Partial<HTMLSpanElement>
type FieldDigitRangeFieldProps = NonNullable<ProFieldFC<FieldDigitRangeProps>['__props']>

const FieldDigitRange = defineComponent<FieldDigitRangeFieldProps>({
  name: 'FieldDigitRange',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'placeholder',
    'separator',
    'separatorWidth',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps
    const intl = useIntl()
    const { token } = proTheme.useToken()
    const innerRef = ref<HTMLSpanElement | null>(null)

    // 镜像 React forwardRef：把内层只读 span 实例方法透传给父级 ref
    expose(
      new Proxy({} as FieldDigitRangeExpose, {
        get(_target, key: PropertyKey) {
          return innerRef.value ? Reflect.get(innerRef.value, key) : undefined
        },
        has(_target, key: PropertyKey) {
          return innerRef.value ? key in innerRef.value : false
        },
      }),
    )

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
        }, innerRef)
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
          token: token.value,
          placeholderValue: currentFieldProps?.placeholder || placeholder || [
            intl.getMessage('tableForm.inputPlaceholder', '请输入'),
            intl.getMessage('tableForm.inputPlaceholder', '请输入'),
          ],
        })
      }

      return null
    }
  },
})

export default FieldDigitRange
