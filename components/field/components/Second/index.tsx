import type { ProFieldFC } from '../../types'
import type { FieldSecondProps } from './types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSecondEdit from './FieldSecondEdit'
import FieldSecondRead from './FieldSecondRead'
import { formatSecond } from './utils'

export { formatSecond }
export type { FieldDigitProps, FieldSecondProps } from './types'
type FieldSecondInstance = InstanceType<typeof import('antdv-next')['InputNumber']>
type FieldSecondInnerRef = FieldSecondInstance | HTMLSpanElement
export type FieldSecondExpose = Partial<FieldSecondInstance> & Partial<HTMLSpanElement>
type FieldSecondFieldProps = NonNullable<ProFieldFC<FieldSecondProps>['__props']>

const FieldSecond = defineComponent<FieldSecondFieldProps>({
  name: 'FieldSecond',
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
    const secondRef = ref<FieldSecondInnerRef | null>(null)

    expose(
      new Proxy({} as FieldSecondExpose, {
        get(_target, key: string) {
          return secondRef.value?.[key as keyof FieldSecondInnerRef]
        },
        has(_target, key: string) {
          return !!secondRef.value && key in secondRef.value
        },
      }),
    )

    return () => {
      const props = rawProps as FieldSecondFieldProps
      const {
        text = 0,
        mode: type = 'read',
        render,
        placeholder,
        formItemRender,
        fieldProps = {},
      } = props

      const placeholderValue = placeholder || intl.getMessage('tableForm.inputPlaceholder', '请输入')

      if (isProFieldReadMode(type)) {
        return FieldSecondRead({
          text,
          mode: type,
          render,
          placeholder,
          formItemRender,
          fieldProps,
        }, secondRef)
      }

      if (isProFieldEditOrUpdateMode(type)) {
        return FieldSecondEdit({
          text,
          mode: type,
          render,
          placeholder,
          formItemRender,
          fieldProps,
          placeholderValue,
        }, secondRef)
      }

      return null
    }
  },
})

export default FieldSecond
