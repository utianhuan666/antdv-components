import type { VNodeChild } from 'vue'
import ProFormItem from '../../FormItem'
import ProFormField from '../../Field'
import ProFormDependency from '../../Dependency'
import type { NamePath } from '../../../typing'
import type { ItemType, ProFormColumnsType, ProSchemaRenderValueTypeFunction } from '../typing'

function normalizeDependencyNames(name?: NamePath[] | NamePath): NamePath[] {
  if (!name)
    return []
  if (Array.isArray(name) && Array.isArray(name[0]))
    return name as NamePath[]
  return Array.isArray(name) ? name as NamePath[] : [name]
}

function fieldName(item: ItemType) {
  return item.name || item.key || item.dataIndex
}

function renderDefaultField(item: ItemType, extraProps: Record<string, any> = {}) {
  const fieldProps = item.getFieldProps?.() || {}
  const formItemProps = item.getFormItemProps?.() || {}

  return (
    <ProFormField
      key={[item.key, item.index || 0].join('-')}
      name={fieldName(item) as any}
      label={item.label}
      tooltip={item.tooltip}
      valueType={(item.valueType || 'text') as any}
      valueEnum={typeof item.valueEnum === 'function' ? item.valueEnum() : item.valueEnum}
      request={item.request}
      params={item.params}
      width={item.width as any}
      initialValue={item.initialValue}
      readonly={item.readonly}
      fieldProps={{
        ...fieldProps,
        debounceTime: item.debounceTime ?? fieldProps.debounceTime,
      }}
      proFieldProps={item.proFieldProps}
      rules={formItemProps.rules}
      required={formItemProps.required}
      transform={item.transform as any}
      convertValue={item.convertValue as any}
      formItemProps={{
        ...formItemProps,
        colProps: item.colProps,
      }}
      ignoreFormItem={item.ignoreFormItem}
      {...extraProps}
    />
  )
}

function renderCustomInItem(item: ItemType, dom: VNodeChild) {
  const formItemProps = item.getFormItemProps?.() || {}
  return (
    <ProFormItem
      key={[item.key, item.index || 0].join('-')}
      name={fieldName(item) as any}
      label={item.label}
      tooltip={item.tooltip}
      rules={formItemProps.rules}
      required={formItemProps.required}
      initialValue={item.initialValue}
      valueType={(item.valueType || 'text') as any}
      transform={item.transform as any}
      convertValue={item.convertValue as any}
      formItemProps={formItemProps}
    >
      {dom}
    </ProFormItem>
  )
}

export const field: ProSchemaRenderValueTypeFunction = (
  item,
  { action, formRef, type, originItem },
) => {
  const defaultRender = (_schema?: ProFormColumnsType) => renderDefaultField(item, { ignoreFormItem: true })

  const renderConfig = {
    ...item,
    fieldProps: item.getFieldProps?.(),
    formItemProps: item.getFormItemProps?.(),
    defaultRender,
    type,
  }

  const getField = () => {
    if (item.formItemRender) {
      const dom = item.formItemRender(
        {
          ...item,
          key: item.key?.toString(),
          formItemProps: item.getFormItemProps?.(),
          fieldProps: item.getFieldProps?.(),
          originProps: originItem,
        } as any,
        renderConfig,
        formRef.value,
      )
      if (!dom || item.ignoreFormItem)
        return dom
      return renderCustomInItem(item, dom)
    }

    if (item.render) {
      const dom = item.render(
        defaultRender(),
        {} as any,
        item.index || 0,
        action?.value,
        {
          ...item,
          key: item.key?.toString(),
          formItemProps: item.getFormItemProps?.(),
          fieldProps: item.getFieldProps?.(),
          originProps: originItem,
        } as any,
      )
      return renderCustomInItem(item, dom)
    }

    return renderDefaultField(item)
  }

  const dependencies = normalizeDependencyNames(item.dependencies)
  if (dependencies.length) {
    return (
      <ProFormDependency name={dependencies as any} key={item.key as any}>
        {getField}
      </ProFormDependency>
    )
  }

  return getField()
}
