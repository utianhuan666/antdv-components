import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { clsx, omit } from '@v-c/util'
import { CheckboxGroup } from 'antdv-next'

type Props = Omit<NonNullable<ProFieldFC<GroupProps>['__props']>, 'options'> & {
  layout: 'horizontal' | 'vertical'
  options: any[]
  loading: boolean
  layoutClassName: string
  wrapSSR: (node: JSX.Element) => JSX.Element
  hashId: string
  status: { status?: string } | undefined
}

export function FieldCheckboxEdit(props: Props) {
  const {
    layout,
    formItemRender,
    mode,
    options,
    loading,
    layoutClassName,
    wrapSSR,
    hashId,
    status,
    ...rest
  } = props

  const { fieldNames: _fieldNames, variant: _variant, ...restFieldProps } = omit(rest.fieldProps || {}, ['fieldNames'])
  const dom = wrapSSR(
    <CheckboxGroup
      {...(restFieldProps as any)}
      class={clsx(
        rest.fieldProps?.class,
        rest.fieldProps?.className,
        hashId,
        `${layoutClassName}-${layout}`,
        {
          [`${layoutClassName}-error`]: status?.status === 'error',
          [`${layoutClassName}-warning`]: status?.status === 'warning',
        },
      )}
      options={options}
    />,
  )

  if (formItemRender)
    return formItemRender(rest.text, { mode, ...rest.fieldProps, options, loading }, dom) ?? null

  return dom
}

export default FieldCheckboxEdit
