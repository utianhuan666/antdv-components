import type { SizeType } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import { CloseCircleFilled, DownOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'

export interface FieldLabelProps {
  label?: VNodeChild
  value?: any
  disabled?: boolean
  onClear?: () => void
  size?: SizeType
  ellipsis?: boolean
  placeholder?: VNodeChild
  className?: string
  formatter?: (value: any) => VNodeChild
  style?: CSSProperties
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  allowClear?: boolean
  downIcon?: VNodeChild | false
  onClick?: () => void
  valueMaxLength?: number
  onLabelClick?: () => void
}

function resolveBoolean(value: unknown, fallback = false) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

export const FieldLabel = defineComponent({
  name: 'ProFieldLabel',
  props: [
    'label',
    'value',
    'disabled',
    'onClear',
    'size',
    'ellipsis',
    'placeholder',
    'className',
    'formatter',
    'style',
    'variant',
    'allowClear',
    'downIcon',
    'onClick',
    'valueMaxLength',
    'onLabelClick',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps as FieldLabelProps
    const intl = useIntl()
    const clearRef = ref<HTMLElement | null>(null)
    const labelRef = ref<HTMLElement | null>(null)
    expose({ clearRef, labelRef })

    const wrapElements = (array: (string | VNodeChild)[]): VNodeChild => {
      if (array.every(item => typeof item === 'string'))
        return (array as string[]).join(',')
      return array.map((item, index) => {
        const comma = index === array.length - 1 ? '' : ','
        return (
          <span key={index} style={typeof item === 'string' ? undefined : { display: 'flex' }}>
            {item}
            {comma}
          </span>
        )
      })
    }

    const formatterText = (value: any) => {
      if (props.formatter)
        return props.formatter(value)
      return Array.isArray(value) ? wrapElements(value) : value
    }

    const hasValue = (value: any) =>
      value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)

    const getTextByValue = (label?: VNodeChild, value?: any): VNodeChild => {
      if (hasValue(value)) {
        const prefix = label
          ? (
              <span onClick={() => props.onLabelClick?.()} class="ant-pro-core-field-label-text">
                {label}
                {': '}
              </span>
            )
          : ''
        const str = formatterText(value)
        if (!props.ellipsis) {
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {prefix}
              {str}
            </span>
          )
        }

        const valueMaxLength = props.valueMaxLength ?? 41
        const isArrayValue = Array.isArray(value) && value.length > 1
        const unitText = intl.getMessage('form.lightFilter.itemUnit', '项')
        const tail = typeof str === 'string' && str.length > valueMaxLength && isArrayValue ? `...${value.length}${unitText}` : ''
        return (
          <span title={typeof str === 'string' ? str : undefined} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {prefix}
            <span style={{ paddingInlineStart: 4, display: 'flex' }}>
              {typeof str === 'string' ? str.toString().slice(0, valueMaxLength) : str}
            </span>
            {tail}
          </span>
        )
      }
      return label || props.placeholder
    }

    return () => {
      const active = (Array.isArray(props.value) ? props.value.length > 0 : Boolean(props.value)) || props.value === 0
      const disabled = resolveBoolean(props.disabled)
      const allowClear = resolveBoolean(props.allowClear, true)

      return (
        <span
          class={clsx(
            'ant-pro-core-field-label',
            `ant-pro-core-field-label-${props.size ?? 'middle'}`,
            {
              [`ant-pro-core-field-label-${props.variant || 'borderless'}-active`]: active,
              'ant-pro-core-field-label-active': active,
              'ant-pro-core-field-label-disabled': disabled,
              [`ant-pro-core-field-label-${props.variant}`]: props.variant,
              'ant-pro-core-field-label-allow-clear': allowClear,
            },
            props.className,
          )}
          style={props.style}
          ref={labelRef}
          onClick={() => props.onClick?.()}
        >
          {getTextByValue(props.label, props.value)}
          {active && allowClear
            ? (
                <span
                  role="button"
                  title={intl.getMessage('form.lightFilter.clear', '清除')}
                  class="ant-pro-core-field-label-icon ant-pro-core-field-label-close"
                  onClick={(event: MouseEvent) => {
                    if (!disabled)
                      props.onClear?.()
                    event.stopPropagation()
                  }}
                  ref={clearRef}
                >
                  <CloseCircleFilled />
                </span>
              )
            : null}
          {props.downIcon !== false
            ? (props.downIcon ?? <DownOutlined class="ant-pro-core-field-label-icon ant-pro-core-field-label-arrow" />)
            : null}
        </span>
      )
    }
  },
})

export default FieldLabel
