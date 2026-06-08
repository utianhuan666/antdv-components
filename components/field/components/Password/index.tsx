import type { ProFieldFC } from '../../types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldPasswordEdit from './FieldPasswordEdit'
import FieldPasswordRead from './FieldPasswordRead'

type FieldPasswordProps = NonNullable<ProFieldFC<{
  text: string | number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>['__props']>

const FieldPassword = defineComponent<FieldPasswordProps>({
  name: 'FieldPassword',
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'open',
    'onOpenChange',
  ],
  setup(rawProps) {
    const props = rawProps
    const intl = useIntl()
    const openRef = ref(false)
    const getOpen = () => props.open ?? openRef.value

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
        })
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldPasswordEdit({
          text,
          mode,
          formItemRender: props.formItemRender,
          fieldProps: props.fieldProps,
          intl,
        })
      }

      return null
    }
  },
})

export default FieldPassword
