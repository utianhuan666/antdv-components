import type { TreeSelectProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { IntlType } from '../../../provider'
import type { TreeSelectFieldProps } from './types'
import { clsx } from '@v-c/util'
import { Spin, TreeSelect } from 'antdv-next'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'

type TreeSelectShowSearchObject = Exclude<
  TreeSelectProps['showSearch'],
  boolean | undefined
>

export interface FieldTreeSelectLightEditProps {
  text: string
  mode: 'edit'
  formItemRender?: (
    text: any,
    props: Record<string, any>,
    dom: VNodeChild,
  ) => VNodeChild
  label?: any
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  fieldProps: TreeSelectFieldProps
  open: boolean
  setOpen: (updater: boolean | ((prev: boolean) => boolean)) => void
  treeSelectRef: any
  intl: IntlType
  loading: boolean
  options: NonNullable<TreeSelectProps['treeData']>
  fetchData: (keyWord?: string) => void
  fetchDataOnSearch?: boolean
  hasRequest: boolean
  showSearch: TreeSelectProps['showSearch']
  showSearchConfig: TreeSelectShowSearchObject | Record<string, never>
  searchValue: string | undefined
  setSearchValue: (
    updater:
      | string
      | undefined
      | ((prev: string | undefined) => string | undefined),
  ) => void
  autoClearSearchValue: boolean | undefined
  onClear?: () => void
  treeSelectOnChange: TreeSelectProps<any>['onChange']
  onBlur?: TreeSelectProps['onBlur']
  layoutClassName: string
}

export function FieldTreeSelectLightEdit({
  text,
  mode,
  formItemRender,
  label,
  variant,
  fieldProps,
  open,
  setOpen,
  treeSelectRef,
  intl,
  loading,
  options,
  fetchData,
  fetchDataOnSearch,
  hasRequest,
  showSearch,
  showSearchConfig,
  searchValue,
  setSearchValue,
  autoClearSearchValue,
  onClear,
  treeSelectOnChange,
  onBlur,
  layoutClassName,
}: FieldTreeSelectLightEditProps) {
  const valuesLength = Array.isArray(fieldProps?.value) ? fieldProps.value.length : 0
  let dom: any = (
    <Spin spinning={loading}>
      <TreeSelect
        ref={treeSelectRef}
        {...fieldProps}
        open={open}
        popupMatchSelectWidth={false}
        placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
        tagRender={(item: any) => {
          if (valuesLength < 2)
            return <>{item.label}</>
          const itemIndex = fieldProps?.value?.findIndex((value: any) =>
            value === item.value || value?.value === item.value,
          )
          return (
            <>
              {item.label}
              {' '}
              {itemIndex < valuesLength - 1 ? ',' : ''}
            </>
          )
        }}
        treeData={options}
        showSearch={showSearch
          ? {
              ...showSearchConfig,
              searchValue,
              autoClearSearchValue,
              onSearch: (value: string) => {
                if (fetchDataOnSearch && hasRequest)
                  fetchData(value)
                setSearchValue(value)
              },
            }
          : showSearch}
        style={{ minWidth: 60, ...fieldProps?.style }}
        allowClear={fieldProps?.allowClear !== false}
        onOpenChange={(isOpen: boolean) => {
          setOpen(isOpen)
          fieldProps?.onOpenChange?.(isOpen)
        }}
        onClear={() => {
          onClear?.()
          fetchData(undefined)
          if (showSearch)
            setSearchValue(undefined)
        }}
        onChange={treeSelectOnChange}
        onBlur={(event: FocusEvent) => {
          setSearchValue(undefined)
          fetchData(undefined)
          onBlur?.(event)
        }}
        class={clsx(fieldProps?.className, layoutClassName)}
      />
    </Spin>
  )

  if (formItemRender) {
    dom = formItemRender(
      text,
      { mode, ...fieldProps, options, loading } as any,
      dom,
    ) ?? null
  }

  const { disabled, placeholder, value } = fieldProps
  const notEmpty = !!value && value?.length !== 0
  const handleLabelClick = () => {
    if (disabled)
      return
    setOpen(true)
    fieldProps?.onOpenChange?.(true)
  }

  return (
    <FieldLabel
      label={label}
      disabled={disabled}
      placeholder={placeholder as any}
      variant={variant}
      value={notEmpty || open ? dom : null}
      style={notEmpty ? { paddingInlineEnd: 0 } : undefined}
      allowClear={false}
      downIcon={false}
      onLabelClick={handleLabelClick}
    />
  )
}

export default FieldTreeSelectLightEdit
