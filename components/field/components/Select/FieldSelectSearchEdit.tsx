import type { PropType, Ref } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { RequestOptionsType } from './types'
import { Spin } from 'antdv-next'
import { defineComponent } from 'vue'
import SearchSelect from './SearchSelect'

const SearchSelectComponent = SearchSelect as any

export interface FieldSelectSearchEditProps {
  text: any
  mode?: ProFieldFCMode
  formItemRender?: (text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element
  fieldProps?: Record<string, any>
  id?: string
  label?: any
  loading?: boolean
  options?: RequestOptionsType[]
  fetchData?: (keyWord?: string) => void
  resetData?: () => void
  selectRef?: Ref<any>
  style?: Record<string, any>
  className?: string
  defaultKeyWords?: string
}

export default defineComponent({
  name: 'FieldSelectSearchEdit',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<FieldSelectSearchEditProps['formItemRender']>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    id: { type: String, default: undefined },
    label: { type: null as unknown as PropType<any>, default: undefined },
    loading: { type: Boolean, default: false },
    options: { type: Array as PropType<RequestOptionsType[]>, default: () => [] },
    fetchData: { type: Function as PropType<(keyWord?: string) => void>, default: undefined },
    resetData: { type: Function as PropType<() => void>, default: undefined },
    selectRef: { type: Object as PropType<Ref<any>>, default: undefined },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
    className: { type: String, default: undefined },
    defaultKeyWords: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const { fieldProps } = props
      const dom = (
        <SearchSelectComponent
          key="SearchSelect"
          ref={props.selectRef}
          id={props.id}
          className={props.className}
          style={{ minWidth: 100, ...props.style }}
          loading={props.loading}
          allowClear
          defaultSearchValue={props.defaultKeyWords ?? fieldProps?.defaultSearchValue}
          notFoundContent={props.loading ? <Spin size="small" /> : fieldProps?.notFoundContent}
          fetchData={props.fetchData}
          resetData={props.resetData}
          placeholder="请选择"
          label={props.label}
          {...fieldProps}
          options={props.options}
        />
      )

      if (props.formItemRender) {
        return props.formItemRender(
          props.text,
          { mode: props.mode, ...fieldProps, options: props.options, loading: props.loading },
          dom,
        )
      }
      return dom
    }
  },
})
