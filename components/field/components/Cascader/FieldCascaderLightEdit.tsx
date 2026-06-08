import type { CascaderProps } from 'antdv-next'
import type { IntlType } from '../../../provider'
import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { LoadingOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Cascader } from 'antdv-next'
import { FieldLabel } from '../../../utils'

type Props = Omit<NonNullable<ProFieldFC<GroupProps>['__props']>, 'options'> & {
  options: NonNullable<CascaderProps['options']>
  loading: boolean
  layoutClassName: string
  open: boolean
  setOpen: (updater: boolean | ((prev: boolean) => boolean)) => void
  cascaderRef: any
  intl: IntlType
}

export function FieldCascaderLightEdit(props: Props) {
  const {
    placeholder,
    formItemRender,
    mode,
    label,
    variant,
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

  const { disabled, value } = fieldProps
  const notEmpty = !!value && value?.length !== 0

  const handleLabelClick = () => {
    if (disabled)
      return
    setOpen(true)
    fieldProps.onOpenChange?.(true)
  }

  return (
    <FieldLabel
      label={label}
      disabled={disabled}
      variant={variant}
      value={notEmpty || open ? dom : null}
      style={notEmpty ? { paddingInlineEnd: 0 } : undefined}
      allowClear={false}
      downIcon={notEmpty || open ? false : undefined}
      onClick={handleLabelClick}
    />
  )
}

export default FieldCascaderLightEdit
