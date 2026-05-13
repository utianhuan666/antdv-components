import type { PropType, VNode, VNodeChild } from 'vue'
import type { CommonFormProps } from '../../typing'
import type { FieldLabelVariant } from './FieldLabel'
import type { FooterRender } from './FilterDropdown'
import { FilterOutlined } from '@antdv-next/icons'
import { cloneVNode, Comment, computed, defineComponent, Fragment, isVNode, ref, shallowRef, Text } from 'vue'
import { BaseForm } from '../../BaseForm'
import ProFormCascader from '../../components/Cascader'
import { ProFormCheckboxGroup } from '../../components/Checkbox'
import ProFormDatePicker, { ProFormDateTimePicker, ProFormTimePicker } from '../../components/DatePicker'
import ProFormDateRangePicker, { ProFormDateTimeRangePicker } from '../../components/DateRangePicker'
import ProFormDigit from '../../components/Digit'
import ProFormDigitRange from '../../components/Digit/DigitRange'
import ProFormFieldSet from '../../components/FieldSet'
import ProFormSelect from '../../components/Select'
import ProFormSlider from '../../components/Slider'
import ProFormSwitch from '../../components/Switch'
import ProFormText, { ProFormTextPassword } from '../../components/Text'
import ProFormTextArea from '../../components/TextArea'
import ProFormTreeSelect from '../../components/TreeSelect'
import FieldLabel from './FieldLabel'
import FilterDropdown from './FilterDropdown'

export interface LightFilterProps extends CommonFormProps {
  collapse?: boolean
  collapseLabel?: VNodeChild
  variant?: FieldLabelVariant
  size?: 'small' | 'middle' | 'large'
  ignoreRules?: boolean
  footerRender?: FooterRender
  placement?: any
  popoverProps?: Record<string, any>
}

function isVisibleVNode(node: VNodeChild): node is VNode {
  if (!isVNode(node))
    return false
  if (node.type === Comment)
    return false
  if (node.type === Text && typeof node.children === 'string' && !node.children.trim())
    return false
  return true
}

/**
 * 展开无 title 的 ProForm.Group，可选去除 rules，对标 React LightFilter 内部对 items 的扁平处理。
 */
function flattenLightFilterItems(items: VNodeChild): VNode[] {
  const result: VNode[] = []
  const list = Array.isArray(items) ? items : [items]
  for (const node of list) {
    if (!isVisibleVNode(node))
      continue
    if (node.type === Fragment) {
      result.push(...flattenLightFilterItems(node.children as VNodeChild))
      continue
    }
    const componentName = (node.type as any)?.name
    if (componentName === 'ProFormGroup' && !(node.props as any)?.title) {
      const groupChildren = (node.children as any)?.default?.() ?? node.children
      result.push(...flattenLightFilterItems(groupChildren as VNodeChild))
      continue
    }
    result.push(node)
  }
  return result
}

/**
 * LightFilter – 对标 React `src/form/layouts/LightFilter/index.tsx`：
 * 1. 主体走 BaseForm，子项默认以 popover 形式渲染（FilterDropdown）。
 * 2. `collapse=true` 时所有子项进入折叠区；否则按 `secondary` 划分外侧/折叠两组。
 * 3. 折叠区内部使用临时 `moreValues`，在底部 `确认` 后整体提交，`重置` 清空当前折叠字段。
 */
const LightFilter = defineComponent({
  name: 'LightFilter',
  inheritAttrs: false,
  props: {
    collapse: { type: Boolean, default: false },
    collapseLabel: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    variant: { type: String as PropType<FieldLabelVariant>, default: 'borderless' },
    size: { type: String as PropType<LightFilterProps['size']>, default: 'middle' },
    ignoreRules: { type: Boolean, default: undefined },
    footerRender: { type: [Function, Boolean] as PropType<FooterRender>, default: undefined },
    placement: { type: String as PropType<any>, default: 'bottomLeft' },
    popoverProps: { type: Object as PropType<Record<string, any>>, default: undefined },
  },
  setup(props, { attrs, slots, expose }) {
    const baseRef = shallowRef<any>()
    const popoverOpen = ref(false)
    /** 折叠区临时编辑值，确认后写回主 form */
    const moreValues = ref<Record<string, any>>({})

    expose({
      get formInstance() {
        return baseRef.value?.formInstance
      },
      submit: () => baseRef.value?.submit?.(),
      reset: () => baseRef.value?.reset?.(),
      getFieldsValue: () => baseRef.value?.getFieldsValue?.(),
    })

    function getFormValues(): Record<string, any> {
      return baseRef.value?.getFieldsValue?.() || {}
    }

    function setFormValues(next: Record<string, any>) {
      baseRef.value?.setFieldsValue?.(next)
    }

    function commitMoreValues() {
      const formValues = getFormValues()
      setFormValues({ ...formValues, ...moreValues.value })
      baseRef.value?.submit?.()
      popoverOpen.value = false
    }

    function clearCollapseFields(collapseItems: VNode[]) {
      const next: Record<string, any> = {}
      collapseItems.forEach((item) => {
        const name = (item.props as any)?.name
        if (typeof name === 'string')
          next[name] = undefined
      })
      moreValues.value = { ...moreValues.value, ...next }
      const formValues = getFormValues()
      setFormValues({ ...formValues, ...next })
    }

    const collapseLabelNode = computed<VNodeChild>(() => {
      if (props.collapseLabel)
        return props.collapseLabel
      if (props.collapse)
        return <FilterOutlined class="ant-pro-form-light-filter-collapse-icon" />
      return (
        <FieldLabel
          variant={props.variant}
          size={props.size}
          label="更多筛选"
        />
      )
    })

    function renderCollapseChild(child: VNode): VNode {
      const name = (child.props as any)?.name as string | undefined
      const newFieldProps = {
        ...((child.props as any)?.fieldProps || {}),
        onChange: (...args: any[]) => {
          const value = args[0]?.target ? args[0].target.value ?? args[0].target.checked : args[0]
          if (name)
            moreValues.value = { ...moreValues.value, [name]: value }
          return false
        },
      }
      const valuePropName = (child.props as any)?.valuePropName || 'value'
      if (name && Object.prototype.hasOwnProperty.call(moreValues.value, name))
        newFieldProps[valuePropName] = moreValues.value[name]
      return cloneVNode(child, {
        fieldProps: { ...newFieldProps, placement: props.placement, variant: props.variant },
      })
    }

    function renderOutsideChild(child: VNode): VNode {
      return cloneVNode(child, {
        fieldProps: {
          ...((child.props as any)?.fieldProps || {}),
          placement: (child.props as any)?.fieldProps?.placement ?? props.placement,
          variant: 'borderless',
        },
        proFieldProps: {
          ...((child.props as any)?.proFieldProps || {}),
          label: (child.props as any)?.label,
          variant: props.variant,
          light: true,
        },
        variant: props.variant,
      })
    }

    function renderContent(items: VNodeChild) {
      const flat = flattenLightFilterItems(items)
      const collapseItems: VNode[] = []
      const outsideItems: VNode[] = []
      flat.forEach((item) => {
        const secondary = (item.props as any)?.secondary
        if (props.collapse || secondary)
          collapseItems.push(item)
        else
          outsideItems.push(item)
      })

      const formValues = getFormValues()
      const hasEffectiveValue = Object.keys(formValues).some((key) => {
        const value = formValues[key]
        return Array.isArray(value) ? value.length > 0 : Boolean(value)
      })

      return (
        <div
          class={[
            'ant-pro-form-light-filter',
            `ant-pro-form-light-filter-${props.size}`,
            hasEffectiveValue ? 'ant-pro-form-light-filter-effective' : '',
          ].filter(Boolean).join(' ')}
        >
          <div class="ant-pro-form-light-filter-container">
            {outsideItems.map((child, index) => (
              <div class="ant-pro-form-light-filter-item" key={(child.key as any) ?? index}>
                {renderOutsideChild(child)}
              </div>
            ))}
            {collapseItems.length > 0
              ? (
                  <div class="ant-pro-form-light-filter-item" key="more">
                    <FilterDropdown
                      open={popoverOpen.value}
                      onUpdate:open={(open: boolean) => (popoverOpen.value = open)}
                      placement={props.placement}
                      popoverProps={props.popoverProps}
                      label={collapseLabelNode.value}
                      footerRender={props.footerRender}
                      footer={{
                        onConfirm: commitMoreValues,
                        onClear: () => clearCollapseFields(collapseItems),
                      }}
                    >
                      {collapseItems.map(child => (
                        <div class="ant-pro-form-light-filter-line" key={(child.key as any) ?? (child.props as any)?.name}>
                          {renderCollapseChild(child)}
                        </div>
                      ))}
                    </FilterDropdown>
                  </div>
                )
              : null}
          </div>
        </div>
      )
    }

    return () => (
      <BaseForm
        ref={baseRef}
        formComponentType="LightFilter"
        formItemProps={{ colon: false, labelAlign: 'left' }}
        fieldProps={{ style: { width: undefined } }}
        contentRender={items => renderContent(items)}
        {...attrs}
        onValuesChange={() => {
          baseRef.value?.submit?.()
        }}
      >
        {{
          default: () => slots.default?.(),
        }}
      </BaseForm>
    )
  },
})

/**
 * 对标 React `lightFilterFieldComponents`，提供 `<LightFilterInput>` 等命名组件。
 * Vue 模板不支持 `Component.subComponent` 用法，因此以独立命名组件导出。
 */
function createLightFilterField(Field: any, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => (
        <Field
          {...attrs}
          proFieldProps={{ light: true, ...(attrs as any).proFieldProps }}
        >
          {slots.default?.()}
        </Field>
      )
    },
  })
}

export const LightFilterInput = createLightFilterField(ProFormText, 'LightFilterInput')
export const LightFilterPassword = createLightFilterField(ProFormTextPassword, 'LightFilterPassword')
export const LightFilterTextArea = createLightFilterField(ProFormTextArea, 'LightFilterTextArea')
export const LightFilterSelect = createLightFilterField(ProFormSelect, 'LightFilterSelect')
export const LightFilterTreeSelect = createLightFilterField(ProFormTreeSelect, 'LightFilterTreeSelect')
export const LightFilterCascader = createLightFilterField(ProFormCascader, 'LightFilterCascader')
export const LightFilterDigit = createLightFilterField(ProFormDigit, 'LightFilterDigit')
export const LightFilterDigitRange = createLightFilterField(ProFormDigitRange, 'LightFilterDigitRange')
export const LightFilterSlider = createLightFilterField(ProFormSlider, 'LightFilterSlider')
export const LightFilterDate = createLightFilterField(ProFormDatePicker, 'LightFilterDate')
export const LightFilterDateTime = createLightFilterField(ProFormDateTimePicker, 'LightFilterDateTime')
export const LightFilterTime = createLightFilterField(ProFormTimePicker, 'LightFilterTime')
export const LightFilterDateRange = createLightFilterField(ProFormDateRangePicker, 'LightFilterDateRange')
export const LightFilterDateTimeRange = createLightFilterField(ProFormDateTimeRangePicker, 'LightFilterDateTimeRange')
export const LightFilterCheckboxGroup = createLightFilterField(ProFormCheckboxGroup, 'LightFilterCheckboxGroup')
export const LightFilterFieldSet = createLightFilterField(ProFormFieldSet, 'LightFilterFieldSet')
export const LightFilterSwitch = createLightFilterField(ProFormSwitch, 'LightFilterSwitch')

export default LightFilter
export { FieldLabel, FilterDropdown, LightFilter }
