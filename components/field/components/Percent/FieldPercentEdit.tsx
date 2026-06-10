import type { Ref } from 'vue'
import type { ProFieldFC } from '../../types'
import type { PercentPropInt } from './types'
import { InputNumber } from 'antdv-next'

type InputNumberInstance = InstanceType<typeof import('antdv-next')['InputNumber']>

type Props = NonNullable<ProFieldFC<PercentPropInt>['__props']> & {
  placeholderValue: string
}

export function FieldPercentEdit(props: Props, ref?: Ref<InputNumberInstance | HTMLSpanElement | null>) {
  const { text, mode, formItemRender, fieldProps, prefix, placeholderValue } = props
  const dom = (
    <InputNumber
      ref={ref}
      {...({
        formatter: (value: string | number | undefined) => {
          if (value && prefix)
            return `${prefix} ${value}`.replace(/\B(?=(\d{3})+(?!\d)$)/g, ',')

          return value as string
        },
        parser: (value: string | undefined) => (value ? value.replace(/.*\s|,/g, '') : ''),
        placeholder: placeholderValue,
        ...fieldProps,
      } as any)}
    />
  )

  if (formItemRender)
    return formItemRender(text, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldPercentEdit
