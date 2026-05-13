import type { PropType, VNodeChild } from 'vue'
import { CloseCircleFilled, DownOutlined } from '@antdv-next/icons'
import { defineComponent } from 'vue'

export type FieldLabelVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

/**
 * 对标 React `src/utils/components/FieldLabel/index.tsx`：
 * 在 LightFilter / Light 模式字段中作为弹层触发器，展示 label + 当前值，
 * 支持 clear、变体（variant）、自定义 downIcon。
 */
const FieldLabel = defineComponent({
  name: 'ProFieldLabel',
  props: {
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    value: { type: null as unknown as PropType<any>, default: undefined },
    placeholder: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    size: { type: String, default: 'middle' },
    variant: { type: String as PropType<FieldLabelVariant>, default: 'outlined' },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    ellipsis: { type: Boolean, default: false },
    downIcon: { type: [Boolean, Object] as PropType<VNodeChild | false>, default: undefined },
    formatter: { type: Function as PropType<(value: any) => VNodeChild>, default: undefined },
    onClear: { type: Function as PropType<() => void>, default: undefined },
    onLabelClick: { type: Function as PropType<() => void>, default: undefined },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
  },
  emits: ['clear'],
  setup(props, { emit }) {
    function isValueEmpty(value: any) {
      if (value === undefined || value === null || value === '')
        return true
      if (Array.isArray(value) && value.length === 0)
        return true
      return false
    }

    function formatValue(value: any): VNodeChild {
      if (props.formatter)
        return props.formatter(value)
      if (Array.isArray(value)) {
        return value
          .map((item) => {
            if (item && typeof item === 'object' && 'label' in item)
              return (item as any).label
            return String(item)
          })
          .join(',')
      }
      if (value && typeof value === 'object' && 'label' in value)
        return (value as any).label
      return value as VNodeChild
    }

    return () => {
      const hasValue = !isValueEmpty(props.value)
      const downIconNode = props.downIcon === false
        ? null
        : (props.downIcon as VNodeChild) ?? <DownOutlined class="ant-pro-core-field-label-arrow" />

      const clearable = props.allowClear && hasValue && !props.disabled

      return (
        <span
          class={[
            'ant-pro-core-field-label',
            `ant-pro-core-field-label-${props.size}`,
            `ant-pro-core-field-label-${props.variant}`,
            hasValue ? 'ant-pro-core-field-label-active' : '',
            props.disabled ? 'ant-pro-core-field-label-disabled' : '',
          ].filter(Boolean).join(' ')}
          style={props.style}
          onClick={() => {
            if (!props.disabled)
              props.onLabelClick?.()
          }}
        >
          {props.label !== undefined
            ? (
                <span class="ant-pro-core-field-label-text">
                  {props.label}
                  {hasValue ? ': ' : ''}
                </span>
              )
            : null}
          {hasValue
            ? <span class="ant-pro-core-field-label-value">{formatValue(props.value)}</span>
            : <span class="ant-pro-core-field-label-placeholder">{props.placeholder ?? props.label}</span>}
          {clearable
            ? (
                <CloseCircleFilled
                  class="ant-pro-core-field-label-clear"
                  onClick={(event: MouseEvent) => {
                    event.stopPropagation()
                    props.onClear?.()
                    emit('clear')
                  }}
                />
              )
            : downIconNode}
        </span>
      )
    }
  },
})

export default FieldLabel
