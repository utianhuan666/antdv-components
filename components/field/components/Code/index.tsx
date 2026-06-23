import type { ProFieldFC } from '../../types'
import { defineComponent, ref } from 'vue'
import { proTheme } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldCodeEdit from './FieldCodeEdit'
import FieldCodeRead from './FieldCodeRead'
import { languageFormat } from './utils'

type FieldCodeProps = NonNullable<ProFieldFC<{
  text: string
  language?: 'json' | 'text'
}>['__props']>

type FieldCodeEditInstance = InstanceType<typeof import('antdv-next')['TextArea']>
type FieldCodeInnerRef = FieldCodeEditInstance | HTMLPreElement
export type FieldCodeExpose = Partial<FieldCodeEditInstance> & Partial<HTMLPreElement>

/**
 * 代码片段组件 这个组件为了显示简单的配置，复杂的请使用更加重型的组件
 */
const FieldCode = defineComponent<FieldCodeProps>({
  name: 'FieldCode',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'language',
    'render',
    'formItemRender',
    'fieldProps',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps as FieldCodeProps
    const { token } = proTheme.useToken()
    const innerRef = ref<FieldCodeInnerRef | null>(null)

    expose(createRefProxy<FieldCodeInnerRef>(innerRef))

    return () => {
      const text = props.text ?? ''
      const mode = props.mode ?? 'read'
      const language = props.language ?? 'text'
      const code = languageFormat(text, language)

      if (isProFieldReadMode(mode)) {
        return FieldCodeRead({
          ...props,
          text,
          mode,
          language,
          code,
          token: token.value,
        }, innerRef)
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldCodeEdit({
          ...props,
          text,
          mode,
          language,
          code,
        }, innerRef)
      }

      return null
    }
  },
})

export default FieldCode
