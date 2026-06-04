import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { toNumber } from '../Percent/util'
import FieldProgressEdit from './FieldProgressEdit'
import FieldProgressRead from './FieldProgressRead'
import { getProgressStatus } from './utils'

export { getProgressStatus }

export default defineComponent({
  name: 'FieldProgress',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: 0 },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
  },
  setup(props) {
    const realValue = computed(() => {
      if (typeof props.text === 'string' && props.text.includes('%'))
        return toNumber(props.text.replace('%', ''))

      return toNumber(props.text)
    })
    const placeholderValue = computed(() => props.placeholder || '请输入')

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldProgressRead
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            realValue={realValue.value}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldProgressEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
            placeholderValue={placeholderValue.value}
          />
        )
      }

      return null
    }
  },
})
