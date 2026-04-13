import type { PropType } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { Select, Spin } from 'antdv-next'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'FieldSelectEdit',
  props: {
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    loading: { type: Boolean, default: false },
    options: { type: Array as PropType<any[]>, default: () => [] },
    fetchData: { type: Function as PropType<(keyWord?: string) => void>, default: undefined },
    resetData: { type: Function as PropType<() => void>, default: undefined },
    text: { type: [String, Number, Array] as PropType<string | number | (string | number)[]>, default: '' },
  },
  setup(props) {
    const keyWordsRef = ref('')

    return () => {
      const { fieldProps } = props

      const dom = (
        <Select
          allowClear
          loading={props.loading}
          notFoundContent={props.loading ? <Spin size="small" /> : fieldProps?.notFoundContent}
          placeholder="请选择"
          showSearch
          optionFilterProp="label"
          filterOption={
            fieldProps?.filterOption === false
              ? false
              : (inputValue: string, option: any) => {
                  if (!inputValue)
                    return true
                  const label = option?.label ?? option?.data_title ?? ''
                  return label.toString().toLowerCase().includes(inputValue.toLowerCase())
                }
          }
          onSearch={(value: string) => {
            keyWordsRef.value = value
            props.fetchData?.(value)
          }}
          onClear={() => {
            keyWordsRef.value = ''
            props.fetchData?.(undefined)
          }}
          style={{ minWidth: 100, ...fieldProps?.style }}
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
