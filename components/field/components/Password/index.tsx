import type { ProFieldFC } from '../../types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldPasswordEdit from './FieldPasswordEdit'
import FieldPasswordRead from './FieldPasswordRead'

type FieldPasswordProps = NonNullable<ProFieldFC<{
  text: string | number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>['__props']>

type FieldPasswordEditInstance = InstanceType<typeof import('antdv-next')['InputPassword']>
type FieldPasswordInnerRef = FieldPasswordEditInstance | HTMLSpanElement
export type FieldPasswordExpose = Partial<FieldPasswordEditInstance> & Partial<HTMLSpanElement>

const FieldPassword = defineComponent<FieldPasswordProps>({
  name: 'FieldPassword',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'open',
    'onOpenChange',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps
    const intl = useIntl()
    const openRef = ref(false)
    const innerRef = ref<FieldPasswordInnerRef | null>(null)
    const getOpen = () => props.open ?? openRef.value

    expose(createRefProxy<FieldPasswordInnerRef>(innerRef))

    const setOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof updater === 'function' ? updater(getOpen()) : updater
      if (props.open === undefined)
        openRef.value = next
      props.onOpenChange?.(next)
    }

    return () => {
      const text = props.text ?? ''
      const mode = props.mode ?? 'read'

      if (isProFieldReadMode(mode)) {
        return FieldPasswordRead({
          text,
          mode,
          render: props.render,
          fieldProps: props.fieldProps,
          open: getOpen(),
          setOpen,
        }, innerRef)
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldPasswordEdit({
          text,
          mode,
          formItemRender: props.formItemRender,
          fieldProps: props.fieldProps,
          intl,
        }, innerRef)
      }

      return null
    }
  },
})

export default FieldPassword
