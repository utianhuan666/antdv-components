import type { ProFieldFC } from '../../types'
import { computed, defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { toNumber } from '../Percent/util'
import { FieldProgressEdit } from './FieldProgressEdit'
import { FieldProgressRead } from './FieldProgressRead'
import { getProgressStatus } from './utils'

export { getProgressStatus }

type FieldProgressEditInstance = InstanceType<typeof import('antdv-next')['InputNumber']>
type FieldProgressReadInstance = InstanceType<typeof import('antdv-next')['Progress']>
type FieldProgressInnerRef = FieldProgressEditInstance | FieldProgressReadInstance
export type FieldProgressExpose = Partial<FieldProgressEditInstance> & Partial<FieldProgressReadInstance>

type FieldProgressProps = NonNullable<ProFieldFC<{
  text: number | string
  placeholder?: string
}>['__props']>

/**
 * 进度条组件
 */
const FieldProgress = defineComponent<FieldProgressProps>({
  name: 'FieldProgress',
  inheritAttrs: false,
  props: ['text', 'mode', 'render', 'formItemRender', 'fieldProps', 'placeholder'],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const innerRef = ref<FieldProgressInnerRef | null>(null)

    expose(
      new Proxy({} as FieldProgressExpose, {
        get(_target, key: string) {
          return innerRef.value?.[key as keyof FieldProgressInnerRef]
        },
        has(_target, key: string) {
          return !!innerRef.value && key in innerRef.value
        },
      }),
    )

    return () => {
      const props = rawProps as FieldProgressProps
      const { text, mode, placeholder } = props
      const placeholderValue = placeholder || intl.getMessage('tableForm.inputPlaceholder', '请输入')
      const realValue = computed(() =>
        typeof text === 'string' && (text as string).includes('%')
          ? toNumber((text as string).replace('%', ''))
          : toNumber(text),
      )
      if (isProFieldReadMode(mode)) {
        return FieldProgressRead({ ...props, realValue: realValue.value }, innerRef)
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldProgressEdit({ ...props, placeholderValue }, innerRef)
      }
      return null
    }
  },
})

export default FieldProgress
