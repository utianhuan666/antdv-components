import type { TreeSelectProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { TreeSelectFieldProps } from './types'
import { clsx } from '@v-c/util'
import { Spin, TreeSelect } from 'antdv-next'

type TreeSelectShowSearchObject = Exclude<
  TreeSelectProps['showSearch'],
  boolean | undefined
>

export interface FieldTreeSelectEditProps {
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
  intl: {
    getMessage: (id: string, defaultMessage: string) => string
  }
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

export function FieldTreeSelectEdit({
  text,
  mode,
  formItemRender,
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
}: FieldTreeSelectEditProps) {
  let dom: any = (
    <Spin spinning={loading}>
      <TreeSelect
        ref={treeSelectRef}
        open={open}
        popupMatchSelectWidth
        placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
        {...fieldProps}
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
          fieldProps?.onOpenChange?.(isOpen)
          setOpen(isOpen)
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

  return dom
}

export default FieldTreeSelectEdit
