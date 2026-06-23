import type { TreeSelectProps } from 'antdv-next'
import type { Ref, VNodeChild } from 'vue'
import type { IntlType, ProFieldFCRenderProps } from '../../../provider'
import type { TreeSelectFieldProps } from './types'
import { clsx } from '@v-c/util'
import { Spin, TreeSelect } from 'antdv-next'
import { defineComponent, nextTick, onMounted, onUpdated, ref } from 'vue'

type TreeSelectShowSearchObject = Exclude<
  TreeSelectProps['showSearch'],
  boolean | undefined
>
type TreeSelectInstance = InstanceType<typeof import('antdv-next')['TreeSelect']>

type TreeSelectFormItemRenderProps = ProFieldFCRenderProps & {
  options: NonNullable<TreeSelectProps['treeData']>
  loading: boolean
}

const TreeSelectInputIdBridge = defineComponent({
  name: 'TreeSelectInputIdBridge',
  props: ['id'],
  setup(props, { slots }) {
    const rootRef = ref<HTMLElement>()
    const sync = () => {
      if (props.id === undefined || props.id === null)
        return
      nextTick(() => {
        rootRef.value
          ?.querySelector<HTMLInputElement>('input.ant-select-input')
          ?.setAttribute('id', String(props.id))
      })
    }

    onMounted(sync)
    onUpdated(sync)

    return () => <span ref={rootRef}>{slots.default?.()}</span>
  },
})

export interface FieldTreeSelectEditProps {
  text: string
  mode: 'edit'
  formItemRender?: (
    text: string,
    props: TreeSelectFormItemRenderProps,
    dom: VNodeChild,
  ) => VNodeChild
  label?: VNodeChild
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  fieldProps: TreeSelectFieldProps
  open: boolean
  setOpen: (updater: boolean | ((prev: boolean) => boolean)) => void
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
  treeSelectOnChange: TreeSelectProps['onChange']
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
}: FieldTreeSelectEditProps, ref?: Ref<TreeSelectInstance | null>) {
  let dom: VNodeChild = (
    <Spin spinning={loading}>
      <TreeSelect
        ref={ref}
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

  if (fieldProps?.id !== undefined) {
    dom = (
      <TreeSelectInputIdBridge id={fieldProps.id}>
      {dom}
      </TreeSelectInputIdBridge>
    )
  }

  if (formItemRender) {
    dom = formItemRender(
      text,
      { mode, ...fieldProps, options, loading } as TreeSelectFormItemRenderProps,
      dom,
    ) ?? null
  }

  return dom
}

export default FieldTreeSelectEdit
