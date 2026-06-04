import type { PropType, Ref } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { LoadingOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Cascader } from 'antdv-next'
import { defineComponent } from 'vue'
import FieldLabel from '../../../form/layouts/LightFilter/FieldLabel'

export default defineComponent({
  name: 'FieldCascaderLightEdit',
  props: {
    text: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'edit' },
    placeholder: { type: String, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    label: { type: null as unknown as PropType<any>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    options: { type: Array as PropType<any[]>, default: () => [] },
    loading: { type: Boolean, default: false },
    layoutClassName: { type: String, default: '' },
    open: { type: Object as PropType<Ref<boolean>>, required: true },
    cascaderRef: { type: Object as PropType<Ref<any>>, default: undefined },
  },
  setup(props) {
    return () => {
      const notEmpty = !!props.fieldProps?.value && props.fieldProps.value?.length !== 0
      const dom = (
        <Cascader
          ref={props.cascaderRef}
          open={props.open.value}
          suffixIcon={props.loading ? <LoadingOutlined /> : undefined}
          placeholder={props.placeholder || '请选择'}
          allowClear={props.fieldProps?.allowClear !== false}
          {...props.fieldProps}
          onOpenChange={(isOpen: boolean) => {
            props.fieldProps?.onOpenChange?.(isOpen)
            props.open.value = isOpen
          }}
          class={clsx(props.fieldProps?.className, props.layoutClassName)}
          options={props.options}
        />
      )

      const renderedDom = props.formItemRender
        ? props.formItemRender(
            props.text,
            { mode: props.mode, ...props.fieldProps, options: props.options, loading: props.loading },
            dom,
          ) ?? null
        : dom

      return (
        <FieldLabel
          label={props.label}
          disabled={props.fieldProps?.disabled}
          variant={props.variant}
          value={notEmpty || props.open.value ? renderedDom : null}
          style={notEmpty ? { paddingInlineEnd: 0 } : undefined}
          allowClear={false}
          downIcon={notEmpty || props.open.value ? false : undefined}
          onLabelClick={() => {
            if (props.fieldProps?.disabled)
              return
            props.open.value = true
            props.fieldProps?.onOpenChange?.(true)
          }}
        />
      )
    }
  },
})
