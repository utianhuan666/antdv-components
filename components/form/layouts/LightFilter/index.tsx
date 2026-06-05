import type { FormProps, PopoverProps, SizeType, TooltipPlacement } from 'antdv-next'
import type { Component, FunctionalComponent, VNode, VNodeChild } from 'vue'
import type { CommonFormProps, FormData, FormRefLike } from '../../typing'
import type { FieldLabelVariant } from './FieldLabel'
import type { FooterRender } from './FilterDropdown'
import { FilterOutlined } from '@antdv-next/icons'
import { cloneVNode, Comment, computed, defineComponent, Fragment, h, isVNode, ref, shallowRef, Text } from 'vue'
import { BaseForm } from '../../BaseForm'
import ProFormCascader from '../../components/Cascader'
import { ProFormCheckboxGroup } from '../../components/Checkbox'
import ProFormDatePicker, { ProFormDateTimePicker, ProFormTimePicker } from '../../components/DatePicker'
import ProFormDateRangePicker, {
  ProFormDateMonthRangePicker,
  ProFormDateQuarterRangePicker,
  ProFormDateTimeRangePicker,
  ProFormDateWeekRangePicker,
  ProFormDateYearRangePicker,
  ProFormTimeRangePicker,
} from '../../components/DateRangePicker'
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

type LightFilterChildProps = Record<string, unknown> & {
  name?: string
  secondary?: boolean
  fieldProps?: Record<string, unknown>
  proFieldProps?: Record<string, unknown>
  valuePropName?: string
}

export type LightFilterProps<T = FormData, U = FormData> = Omit<FormProps, 'onFinish'> & CommonFormProps<T, U> & {
  collapse?: boolean
  collapseLabel?: VNodeChild
  variant?: FieldLabelVariant
  size?: SizeType
  ignoreRules?: boolean
  footerRender?: FooterRender
  placement?: TooltipPlacement
  popoverProps?: Omit<PopoverProps, 'children' | 'content' | 'trigger' | 'open' | 'onOpenChange' | 'placement'>
}

const lightFilterPropNames = [
  'collapse',
  'collapseLabel',
  'variant',
  'size',
  'ignoreRules',
  'footerRender',
  'placement',
  'popoverProps',
] as const

function resolveBoolean(value: unknown, fallback = false) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

function getVNodeProps(node: VNode): LightFilterChildProps {
  return (node.props || {}) as LightFilterChildProps
}

function readEventValue(input: unknown) {
  const target = input && typeof input === 'object' && 'target' in input
    ? (input as { target?: { value?: unknown, checked?: unknown } }).target
    : undefined
  return target ? (target.value ?? target.checked) : input
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
    const componentName = node.type && typeof node.type === 'object' && 'name' in node.type
      ? node.type.name
      : undefined
    if (componentName === 'ProFormGroup' && !getVNodeProps(node).title) {
      const groupChildren = node.children && typeof node.children === 'object' && 'default' in node.children
        ? (node.children as { default?: () => VNodeChild }).default?.()
        : node.children
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
 * 3. 折叠区内部使用临时 `moreValues`，在底部 `确认` 后整体提交，`清除` 清空当前折叠字段。
 */
const LightFilterImpl = defineComponent({
  name: 'LightFilter',
  inheritAttrs: false,
  props: [...lightFilterPropNames],
  setup(rawProps, { attrs, slots, expose }) {
    const props = rawProps as Readonly<LightFilterProps>
    const baseRef = shallowRef<FormRefLike>()
    const popoverOpen = ref(false)
    /** 折叠区临时编辑值，确认后写回主 form */
    const moreValues = ref<FormData>({})

    expose({
      get formInstance() {
        return baseRef.value?.formInstance
      },
      submit: () => baseRef.value?.submit?.(),
      reset: () => baseRef.value?.reset?.(),
      getFieldsValue: () => baseRef.value?.getFieldsValue?.(),
    })

    function getFormValues(): FormData {
      return baseRef.value?.getFieldsValue?.() || {}
    }

    function setFormValues(next: FormData) {
      baseRef.value?.setFieldsValue?.(next)
    }

    function commitMoreValues() {
      const formValues = getFormValues()
      setFormValues({ ...formValues, ...moreValues.value })
      baseRef.value?.submit?.()
      popoverOpen.value = false
    }

    function clearCollapseFields(collapseItems: VNode[]) {
      const next: FormData = {}
      collapseItems.forEach((item) => {
        const name = getVNodeProps(item).name
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
      if (resolveBoolean(props.collapse))
        return <FilterOutlined class="ant-pro-form-light-filter-collapse-icon" />
      return (
        <FieldLabel
          variant={props.variant ?? 'borderless'}
          size={props.size ?? 'middle'}
          label="更多筛选"
        />
      )
    })

    function renderCollapseChild(child: VNode): VNode {
      const childProps = getVNodeProps(child)
      const name = childProps.name
      const fieldProps = childProps.fieldProps || {}
      const newFieldProps: Record<string, unknown> & { onChange: (...args: unknown[]) => boolean } = {
        ...fieldProps,
        onChange: (...args: unknown[]) => {
          const value = readEventValue(args[0])
          if (name)
            moreValues.value = { ...moreValues.value, [name]: value }
          ;(fieldProps.onChange as ((...args: unknown[]) => void) | undefined)?.(...args)
          return false
        },
      }
      const valuePropName = childProps.valuePropName || 'value'
      if (name && Object.prototype.hasOwnProperty.call(moreValues.value, name))
        newFieldProps[valuePropName] = moreValues.value[name]
      // 折叠区内部：禁用 light 模式（防止 LightFilter.xxx 命名组件叠加一层 popover），按普通字段渲染
      return cloneVNode(child, {
        fieldProps: { ...newFieldProps, placement: props.placement },
        proFieldProps: {
          ...(childProps.proFieldProps || {}),
          light: false,
        },
      })
    }

    function renderOutsideChild(child: VNode): VNode {
      // 外侧字段：开启 light，让 ProFormField/LightWrapper 接管 FilterDropdown + FieldLabel 渲染。
      const childProps = getVNodeProps(child)
      return cloneVNode(child, {
        proFieldProps: {
          ...(childProps.proFieldProps || {}),
          light: true,
          variant: props.variant ?? 'borderless',
          size: props.size ?? 'middle',
        },
        fieldProps: {
          ...(childProps.fieldProps || {}),
          placement: childProps.fieldProps?.placement ?? props.placement,
        },
      })
    }

    function renderContent(items: VNodeChild) {
      const flat = flattenLightFilterItems(items)
      const collapseItems: VNode[] = []
      const outsideItems: VNode[] = []
      flat.forEach((item) => {
        const secondary = getVNodeProps(item).secondary
        if (resolveBoolean(props.collapse) || secondary)
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
            `ant-pro-form-light-filter-${props.size ?? 'middle'}`,
            hasEffectiveValue ? 'ant-pro-form-light-filter-effective' : '',
          ].filter(Boolean).join(' ')}
        >
          <div class="ant-pro-form-light-filter-container">
            {outsideItems.map((child, index) => (
              <div class="ant-pro-form-light-filter-item" key={child.key ?? index}>
                {renderOutsideChild(child)}
              </div>
            ))}
            {collapseItems.length > 0
              ? (
                  <div class="ant-pro-form-light-filter-item" key="more">
                    <FilterDropdown
                      open={popoverOpen.value}
                      onUpdate:open={(open: boolean) => (popoverOpen.value = open)}
                      placement={props.placement ?? 'bottomLeft'}
                      popoverProps={props.popoverProps}
                      label={collapseLabelNode.value}
                      footerRender={props.footerRender}
                      footer={{
                        onConfirm: commitMoreValues,
                        onClear: () => clearCollapseFields(collapseItems),
                      }}
                    >
                      {collapseItems.map(child => (
                        <div class="ant-pro-form-light-filter-line" key={child.key ?? getVNodeProps(child).name}>
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

const LightFilter = LightFilterImpl as unknown as FunctionalComponent<LightFilterProps>

/**
 * 对标 React `lightFilterFieldComponents`，提供 `<LightFilterInput>` 等命名组件。
 * Vue 模板不支持 `Component.subComponent` 用法，因此以独立命名组件导出。
 */
function createLightFilterField(Field: Component, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h(Field, {
        ...attrs,
        proFieldProps: { light: true, ...((attrs as { proFieldProps?: Record<string, unknown> }).proFieldProps || {}) },
      }, slots.default ? { default: () => slots.default?.() } : undefined)
    },
  })
}

export const LightFilterInput = createLightFilterField(ProFormText, 'LightFilterInput')
export const LightFilterPassword = createLightFilterField(ProFormTextPassword, 'LightFilterPassword')
export const LightFilterText = createLightFilterField(ProFormText, 'LightFilterText')
export const LightFilterTextArea = createLightFilterField(ProFormTextArea, 'LightFilterTextArea')
export const LightFilterSelect = createLightFilterField(ProFormSelect, 'LightFilterSelect')
export const LightFilterSearchSelect = createLightFilterField(ProFormSelect.SearchSelect, 'LightFilterSearchSelect')
export const LightFilterTreeSelect = createLightFilterField(ProFormTreeSelect, 'LightFilterTreeSelect')
export const LightFilterCascader = createLightFilterField(ProFormCascader, 'LightFilterCascader')
export const LightFilterDigit = createLightFilterField(ProFormDigit, 'LightFilterDigit')
export const LightFilterDigitRange = createLightFilterField(ProFormDigitRange, 'LightFilterDigitRange')
export const LightFilterSlider = createLightFilterField(ProFormSlider, 'LightFilterSlider')
export const LightFilterDate = createLightFilterField(ProFormDatePicker, 'LightFilterDate')
export const LightFilterDateTime = createLightFilterField(ProFormDateTimePicker, 'LightFilterDateTime')
export const LightFilterTime = createLightFilterField(ProFormTimePicker, 'LightFilterTime')
export const LightFilterTimeRange = createLightFilterField(ProFormTimeRangePicker, 'LightFilterTimeRange')
export const LightFilterDateRange = createLightFilterField(ProFormDateRangePicker, 'LightFilterDateRange')
export const LightFilterDateTimeRange = createLightFilterField(ProFormDateTimeRangePicker, 'LightFilterDateTimeRange')
export const LightFilterWeekRange = createLightFilterField(ProFormDateWeekRangePicker, 'LightFilterWeekRange')
export const LightFilterMonthRange = createLightFilterField(ProFormDateMonthRangePicker, 'LightFilterMonthRange')
export const LightFilterQuarterRange = createLightFilterField(ProFormDateQuarterRangePicker, 'LightFilterQuarterRange')
export const LightFilterYearRange = createLightFilterField(ProFormDateYearRangePicker, 'LightFilterYearRange')
export const LightFilterTimePickerRange = createLightFilterField(ProFormTimePicker.RangePicker, 'LightFilterTimePickerRange')
export const LightFilterCheckboxGroup = createLightFilterField(ProFormCheckboxGroup, 'LightFilterCheckboxGroup')
export const LightFilterFieldSet = createLightFilterField(ProFormFieldSet, 'LightFilterFieldSet')
export const LightFilterSwitch = createLightFilterField(ProFormSwitch, 'LightFilterSwitch')

export default LightFilter
export { FieldLabel, FilterDropdown, LightFilter }
