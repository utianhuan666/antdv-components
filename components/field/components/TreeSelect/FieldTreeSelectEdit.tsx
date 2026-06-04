import type { PropType, Ref } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { clsx } from '@v-c/util'
import { Spin, TreeSelect } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldTreeSelectEdit',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    open: { type: Object as PropType<Ref<boolean>>, required: true },
    treeSelectRef: { type: Object as PropType<Ref<any>>, default: undefined },
    loading: { type: Boolean, default: false },
    options: { type: Array as PropType<any[]>, default: () => [] },
    fetchData: { type: Function as PropType<(keyWord?: string) => void>, default: undefined },
    fetchDataOnSearch: { type: Boolean, default: undefined },
    hasRequest: { type: Boolean, default: false },
    showSearch: { type: [Boolean, Object] as PropType<boolean | Record<string, any>>, default: undefined },
    showSearchConfig: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    searchValue: { type: String, default: undefined },
    setSearchValue: { type: Function as PropType<(value?: string) => void>, default: undefined },
    autoClearSearchValue: { type: Boolean, default: undefined },
    onClear: { type: Function as PropType<() => void>, default: undefined },
    treeSelectOnChange: { type: Function as PropType<(value: any, optionList: any, extra: any) => void>, default: undefined },
    onBlur: { type: Function as PropType<(event: FocusEvent) => void>, default: undefined },
    layoutClassName: { type: String, default: '' },
  },
  setup(props) {
    return () => {
      const dom = (
        <Spin spinning={props.loading}>
          <TreeSelect
            ref={props.treeSelectRef}
            open={props.open.value}
            popupMatchSelectWidth
            placeholder="请选择"
            {...props.fieldProps}
            treeData={props.options}
            showSearch={props.showSearch
              ? {
                  ...props.showSearchConfig,
                  searchValue: props.searchValue,
                  autoClearSearchValue: props.autoClearSearchValue,
                  onSearch: (value: string) => {
                    if (props.fetchDataOnSearch && props.hasRequest)
                      props.fetchData?.(value)
                    props.setSearchValue?.(value)
                  },
                }
              : props.showSearch}
            style={{ minWidth: 60, ...props.fieldProps?.style }}
            allowClear={props.fieldProps?.allowClear !== false}
            onOpenChange={(isOpen: boolean) => {
              props.fieldProps?.onOpenChange?.(isOpen)
              props.open.value = isOpen
            }}
            onClear={() => {
              props.onClear?.()
              props.fetchData?.(undefined)
              if (props.showSearch)
                props.setSearchValue?.(undefined)
            }}
            onChange={props.treeSelectOnChange}
            onBlur={(event: FocusEvent) => {
              props.setSearchValue?.(undefined)
              props.fetchData?.(undefined)
              props.onBlur?.(event)
            }}
            class={clsx(props.fieldProps?.className, props.layoutClassName)}
          />
        </Spin>
      )

      if (props.formItemRender) {
        return props.formItemRender(
          props.text,
          { mode: props.mode, ...props.fieldProps, options: props.options, loading: props.loading },
          dom,
        )
      }

      return dom
    }
  },
})
