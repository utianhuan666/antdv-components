import type { Ref, VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps } from '../Select'
import { omit } from '@v-c/util'
import { Segmented } from 'antdv-next'

type FieldSegmentedProps = NonNullable<ProFieldFC<{
  text: string
  emptyText?: VNodeChild
} & FieldSelectProps>['__props']>

type Props = FieldSegmentedProps & {
  options: any[]
  loading: boolean
  inputRef: Ref<HTMLInputElement | null>
}

export function FieldSegmentedEdit(props: Props) {
  const { text, mode, formItemRender, fieldProps, options, loading, inputRef } = props
  const dom = (
    <Segmented
      ref={inputRef as any}
      {...(omit(fieldProps || {}, ['allowClear']) as object)}
      options={options}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps, options, loading }, dom)

  return dom
}

export default FieldSegmentedEdit
