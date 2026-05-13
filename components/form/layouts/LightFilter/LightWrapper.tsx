import type { PropType, VNode, VNodeChild } from 'vue'
import type { FieldLabelVariant } from './FieldLabel'
import type { FooterRender } from './FilterDropdown'
import { cloneVNode, defineComponent, isVNode, ref, watch } from 'vue'
import FieldLabel from './FieldLabel'
import FilterDropdown from './FilterDropdown'

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
  props: {
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    value: { type: null as unknown as PropType<any>, default: undefined },
    valuePropName: { type: String, default: 'value' },
    disabled: { type: Boolean, default: false },
    placeholder: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    size: { type: String as PropType<'small' | 'middle' | 'large'>, default: 'middle' },
    variant: { type: String as PropType<FieldLabelVariant>, default: 'outlined' },
    allowClear: { type: Boolean, default: true },
    valueType: { type: String, default: undefined },
    placement: { type: String as PropType<any>, default: 'bottomLeft' },
    footerRender: { type: [Function, Boolean] as PropType<FooterRender>, default: undefined },
    labelFormatter: { type: Function as PropType<(value: any) => VNodeChild>, default: undefined },
    onChange: { type: Function as PropType<(value?: any) => void>, default: undefined },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
  },
  emits: ['change'],
  setup(props, { slots, emit }) {
    const tempValue = ref<any>(props.value)
    const open = ref<boolean>(false)

    // Popover 关闭时同步外部最新值，避免临时态污染主表单。
    watch(
      () => props.value,
      (next) => {
        if (!open.value)
          tempValue.value = next
      },
    )

    function commitChange(value: any) {
      props.onChange?.(value)
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
      const childProps = (child.props || {}) as Record<string, any>
      const innerFieldProps = {
        ...(childProps.fieldProps || {}),
        variant: 'borderless' as const,
      }
      return cloneVNode(child, {
        ...childProps,
        [props.valuePropName]: tempValue.value,
        value: tempValue.value,
        fieldProps: {
          ...innerFieldProps,
          [props.valuePropName]: tempValue.value,
          onChange: (...args: any[]) => {
            const next = args[0]?.target
              ? (args[0].target.value ?? args[0].target.checked)
              : args[0]
            tempValue.value = next
          },
        },
        variant: 'borderless',
      } as Record<string, any>)
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
          disabled={props.disabled}
          allowClear={props.allowClear}
          formatter={props.labelFormatter}
          style={props.style}
          onClear={handleClear}
        />
      )

      return (
        <FilterDropdown
          open={open.value}
          placement={props.placement}
          disabled={props.disabled}
          label={labelNode}
          footerRender={props.footerRender}
          footer={{ onConfirm: handleConfirm, onClear: handleClear }}
          onUpdate:open={handleOpenChange}
        >
          <div class="ant-pro-form-light-wrapper-content">
            {validChildren.map(node => (isVNode(node) ? cloneInnerChild(node as VNode) : node))}
          </div>
        </FilterDropdown>
      )
    }
  },
})

export default LightWrapper
export { LightWrapper }
