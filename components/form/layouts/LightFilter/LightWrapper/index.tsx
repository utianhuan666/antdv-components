import type { TooltipPlacement } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { LightFilterFooterRender } from '../../../typing'
import { clsx } from '@v-c/util'
import { computed, defineComponent, ref, watch } from 'vue'
import { useProPrefixCls } from '../../../../provider/useProPrefixCls'
import { dateArrayFormatter, FieldLabel, FilterDropdown, getLightFilterRangeDisplayFormat } from '../../../../utils'
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

export const LightWrapper = defineComponent<LightWrapperProps>({
  name: 'LightWrapper',
  inheritAttrs: false,
  props: ['label', 'disabled', 'placeholder', 'size', 'value', 'onChange', 'onBlur', 'style', 'className', 'children', 'valuePropName', 'customLightMode', 'light', 'labelFormatter', 'variant', 'otherFieldProps', 'valueType', 'allowClear', 'footerRender', 'placement'],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-field-light-wrapper')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const open = ref(false)
    const valuePropName = computed(() => props.valuePropName || 'value')
    const labelValue = computed(() => props[valuePropName.value])
    const tempValue = ref(labelValue.value)

    watch([labelValue, open], ([value, isOpen]) => {
      if (!isOpen)
        tempValue.value = value
    })

    const emitChange = (...args: any[]) => {
      props.otherFieldProps?.onChange?.(...args)
      props.onChange?.(...args)
    }

    const labelValueText = computed(() => {
      const value = labelValue.value
      if (!value)
        return value
      const lowerValueType = props.valueType?.toLowerCase?.()
      if (lowerValueType?.endsWith('range') && lowerValueType !== 'digitrange' && !props.labelFormatter)
        return dateArrayFormatter(value, getLightFilterRangeDisplayFormat(props.valueType))
      if (Array.isArray(value)) {
        return value.map((item) => {
          if (typeof item === 'object' && item?.label && item?.value)
            return item.label
          return item
        })
      }
      return value
    })

    return () => {
      const child = flattenChildren(slots.default?.() || props.children)[0]
      const childProps = getVNodeProps(child)
      return wrapSSR(
        <FilterDropdown
          disabled={props.disabled}
          open={open.value}
          onOpenChange={(nextOpen: boolean) => {
            open.value = nextOpen
          }}
          placement={props.placement}
          label={(
            <FieldLabel
              ellipsis
              size={props.size}
              onClear={() => {
                emitChange(undefined)
                tempValue.value = null
              }}
              variant={props.variant}
              style={props.style}
              className={clsx(`${prefixCls.value}-collapse-label`, props.className)}
              label={props.label}
              placeholder={props.placeholder}
              value={labelValueText.value}
              disabled={props.disabled}
              formatter={props.labelFormatter}
              allowClear={props.allowClear}
            />
          )}
          footer={{
            onClear: () => {
              tempValue.value = null
            },
            onConfirm: () => {
              emitChange(tempValue.value)
              open.value = false
            },
          }}
          footerRender={props.footerRender}
        >
          <div class={clsx(`${prefixCls.value}-container`, hashId, props.className)} style={props.style}>
            {cloneElement(child, {
              ...attrs,
              ...childProps,
              [valuePropName.value]: tempValue.value,
              onChange: (event: any) => {
                tempValue.value = event?.target ? event.target.value : event
                childProps.onChange?.(event)
              },
              variant: 'borderless',
              fieldProps: {
                ...childProps.fieldProps,
                variant: 'borderless',
                onChange: (...args: any[]) => {
                  const event = args[0] as any
                  tempValue.value = event?.target ? event.target.value : event
                  childProps.fieldProps?.onChange?.(...args)
                },
              },
            })}
          </div>
        </FilterDropdown>,
      )
    }
  },
})

export default LightWrapper
