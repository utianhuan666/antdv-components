import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { FieldDigitProps } from './types'
import { computed, defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldDigitEdit from './FieldDigitEdit'
import FieldDigitRead from './FieldDigitRead'

export type { FieldDigitProps }

export default defineComponent({
  name: 'FieldDigit',
  props: {
    text: { type: [Number, String] as PropType<number | string>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    placeholder: { type: String, default: undefined },
  },
  setup(props) {
    const placeholderValue = computed(() => props.placeholder || '请输入')

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldDigitRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldDigitEdit
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
