import type { SizeType } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import { CloseCircleFilled, DownOutlined } from '@antdv-next/icons'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

export type FieldLabelVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type FieldLabelValue = VNodeChild | { label?: VNodeChild }

export interface FieldLabelProps {
  label?: VNodeChild
  value?: FieldLabelValue | FieldLabelValue[]
  placeholder?: VNodeChild
  size?: SizeType
  variant?: FieldLabelVariant
  disabled?: boolean
  allowClear?: boolean
  ellipsis?: boolean
  downIcon?: VNodeChild | false
  formatter?: (value: FieldLabelProps['value']) => VNodeChild
  onClear?: () => void
  onLabelClick?: () => void
  style?: CSSProperties
}

const fieldLabelPropNames = [
  'label',
  'value',
  'placeholder',
  'size',
  'variant',
  'disabled',
  'allowClear',
  'ellipsis',
  'downIcon',
  'formatter',
  'onClear',
  'onLabelClick',
  'style',
] as const

function resolveBoolean(value: unknown, fallback = false) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

/**
 * 对标 React `src/utils/components/FieldLabel/index.tsx`：
 * 在 LightFilter / Light 模式字段中作为弹层触发器，展示 label + 当前值，
 * 支持 clear、变体（variant）、自定义 downIcon。
 */
const FieldLabel = defineComponent({
  name: 'ProFieldLabel',
  props: [...fieldLabelPropNames],
  emits: ['clear'],
  setup(rawProps, { emit }) {
    const props = rawProps as Readonly<FieldLabelProps>
    const prefixCls = useProPrefixCls('pro-core-field-label')
    function isValueEmpty(value: FieldLabelProps['value']) {
      if (value === undefined || value === null || value === '')
        return true
      if (Array.isArray(value) && value.length === 0)
        return true
      return false
    }

    function formatValue(value: FieldLabelProps['value']): VNodeChild {
      if (props.formatter)
        return props.formatter(value)
      if (Array.isArray(value)) {
        return value
          .map((item) => {
            if (item && typeof item === 'object' && 'label' in item)
              return (item as { label?: VNodeChild }).label
            return String(item)
          })
          .join(',')
      }
      if (value && typeof value === 'object' && 'label' in value)
        return (value as { label?: VNodeChild }).label
      return value as VNodeChild
    }

    return () => {
      const hasValue = !isValueEmpty(props.value)
      const downIconNode = props.downIcon === false
        ? null
        : (props.downIcon as VNodeChild) ?? <DownOutlined class={`${prefixCls.value}-arrow`} />

      const disabled = resolveBoolean(props.disabled)
      const clearable = resolveBoolean(props.allowClear, true) && hasValue && !disabled
      const formattedValue = hasValue ? formatValue(props.value) : undefined
      const formattedTitle = typeof formattedValue === 'string' || typeof formattedValue === 'number'
        ? String(formattedValue)
        : undefined

      return (
        <span
          class={[
            prefixCls.value,
            `${prefixCls.value}-${props.size ?? 'middle'}`,
            `${prefixCls.value}-${props.variant ?? 'outlined'}`,
            hasValue ? `${prefixCls.value}-active` : '',
            disabled ? `${prefixCls.value}-disabled` : '',
          ].filter(Boolean).join(' ')}
          style={props.style}
          onClick={() => {
            if (!disabled)
              props.onLabelClick?.()
          }}
        >
          {props.label !== undefined
            ? (
                <span class={`${prefixCls.value}-text`}>
                  {props.label}
                  {hasValue ? ': ' : ''}
                </span>
              )
            : null}
          {hasValue
            ? <span class={`${prefixCls.value}-value`} title={formattedTitle}>{formattedValue}</span>
            : <span class={`${prefixCls.value}-placeholder`}>{props.placeholder ?? props.label}</span>}
          {clearable
            ? (
                <CloseCircleFilled
                  class={`${prefixCls.value}-clear ${prefixCls.value}-close`}
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
