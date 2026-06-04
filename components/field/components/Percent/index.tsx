import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { PercentPropInt } from './types'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldPercentEdit from './FieldPercentEdit'
import FieldPercentRead from './FieldPercentRead'
import { toNumber } from './util'

export type { PercentPropInt }

export default defineComponent({
  name: 'FieldPercent',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
    prefix: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    suffix: { type: null as unknown as PropType<VNodeChild>, default: '%' },
    precision: { type: Number, default: undefined },
    showColor: { type: Boolean, default: false },
    showSymbol: { type: [Boolean, Function] as PropType<boolean | ((value: any) => boolean)>, default: undefined },
  },
  setup(props) {
    const realValue = computed(() => {
      const text = props.text
      if (typeof text === 'string' && text.includes('%')) {
        return toNumber(text.replace('%', ''))
      }
      return toNumber(text)
    })

    const showSymbol = computed(() => {
      if (typeof props.showSymbol === 'function') {
        return props.showSymbol(props.text)
      }
      return props.showSymbol
    })

    const placeholderValue = computed(() => props.placeholder || '请输入')

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldPercentRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            prefix={props.prefix}
            suffix={props.suffix}
            precision={props.precision}
            showColor={props.showColor}
            realValue={realValue.value}
            showSymbol={showSymbol.value}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldPercentEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
            prefix={props.prefix}
            placeholderValue={placeholderValue.value}
          />
        )
      }

      return null
    }
  },
})
