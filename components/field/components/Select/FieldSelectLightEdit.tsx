import type { PropType, Ref } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { RequestOptionsType } from './types'
import { defineComponent } from 'vue'
import LightSelect from './LightSelect'

export default defineComponent({
  name: 'FieldSelectLightEdit',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    id: { type: String, default: undefined },
    label: { type: null as unknown as PropType<any>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    loading: { type: Boolean, default: false },
    options: { type: Array as PropType<RequestOptionsType[]>, default: () => [] },
    fetchData: { type: Function as PropType<(keyWord?: string) => void>, default: undefined },
    resetData: { type: Function as PropType<() => void>, default: undefined },
    selectRef: { type: Object as PropType<Ref<any>>, default: undefined },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
    className: { type: String, default: undefined },
    lightLabel: { type: Object as PropType<any>, default: undefined },
    labelTrigger: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const dom = (
        <LightSelect
          id={props.id}
          ref={props.selectRef}
          loading={props.loading}
          allowClear
          options={props.options}
          label={props.label}
          labelVariant={props.variant}
          placeholder="请选择"
          lightLabel={props.lightLabel}
          labelTrigger={props.labelTrigger}
          fetchData={props.fetchData}
          className={props.className}
          style={props.style}
          {...props.fieldProps}
        />
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
