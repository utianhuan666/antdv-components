import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import type { ProFieldValueEnumType } from '../Select/types'
import type { FieldRadioProps } from './types'
import { RadioButton, RadioGroup } from 'antdv-next'
import { defineComponent } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { objectToMap, proFieldParsingText } from '../Select/utils'

export type { FieldRadioProps }

const FieldRadio = defineComponent({
  name: 'FieldRadio',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    valueEnum: { type: [Map, Object] as PropType<ProFieldValueEnumType>, default: undefined },
    options: { type: Array as PropType<Array<{ label: string, value: string | number, disabled?: boolean }>>, default: undefined },
    radioType: { type: String as PropType<'default' | 'button'>, default: undefined },
    layout: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  setup(props) {
    return () => {
      // Build optionsValueEnum from options if provided
      const optionsValueEnum = props.options?.length
        ? props.options.reduce<Record<string, any>>((pre, cur) => {
            pre[cur.value ?? ''] = cur.label
            return pre
          }, {})
        : undefined

      if (isProFieldReadMode(props.mode)) {
        const dom = (
          <>
            {proFieldParsingText(
              props.text,
              objectToMap(props.valueEnum || optionsValueEnum),
            )}
          </>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const dom = (
          <RadioGroup
            optionType={props.radioType}
            options={props.options}
            {...props.fieldProps}
          >
            {props.radioType === 'button' && props.options
              ? props.options.map(opt => (
                  <RadioButton key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </RadioButton>
                ))
              : undefined}
          </RadioGroup>
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps, options: props.options }, dom)
        }
        return dom
      }

      return null
    }
  },
})

export default FieldRadio
