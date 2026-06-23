import type { CSSProperties } from 'vue'
import type { ProFieldFC } from '../../types'
import { clsx, omit } from '@v-c/util'
import { defineComponent } from 'vue'
import { useStyle } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

type FieldTextAreaReadonlyProps = NonNullable<ProFieldFC<{
  text: string | number
}>['__props']>

const FieldTextAreaReadonly = defineComponent<FieldTextAreaReadonlyProps>({
  name: 'FieldTextAreaReadonly',
  props: [
    'text',
    'fieldProps',
    'emptyText',
  ],
  setup(props, { expose }) {
    const readonlyClassName = useProPrefixCls('pro-field-readonly')
    const compClassName = `${readonlyClassName.value}-textarea`
    const { wrapSSR, hashId } = useStyle('TextArea', () => ({
      [`.${compClassName}`]: {
        display: 'inline-block',
        lineHeight: '1.5715',
        maxWidth: '100%',
        whiteSpace: 'pre-wrap',
      },
    }))

    let readonlyRef: HTMLElement | null = null
    expose({
      get $el() {
        return readonlyRef
      },
    })

    return () => {
      const { text, fieldProps, emptyText = '-' } = props
      const restFieldProps = omit(fieldProps || {}, ['autoSize', 'classNames', 'styles'])

      return wrapSSR(
        <span
          ref={(instance) => {
            readonlyRef = instance as HTMLElement | null
          }}
          class={clsx(hashId, readonlyClassName.value, compClassName, restFieldProps.class)}
          {...restFieldProps}
          style={restFieldProps.style as CSSProperties | undefined}
        >
          {text ?? emptyText}
        </span>,
      )
    }
  },
})

export { FieldTextAreaReadonly }
export default FieldTextAreaReadonly
