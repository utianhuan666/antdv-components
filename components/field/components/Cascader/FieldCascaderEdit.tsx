import type { CascaderProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { LoadingOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Cascader } from 'antdv-next'

type Props = Omit<NonNullable<ProFieldFC<GroupProps>['__props']>, 'options'> & {
  options: NonNullable<CascaderProps['options']>
  loading: boolean
  layoutClassName: string
  open: boolean
  setOpen: (updater: boolean | ((prev: boolean) => boolean)) => void
  cascaderRef: any
  intl: {
    getMessage: (id: string, defaultMessage: string) => string
  }
}

export function FieldCascaderEdit(props: Props) {
  const {
    placeholder,
    formItemRender,
    mode,
    variant: _variant,
    options,
    loading,
    layoutClassName,
    open,
    setOpen,
    cascaderRef,
    intl,
    ...rest
  } = props

  const fieldProps = rest.fieldProps || {}
  let dom: any = (
    <Cascader
      ref={cascaderRef}
      open={open}
      suffixIcon={loading ? <LoadingOutlined /> : undefined}
      placeholder={placeholder || intl.getMessage('tableForm.selectPlaceholder', '请选择')}
      allowClear={fieldProps.allowClear !== false}
      {...fieldProps}
      onOpenChange={(isOpen: boolean) => {
        fieldProps.onOpenChange?.(isOpen)
        setOpen(isOpen)
      }}
      class={clsx(fieldProps.className, layoutClassName)}
      options={options}
    />
  )

  if (formItemRender)
    dom = formItemRender(rest.text, { mode, ...fieldProps, options, loading }, dom) ?? null

  return dom
}

export default FieldCascaderEdit
