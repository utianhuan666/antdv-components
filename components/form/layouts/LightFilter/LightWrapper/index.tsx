import type { TooltipPlacement } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { LightFilterFooterRender } from '../../../typing'
import { clsx } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, ref, watch } from 'vue'
import {
  dateArrayFormatter,
  FieldLabel,
  FilterDropdown,
  getLightFilterRangeDisplayFormat,
} from '../../../../utils'
import { cloneElement, flattenChildren, getVNodeProps } from '../../_shared/vueHelpers'
import { useStyle } from './style'

export type SizeType = 'small' | 'middle' | 'large'

export interface LightWrapperProps {
  label?: VNodeChild
  disabled?: boolean
  placeholder?: VNodeChild
  size?: SizeType
  value?: any
  onChange?: (value?: any) => void
  onBlur?: (value?: any) => void
  style?: CSSProperties
  className?: string
  children?: VNodeChild
  valuePropName?: string
  customLightMode?: boolean
  light?: boolean
  labelFormatter?: (value: any) => VNodeChild
  variant?: 'outlined' | 'filled' | 'borderless'
  otherFieldProps?: any
  valueType?: string
  allowClear?: boolean
  footerRender?: LightFilterFooterRender
  placement?: TooltipPlacement
}

const LightWrapper = defineComponent<LightWrapperProps>({
  name: 'LightWrapper',
  inheritAttrs: false,
  props: [
    'label',
    'disabled',
    'placeholder',
    'size',
    'value',
    'onChange',
    'onBlur',
    'style',
    'className',
    'children',
    'valuePropName',
    'customLightMode',
    'light',
    'labelFormatter',
    'variant',
    'otherFieldProps',
    'valueType',
    'allowClear',
    'footerRender',
    'placement',
  ],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps
    const {
      label,
      size,
      disabled,
      onChange: propsOnChange,
      className,
      style,
      children,
      valuePropName,
      placeholder,
      labelFormatter,
      variant,
      footerRender,
      allowClear,
      otherFieldProps,
      valueType,
      placement,
      ...rest
    } = props

    const config = useConfig()
    const prefixCls = computed(() => config.value.getPrefixCls('pro-field-light-wrapper'))
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const labelValue = computed(() => {
      const currentValuePropName = valuePropName || 'value'
      return (props as Record<string, unknown>)[currentValuePropName]
    })
    const tempValue = ref<unknown>(labelValue.value)
    const open = ref(false)

    watch([labelValue, open], ([value, currentOpen]) => {
      if (!currentOpen)
        tempValue.value = value
    })

    const onChange = (...restParams: any[]) => {
      otherFieldProps?.onChange?.(...restParams)
      propsOnChange?.(...restParams)
    }

    const labelValueText = computed(() => {
      if (!labelValue.value)
        return labelValue.value
      const lowerValueType = valueType?.toLowerCase?.()
      if (
        lowerValueType?.endsWith('range')
        && lowerValueType !== 'digitrange'
        && !labelFormatter
      ) {
        if (!Array.isArray(labelValue.value))
          return labelValue.value
        return dateArrayFormatter(
          labelValue.value,
          getLightFilterRangeDisplayFormat(valueType),
        )
      }
      if (Array.isArray(labelValue.value)) {
        return labelValue.value.map((item) => {
          if (typeof item === 'object' && item.label && item.value)
            return item.label
          return item
        })
      }

      return labelValue.value
    })

    return () => {
      const childElement = flattenChildren(slots.default?.() || children)[0]
      const childProps = getVNodeProps<Record<string, any>>(childElement)
      const mergedFieldProps = {
        ...childProps?.fieldProps,
        variant: 'borderless' as const,
        onChange: (...args: any[]) => {
          const e = args[0]
          tempValue.value = e?.target ? e.target.value : e
          childProps?.fieldProps?.onChange?.(...args)
        },
      }

      return wrapSSR(
        <FilterDropdown
          disabled={disabled}
          open={open.value}
          onOpenChange={(nextOpen: boolean) => {
            open.value = nextOpen
          }}
          placement={placement}
          label={(
            <FieldLabel
              ellipsis
              size={size}
              onClear={() => {
                onChange?.()
                tempValue.value = null
              }}
              variant={variant}
              style={style}
              className={className}
              label={label}
              placeholder={placeholder}
              value={labelValueText.value}
              disabled={disabled}
              formatter={labelFormatter}
              allowClear={allowClear}
            />
          )}
          footer={{
            onClear: () => {
              tempValue.value = null
            },
            onConfirm: () => {
              onChange?.(tempValue.value)
              open.value = false
            },
          }}
          footerRender={footerRender}
        >
          <div
            class={clsx(`${prefixCls.value}-container`, hashId, className)}
            style={style}
          >
            {cloneElement(childElement, {
              ...attrs,
              ...rest,
              ...childProps,
              [valuePropName!]: tempValue.value,
              onChange: (e: any) => {
                tempValue.value = e?.target ? e.target.value : e
                childProps?.onChange?.(e)
              },
              variant: 'borderless' as const,
              fieldProps: mergedFieldProps,
            })}
          </div>
        </FilterDropdown>,
      )
    }
  },
})

export { LightWrapper }
