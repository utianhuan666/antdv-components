import type { ProFieldFC } from '../../types'
import type { PercentPropInt } from './types'
import { InputNumber } from 'antdv-next'

type Props = NonNullable<ProFieldFC<PercentPropInt>['__props']> & {
  placeholderValue: string
}

export function FieldPercentEdit(props: Props) {
  const { text, mode, formItemRender, fieldProps, prefix, placeholderValue } = props
  const dom = (
    <InputNumber
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
