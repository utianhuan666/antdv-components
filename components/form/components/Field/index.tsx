import type { ProFormFieldProps } from '../../typing'
import { Comment, computed, defineComponent, Fragment, onMounted, Text, watch } from 'vue'
import { ProField } from '../../../field'
import { setValueByNamePath } from '../../../utils'
import { useEditOrReadOnly } from '../../BaseForm/EditOrReadOnlyContext'
import { useFieldContext } from '../../FieldContext'
import LightWrapper from '../../layouts/LightFilter/LightWrapper'
import { proFormFieldPropNames } from '../../typing'
import ProFormItem from '../FormItem'

/**
 * ProFormField – 对标 React `src/form/components/Field/index.tsx`：
 * 1. 内部包一层 ProFormItem (FormItem)
 * 2. 把当前 model[name] 注入到 ProField，作为 value/text
 * 3. 监听 ProField onChange，把值写回 model
 *
 * 这里的 children/text 字段不展开，专注 valueType 渲染。
 */
const ProFormFieldImpl = defineComponent({
  name: 'ProFormField',
  inheritAttrs: false,
  props: [...proFormFieldPropNames],
  emits: ['change'],
  setup(rawProps, { emit, slots, attrs }) {
    const props = rawProps as ProFormFieldProps
    const fieldContext = useFieldContext()
    const editContext = useEditOrReadOnly()

    function resolveBoolean(value: unknown, fallback?: boolean) {
      if (value === undefined)
        return fallback
      return value === '' || value === true
    }

    const finalReadonly = computed(() => Boolean(editContext.readonly ?? resolveBoolean(props.readonly)))

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
      if (!fieldContext.model)
        return props.value
      const path = Array.isArray(props.name) ? props.name : [props.name]
      const value = path.reduce<any>((acc, key) => acc?.[key], fieldContext.model || {})
      return value === undefined ? props.value : value
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
      if (props.name !== undefined && fieldContext.model) {
        const model = fieldContext.rootModel || fieldContext.model
        fieldContext.onValuesChange?.(setValueByNamePath({}, props.name, next), model)
      }
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
        disabled: resolveBoolean(props.disabled, props.fieldProps?.disabled),
        id: props.fieldProps?.id ?? (typeof props.name === 'string' ? props.name : undefined),
        allowClear: resolveBoolean(props.allowClear, props.fieldProps?.allowClear),
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
          valueType={props.valueType ?? 'text'}
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
      if (resolveBoolean(props.ignoreFormItem) || !props.name) {
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
              disabled={!!resolveBoolean(props.disabled)}
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
          required={resolveBoolean(props.required)}
          initialValue={props.initialValue}
          valueType={props.valueType ?? 'text'}
          dataFormat={props.fieldProps?.format}
          transform={props.transform}
          convertValue={props.convertValue}
          formItemProps={{
            valuePropName: props.valuePropName ?? 'value',
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

const ProFormField = ProFormFieldImpl as typeof ProFormFieldImpl & {
  new(): { $props: ProFormFieldProps }
}

export default ProFormField
