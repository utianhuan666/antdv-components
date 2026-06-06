import type { SizeType, TooltipPlacement } from 'antdv-next'
import type { CSSProperties, VNode, VNodeChild } from 'vue'
import type { FieldLabelVariant } from './FieldLabel'
import type { FooterRender } from './FilterDropdown'
import { cloneVNode, defineComponent, isVNode, ref, watch } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import FieldLabel from './FieldLabel'
import FilterDropdown from './FilterDropdown'

type FieldPropsRecord = Record<string, unknown> & {
  onChange?: (...args: unknown[]) => void
}

export interface LightWrapperProps {
  label?: VNodeChild
  value?: unknown
  valuePropName?: string
  disabled?: boolean
  placeholder?: VNodeChild
  size?: SizeType
  variant?: FieldLabelVariant
  allowClear?: boolean
  valueType?: string
  placement?: TooltipPlacement
  footerRender?: FooterRender
  labelFormatter?: (value: unknown) => VNodeChild
  onChange?: (value?: unknown) => void
  style?: CSSProperties
}

const lightWrapperPropNames = [
  'label',
  'value',
  'valuePropName',
  'disabled',
  'placeholder',
  'size',
  'variant',
  'allowClear',
  'valueType',
  'placement',
  'footerRender',
  'labelFormatter',
  'onChange',
  'style',
] as const

function resolveBoolean(value: unknown, fallback = false) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

function readEventValue(input: unknown) {
  const target = input && typeof input === 'object' && 'target' in input
    ? (input as { target?: { value?: unknown, checked?: unknown } }).target
    : undefined
  return target ? (target.value ?? target.checked) : input
}

/**
 * 对标 React `src/form/layouts/LightFilter/LightWrapper/index.tsx`：
 *
 * 在 light 模式下：
 * 1. 外层渲染 FilterDropdown，其 label 槽位为 FieldLabel（展示真实 value 与 label）。
 * 2. 内部 ProField 渲染在 Popover 内，使用临时 `tempValue` 缓存。
 * 3. 用户编辑 -> 写入 tempValue；点击「确认」-> 把 tempValue 交给外层 onChange（即 Form.Item.value）。
 * 4. 关闭 popover 时同步外部最新值，避免临时态污染主表单。
 */
const LightWrapper = defineComponent({
  name: 'ProLightWrapper',
  inheritAttrs: false,
  props: [...lightWrapperPropNames],
  emits: ['change'],
  setup(rawProps, { attrs, slots, emit }) {
    const props = rawProps as Readonly<LightWrapperProps>
    const prefixCls = useProPrefixCls('pro-form')
    const tempValue = ref<unknown>(props.value)
    const open = ref<boolean>(false)

    // Popover 关闭时同步外部最新值，避免临时态污染主表单。
    watch(
      () => props.value,
      (next) => {
        if (!open.value)
          tempValue.value = next
      },
    )

    function commitChange(value: unknown) {
      const onChange = props.onChange ?? attrs.onChange
      if (typeof onChange === 'function')
        onChange(value)
      else if (Array.isArray(onChange))
        onChange.forEach(fn => typeof fn === 'function' && fn(value))
      emit('change', value)
    }

    function handleClear() {
      tempValue.value = undefined
      commitChange(undefined)
    }

    function handleConfirm() {
      commitChange(tempValue.value)
      open.value = false
    }

    function handleOpenChange(next: boolean) {
      // 打开时从外部刷新一次临时值（保证 confirm 后再打开能看到最新值）
      if (next)
        tempValue.value = props.value
      open.value = next
    }

    /** 把 popover 内部子节点的 value/onChange 改写到内部 tempValue 上，并强制 borderless 变体。 */
    function cloneInnerChild(child: VNode): VNode {
      const childProps = (child.props || {}) as Record<string, unknown>
      const childFieldProps = (childProps.fieldProps || {}) as FieldPropsRecord
      const innerFieldProps = {
        ...childFieldProps,
        variant: 'borderless' as const,
      }
      return cloneVNode(child, {
        ...childProps,
        [props.valuePropName ?? 'value']: tempValue.value,
        value: tempValue.value,
        fieldProps: {
          ...innerFieldProps,
          [props.valuePropName ?? 'value']: tempValue.value,
          'onChange': (...args: unknown[]) => {
            tempValue.value = readEventValue(args[0])
            childFieldProps.onChange?.(...args)
          },
          'onUpdate:value': (value: unknown) => {
            tempValue.value = value
            ;(childFieldProps['onUpdate:value'] as ((value: unknown) => void) | undefined)?.(value)
          },
        },
        variant: 'borderless',
      })
    }

    return () => {
      const rawChildren = slots.default?.() || []
      const validChildren = rawChildren.filter(node => isVNode(node))

      const labelNode = (
        <FieldLabel
          label={props.label}
          size={props.size}
          variant={props.variant}
          value={props.value}
          placeholder={props.placeholder}
          disabled={resolveBoolean(props.disabled)}
          allowClear={resolveBoolean(props.allowClear, true)}
          formatter={props.labelFormatter}
          style={props.style}
          onClear={handleClear}
        />
      )

      return (
        <FilterDropdown
          open={open.value}
          placement={props.placement ?? 'bottomLeft'}
          disabled={resolveBoolean(props.disabled)}
          label={labelNode}
          footerRender={props.footerRender}
          footer={{ onConfirm: handleConfirm, onClear: handleClear }}
          onUpdate:open={handleOpenChange}
        >
          <div class={`${prefixCls.value}-light-wrapper-content`}>
            {validChildren.map(node => (isVNode(node) ? cloneInnerChild(node as VNode) : node))}
          </div>
        </FilterDropdown>
      )
    }
  },
})

export default LightWrapper
export { LightWrapper }
