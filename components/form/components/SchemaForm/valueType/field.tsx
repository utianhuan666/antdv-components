import type { ProSchemaRenderValueTypeFunction } from '../typing'
import ProFormDependency from '../../Dependency'
import ProFormField from '../../Field'

function omitKeys<T extends Record<string, any>>(value: T, keys: string[]) {
  const next: Record<string, any> = {}
  Object.keys(value || {}).forEach((key) => {
    if (!keys.includes(key))
      next[key] = value[key]
  })
  return next as T
}

export const field: ProSchemaRenderValueTypeFunction<any, any> = (
  item,
  { action, formRef, type, originItem },
) => {
  const formType = type || 'form'
  const formFieldProps = {
    ...omitKeys(item, [
      'dataIndex',
      'width',
      'render',
      'formItemRender',
      'renderText',
      'title',
    ]),
    name: item.name || item.key || item.dataIndex,
    formItemProps: item.getFormItemProps?.(),
    fieldProps: item.getFieldProps?.(),
    width: item.width as 'md',
    render: item.render
      ? (dom: any, entity: any, renderIndex: number) =>
          item.render?.(dom, entity, renderIndex, action?.value || action?.current, {
            type: formType,
            ...item,
            key: item.key?.toString(),
            formItemProps: item.getFormItemProps?.(),
            fieldProps: item.getFieldProps?.(),
          })
      : undefined,
  }

  const defaultRender = () => {
    const { key: _key, ...rest } = formFieldProps
    return <ProFormField key={_key as any} {...rest as any} ignoreFormItem />
  }

  const formItemRender = item.formItemRender
    ? (_: any, config: any) => {
        const renderConfig = { ...config, onChange: undefined }
        return item.formItemRender?.(
          {
            type: formType,
            ...item,
            key: item.key?.toString(),
            formItemProps: item.getFormItemProps?.(),
            fieldProps: item.getFieldProps?.(),
            originProps: originItem,
          },
          {
            ...renderConfig,
            defaultRender,
            type: formType,
          },
          formRef.value!,
        )
      }
    : undefined

  const getField = () => {
    if (item.formItemRender) {
      const dom = formItemRender?.(null, {})
      if (!dom || item.ignoreFormItem)
        return dom
    }

    return (
      <ProFormField
        {...formFieldProps as any}
        key={[item.key, item.index || 0].join('-')}
        formItemRender={formItemRender}
      />
    )
  }

  if (item.dependencies) {
    return (
      <ProFormDependency name={item.dependencies || []} key={item.key as any}>
        {getField}
      </ProFormDependency>
    )
  }

  return getField()
}

export default field
