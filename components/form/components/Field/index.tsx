import type { PropType, VNodeChild } from 'vue'
import type { ProFieldValueTypeInput } from '../../../field'
import type { NamePath, ProFormFieldItemProps, ProFormItemCreateConfig } from '../../typing'
import { Comment, computed, defineComponent, Fragment, onMounted, Text, watch } from 'vue'
import { ProField } from '../../../field'
import { useEditOrReadOnly } from '../../BaseForm/EditOrReadOnlyContext'
import { useFieldContext } from '../../FieldContext'
import LightWrapper from '../../layouts/LightFilter/LightWrapper'
import ProFormItem from '../FormItem'

/**
 * ProFormField – 对标 React `src/form/components/Field/index.tsx`：
 * 1. 内部包一层 ProFormItem (FormItem)
 * 2. 把当前 model[name] 注入到 ProField，作为 value/text
 * 3. 监听 ProField onChange，把值写回 model
 *
 * 这里的 children/text 字段不展开，专注 valueType 渲染。
 */
const ProFormField = defineComponent({
  name: 'ProFormField',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, default: undefined },
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    tooltip: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    rules: { type: Array as PropType<any[]>, default: undefined },
    required: { type: Boolean, default: undefined },
    valuePropName: { type: String, default: 'value' },
    initialValue: { type: null as unknown as PropType<ProFormFieldItemProps['initialValue']>, default: undefined },
    transform: { type: Function as PropType<NonNullable<ProFormFieldItemProps['transform']>>, default: undefined },
    convertValue: { type: Function as PropType<NonNullable<ProFormFieldItemProps['convertValue']>>, default: undefined },
    formItemProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    value: { type: null as unknown as PropType<any>, default: undefined },
    valueType: { type: [String, Object] as PropType<ProFieldValueTypeInput>, default: 'text' },
    valueEnum: { type: [Object, Map] as PropType<ProFormFieldItemProps['valueEnum']>, default: undefined },
    request: { type: Function as PropType<ProFormFieldItemProps['request']>, default: undefined },
    params: { type: Object as PropType<Record<string, any>>, default: undefined },
    placeholder: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    width: { type: [String, Number] as PropType<ProFormFieldItemProps['width']>, default: undefined },
    readonly: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    allowClear: { type: Boolean, default: undefined },
    proFieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: VNodeChild) => VNodeChild>, default: undefined },
    fieldConfig: { type: Object as PropType<ProFormItemCreateConfig>, default: () => ({}) },
    /** ignoreFormItem=true 表示当前组件不希望被 antdv FormItem 接管，常用于自定义渲染 */
    ignoreFormItem: { type: Boolean, default: false },
  },
  emits: ['change'],
  setup(props, { emit, slots, attrs }) {
    const fieldContext = useFieldContext()
    const editContext = useEditOrReadOnly()

    const finalReadonly = computed(() => Boolean(editContext.readonly ?? props.readonly))

    const widthStyle = computed(() => {
      const sizeMap: Record<string, number> = { xs: 104, sm: 216, md: 328, lg: 440, xl: 552 }
      const value = props.width
      if (value === undefined)
        return undefined
      if (typeof value === 'number')
        return `${value}px`
      if (sizeMap[value])
        return `${sizeMap[value]}px`
      return value
    })

    function getCellValue() {
      if (props.name === undefined)
        return props.value
      const path = Array.isArray(props.name) ? props.name : [props.name]
      return path.reduce<any>((acc, key) => acc?.[key], fieldContext.model || {})
    }

    function setCellValue(value: any) {
      if (props.name === undefined)
        return
      const path = Array.isArray(props.name) ? props.name : [props.name]
      const last = path[path.length - 1]
      if (last === undefined)
        return
      const parent = path.slice(0, -1).reduce<Record<string, any>>((acc, key) => {
        if (!acc[key] || typeof acc[key] !== 'object')
          acc[key] = {}
        return acc[key]
      }, fieldContext.model || {})
      parent[last] = value
    }

    function handleChange(...args: any[]) {
      const next = args[0]?.target ? args[0].target.value ?? args[0].target.checked : args[0]
      setCellValue(next)
      emit('change', ...args)
      props.fieldProps?.onChange?.(...args)
    }

    function applyInitialValue() {
      if (props.name === undefined || props.initialValue === undefined || getCellValue() !== undefined)
        return
      setCellValue(props.initialValue)
    }

    onMounted(applyInitialValue)
    watch(() => props.initialValue, applyInitialValue)

    function renderProField() {
      const value = getCellValue()
      const mergedFieldProps: Record<string, any> = {
        ...(fieldContext.fieldProps || {}),
        ...(attrs || {}),
        ...(props.fieldProps || {}),
        disabled: props.disabled ?? props.fieldProps?.disabled,
        id: props.fieldProps?.id ?? (typeof props.name === 'string' ? props.name : undefined),
        allowClear: props.allowClear ?? props.fieldProps?.allowClear,
        placeholder: props.placeholder ?? props.fieldProps?.placeholder,
        style: {
          ...(widthStyle.value ? { width: widthStyle.value } : {}),
          ...(props.fieldProps?.style || {}),
        },
        onChange: handleChange,
      }

      return (
        <ProField
          mode={finalReadonly.value ? 'read' : 'edit'}
          text={value}
          value={value}
          valueType={props.valueType}
          valueEnum={props.valueEnum}
          request={props.request}
          formItemRender={props.formItemRender as any}
          fieldProps={mergedFieldProps}
          readonly={finalReadonly.value}
          {...(props.proFieldProps || {})}
        />
      )
    }

    function getValidSlotChildren() {
      const children = slots.default?.()
      if (!children?.length)
        return undefined

      const validChildren = children.filter((node) => {
        if (node.type === Comment)
          return false
        if (node.type === Text && typeof node.children === 'string' && !node.children.trim())
          return false
        if (node.type === Fragment) {
          const fragmentChildren = Array.isArray(node.children) ? node.children : []
          return fragmentChildren.some((child: any) => {
            if (child?.type === Comment)
              return false
            if (child?.type === Text && typeof child.children === 'string' && !child.children.trim())
              return false
            return Boolean(child)
          })
        }
        return true
      })

      return validChildren.length > 0 ? validChildren : undefined
    }

    return () => {
      const children = getValidSlotChildren()
      // ignoreFormItem 时不再包 antdv FormItem，外层一般已自定义包装
      if (props.ignoreFormItem || !props.name) {
        return children ?? renderProField()
      }

      // light 模式：把 ProField 渲染包到 LightWrapper（FilterDropdown + FieldLabel）里，
      // 由 LightWrapper 接管 value/onChange，外层 ProFormItem 不再展示 label/tooltip。
      // 对标 React `src/form/components/FormItem/warpField.tsx` 中的 isLightMode 分支。
      const isLightMode = props.proFieldProps?.light === true
      const innerNode = children ?? renderProField()
      const finalChild = isLightMode
        ? (
            <LightWrapper
              label={props.label}
              value={getCellValue()}
              valuePropName={props.valuePropName}
              variant={props.proFieldProps?.variant ?? props.fieldProps?.variant ?? 'outlined'}
              size={props.proFieldProps?.size}
              placeholder={Array.isArray(props.placeholder) ? props.placeholder[0] : props.placeholder}
              disabled={!!props.disabled}
              allowClear={props.allowClear !== false}
              placement={props.fieldProps?.placement ?? props.proFieldProps?.placement}
              valueType={typeof props.valueType === 'string' ? props.valueType : undefined}
              footerRender={props.proFieldProps?.footerRender ?? props.fieldProps?.footerRender}
              labelFormatter={props.proFieldProps?.labelFormatter}
              onChange={(value: any) => handleChange(value)}
            >
              {innerNode}
            </LightWrapper>
          )
        : innerNode

      return (
        <ProFormItem
          name={props.name}
          label={isLightMode ? undefined : props.label}
          tooltip={isLightMode ? undefined : props.tooltip}
          rules={props.rules}
          required={props.required}
          initialValue={props.initialValue}
          valueType={props.valueType}
          dataFormat={props.fieldProps?.format}
          transform={props.transform}
          convertValue={props.convertValue}
          formItemProps={{
            valuePropName: props.valuePropName,
            ...(fieldContext.formItemProps || {}),
            ...(props.formItemProps || {}),
          }}
        >
          {finalChild}
        </ProFormItem>
      )
    }
  },
})

export default ProFormField
