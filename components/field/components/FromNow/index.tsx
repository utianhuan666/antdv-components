import type { ProFieldFC } from '../../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldFromNowEdit from './FieldFromNowEdit'
import FieldFromNowRead from './FieldFromNowRead'
import '../../initDayjs'

dayjs.extend(relativeTime)

interface FieldFromNowOwnProps {
  text: string
  format?: string
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
}

type FieldFromNowInstance = InstanceType<typeof import('antdv-next')['DatePicker']>
export type FieldFromNowExpose = Partial<FieldFromNowInstance>

type FieldFromNowProps = NonNullable<ProFieldFC<FieldFromNowOwnProps>['__props']>

/**
 * 与当前的时间进行比较 http://momentjs.cn/docs/displaying/fromnow.html
 */
const FieldFromNow = defineComponent<FieldFromNowProps>({
  name: 'FieldFromNow',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'format',
    'variant',
    'render',
    'formItemRender',
    'fieldProps',
  ],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const innerRef = ref<FieldFromNowInstance | null>(null)

    expose(createRefProxy<FieldFromNowInstance>(innerRef))

    return () => {
      const props = rawProps as FieldFromNowProps
      const text = props.text ?? ''
      const mode = props.mode ?? 'read'

      if (isProFieldReadMode(mode)) {
        return FieldFromNowRead({ ...props, text, mode })
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldFromNowEdit({ ...props, text, mode, intl }, innerRef)
      }

      return null
    }
  },
})

export default FieldFromNow
