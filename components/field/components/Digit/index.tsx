import type { ProFieldFC } from '../../types'
import type { FieldDigitProps } from './types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDigitEdit from './FieldDigitEdit'
import FieldDigitRead from './FieldDigitRead'

export type { FieldDigitProps }
type FieldDigitInstance = InstanceType<typeof import('antdv-next')['InputNumber']>
type FieldDigitInnerRef = FieldDigitInstance | HTMLSpanElement
export type FieldDigitExpose = Partial<FieldDigitInstance> & Partial<HTMLSpanElement>
type FieldDigitFieldProps = NonNullable<ProFieldFC<FieldDigitProps>['__props']>

/**
 * 数字组件
 */
const FieldDigit = defineComponent<FieldDigitFieldProps>({
  name: 'FieldDigit',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'placeholder',
    'formItemRender',
    'fieldProps',
  ],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const innerRef = ref<FieldDigitInnerRef | null>(null)

    expose(
      new Proxy({} as FieldDigitExpose, {
        get(_target, key: string) {
          return innerRef.value?.[key as keyof FieldDigitInnerRef]
        },
        has(_target, key: string) {
          return innerRef.value ? key in innerRef.value : false
        },
      }),
    )

    return () => {
      const {
        text,
        mode: type = 'read',
        render,
        placeholder,
        formItemRender,
        fieldProps = {},
      } = rawProps as FieldDigitFieldProps

      const placeholderValue = placeholder || intl.getMessage('tableForm.inputPlaceholder', '请输入')

      if (isProFieldReadMode(type)) {
        return FieldDigitRead({
          text,
          mode: type,
          render,
          placeholder,
          formItemRender,
          fieldProps,
        }, innerRef)
      }

      if (isProFieldEditOrUpdateMode(type)) {
        return FieldDigitEdit({
          text,
          mode: type,
          render,
          placeholder,
          formItemRender,
          fieldProps,
          placeholderValue,
        }, innerRef)
      }

      return null
    }
  },
})

export default FieldDigit
