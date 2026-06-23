import type { InputRef } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import { defineComponent, onMounted, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldTextEdit from './FieldTextEdit'
import FieldTextRead from './FieldTextRead'

type FieldTextProps = NonNullable<ProFieldFC<{
  text: string
  emptyText?: VNodeChild
}>['__props']>

type FieldTextInstance = InputRef
export type FieldTextExpose = Partial<FieldTextInstance>

const FieldText = defineComponent<FieldTextProps>({
  name: 'FieldText',
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
    const props = rawProps
    const intl = useIntl()
    const inputRef = ref<FieldTextInstance | null>(null)

    onMounted(() => {
      if (props.fieldProps?.autoFocus) {
        queueMicrotask(() => {
          inputRef.value?.focus?.()
        })
      }
    })

    expose(createRefProxy<FieldTextInstance>(inputRef))

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
        return FieldTextEdit(
          {
            text,
            mode,
            render: props.render,
            formItemRender: props.formItemRender,
            fieldProps: props.fieldProps,
            emptyText,
            intl,
          },
          inputRef,
        )
      }

      return null
    }
  },
}) as unknown as ProFieldFC<{
  text: string | number | boolean | unknown[]
  emptyText?: VNodeChild
}>

export default FieldText
