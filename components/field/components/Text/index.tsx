import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import { defineComponent, onMounted, ref } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldTextEdit from './FieldTextEdit'
import FieldTextRead from './FieldTextRead'

type FieldTextProps = NonNullable<ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}>['__props']>

const FieldText = defineComponent<FieldTextProps>({
  name: 'FieldText',
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'emptyText',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps
    const intl = useIntl()
    const inputRef = ref<any>(null)

    onMounted(() => {
      if (props.fieldProps?.autoFocus) {
        queueMicrotask(() => {
          inputRef.value?.focus?.()
        })
      }
    })

    expose({
      inputRef,
      focus: () => inputRef.value?.focus?.(),
      blur: () => inputRef.value?.blur?.(),
    })

    return () => {
      const text = props.text ?? ''
      const mode = props.mode ?? 'read'
      const emptyText = props.emptyText ?? '-'

      if (isProFieldReadMode(mode)) {
        return FieldTextRead({
          text,
          mode,
          render: props.render,
          fieldProps: props.fieldProps,
          emptyText,
        })
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldTextEdit({
          text,
          mode,
          render: props.render,
          formItemRender: props.formItemRender,
          fieldProps: props.fieldProps,
          emptyText,
          inputRef,
          intl,
        })
      }

      return null
    }
  },
}) as unknown as ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}>

export default FieldText
