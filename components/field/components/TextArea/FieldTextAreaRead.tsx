import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import { omit } from '@v-c/util'
import FieldTextAreaReadonly from './readonly'

type TextAreaReadonlyExpose = {
  $el?: HTMLElement | null
}

type Props = NonNullable<ProFieldFC<{ text: string | number }>['__props']>

export function FieldTextAreaRead(props: Props, ref?: Ref<TextAreaReadonlyExpose | InstanceType<typeof import('antdv-next')['TextArea']> | null>) {
  const { text, mode, render, fieldProps, emptyText } = props
  const dom = (
    <FieldTextAreaReadonly
      ref={ref}
      text={text}
      fieldProps={fieldProps}
      emptyText={emptyText}
    />
  )

  if (render) {
    return render(
      text,
      {
        text,
        mode,
        ...omit(fieldProps || {}, ['showCount']),
      },
      dom,
    )
  }

  return dom
}

export default FieldTextAreaRead
