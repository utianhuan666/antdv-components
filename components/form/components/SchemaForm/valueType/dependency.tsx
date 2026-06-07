import type { ProSchemaRenderValueTypeFunction } from '../typing'
import ProFormDependency from '../../Dependency'

export const dependency: ProSchemaRenderValueTypeFunction = (item, helpers) => {
  if (item.valueType === 'dependency') {
    const fieldProps = item.getFieldProps?.()
    const name = item.name ?? fieldProps?.name
    if (!Array.isArray(name))
      return null

    return (
      <ProFormDependency name={name as any} {...fieldProps} key={item.key as any}>
        {(values: any) => {
          if (!item.columns || typeof item.columns !== 'function')
            return null
          return helpers.genItems(item.columns(values) as any)
        }}
      </ProFormDependency>
    )
  }

  return true
}

export default dependency
