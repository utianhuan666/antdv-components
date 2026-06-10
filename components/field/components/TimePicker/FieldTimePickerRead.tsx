import type { Ref } from 'vue'
import type { ProFieldFC, ProFieldLightProps } from '../../types'
import dayjs from 'dayjs'

type Props = NonNullable<
  ProFieldFC<
    {
      text: string | number
      format?: string
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    } & ProFieldLightProps
  >['__props']
> & {
  finalFormat: string
}

export function FieldTimePickerRead(props: Props, ref?: Ref) {
  const { text, mode, render, finalFormat } = props
  const fieldProps = props.fieldProps || {}
  const isNumberOrMoment = dayjs.isDayjs(text) || typeof text === 'number'
  const dom = (
    <span ref={ref}>
      {text
        ? dayjs(text, isNumberOrMoment ? undefined : finalFormat).format(finalFormat)
        : '-'}
    </span>
  )
  if (render)
    return render(text, { mode, ...fieldProps }, <span>{dom}</span>)
  return dom
}

export default FieldTimePickerRead
