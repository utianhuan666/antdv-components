import type { ProFieldFC } from '../../types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldTextAreaEdit from './FieldTextAreaEdit'
import FieldTextAreaRead from './FieldTextAreaRead'

type FieldTextAreaProps = NonNullable<ProFieldFC<{
  text: string | number
}>['__props']>

type FieldTextAreaEditInstance = InstanceType<typeof import('antdv-next')['TextArea']>
interface FieldTextAreaReadExpose {
  $el?: HTMLElement | null
}
type FieldTextAreaInnerRef = FieldTextAreaEditInstance | FieldTextAreaReadExpose
export type FieldTextAreaExpose = Partial<FieldTextAreaEditInstance> & FieldTextAreaReadExpose

const FieldTextArea = defineComponent<FieldTextAreaProps>({
  name: 'FieldTextArea',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'emptyText',
  ],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const inputRef = ref<FieldTextAreaInnerRef | null>(null)

    expose(createRefProxy<FieldTextAreaInnerRef>(inputRef))

    return () => {
      const props = rawProps as FieldTextAreaProps
      const { mode } = props

      if (isProFieldReadMode(mode))
        return FieldTextAreaRead(props, inputRef)

      if (isProFieldEditOrUpdateMode(mode))
        return FieldTextAreaEdit({ ...props, intl }, inputRef)

      return null
    }
  },
}) as unknown as ProFieldFC<{
  text: string | number
}>

export default FieldTextArea
