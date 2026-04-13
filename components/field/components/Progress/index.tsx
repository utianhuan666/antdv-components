import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { InputNumber, Progress } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { getProgressStatus, toNumber } from './utils'

export { getProgressStatus }

export default defineComponent({
  name: 'FieldProgress',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: 0 },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
  },
  setup(props) {
    const realValue = computed(() => toNumber(props.text))

    return () => {
      if (isProFieldReadMode(props.mode)) {
        const dom = (
          <Progress
            size="small"
            style={{ minWidth: 100, maxWidth: 320 }}
            percent={realValue.value as number}
            steps={props.fieldProps?.steps}
            status={getProgressStatus(realValue.value as number)}
            {...props.fieldProps}
          />
        )
        if (props.render) {
          return props.render(realValue.value, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const placeholderValue = props.placeholder || '???'
        const dom = (
          <InputNumber
            {...({
              placeholder: placeholderValue,
              ...props.fieldProps,
            } as any)}
          />
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      return null
    }
  },
})
