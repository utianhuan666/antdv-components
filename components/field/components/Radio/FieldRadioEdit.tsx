import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { clsx } from '@v-c/util'
import { RadioGroup } from 'antdv-next'

type Props = Omit<NonNullable<ProFieldFC<GroupProps>['__props']>, 'options'> & {
  options: any[]
  loading: boolean
  radioRef: any
  layoutClassName: string
  wrapSSR: (node: JSX.Element) => JSX.Element
  hashId: string
  status: { status?: string } | undefined
}

export function FieldRadioEdit(props: Props) {
  const {
    radioType,
    formItemRender,
    mode,
    options,
    loading,
    radioRef,
    layoutClassName,
    wrapSSR,
    hashId,
    status,
    ...rest
  } = props

  const dom = wrapSSR(
    <RadioGroup
      ref={radioRef}
      optionType={radioType}
      {...rest.fieldProps}
      class={clsx(
        rest.fieldProps?.class,
        rest.fieldProps?.className,
        {
          [`${layoutClassName}-error`]: status?.status === 'error',
          [`${layoutClassName}-warning`]: status?.status === 'warning',
        },
        hashId,
        `${layoutClassName}-${rest.fieldProps?.layout || 'horizontal'}`,
      )}
      options={options}
    />,
  )

  if (formItemRender)
    return formItemRender(rest.text, { mode, ...rest.fieldProps, options, loading }, dom) ?? null

  return dom
}

export default FieldRadioEdit
