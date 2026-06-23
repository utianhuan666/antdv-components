import type { Ref, VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps } from '../Select/types'
import { omit } from '@v-c/util'
import { Segmented } from 'antdv-next'

type SegmentedInstance = InstanceType<typeof import('antdv-next')['Segmented']>

type FieldSegmentedProps = NonNullable<ProFieldFC<{
  text: string
  emptyText?: VNodeChild
} & FieldSelectProps>['__props']>

type Props = FieldSegmentedProps & {
  options: any[]
  loading: boolean
}

export function FieldSegmentedEdit(props: Props, ref?: Ref<SegmentedInstance | null>) {
  const { text, mode, formItemRender, fieldProps, options, loading } = props
  const dom = (
    <Segmented
      ref={ref}
      {...omit(fieldProps || {}, ['allowClear'])}
      options={options}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps, options, loading }, dom)

  return dom
}

export default FieldSegmentedEdit
