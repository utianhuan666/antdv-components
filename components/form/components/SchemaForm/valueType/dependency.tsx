import ProFormDependency from '../../Dependency'
import type { NamePath } from '../../../typing'
import type { ProSchemaRenderValueTypeFunction } from '../typing'

function normalizeDependencyNames(name?: NamePath[] | NamePath): NamePath[] {
  if (!name)
    return []
  if (Array.isArray(name) && Array.isArray(name[0]))
    return name as NamePath[]
  return Array.isArray(name) ? name as NamePath[] : [name]
}

export const dependency: ProSchemaRenderValueTypeFunction = (item, helpers) => {
  if (item.valueType !== 'dependency')
    return true

  const fieldProps = item.getFieldProps?.() || {}
  const names = normalizeDependencyNames(item.name || fieldProps.name)
  if (!names.length || typeof item.columns !== 'function')
    return null

  return (
    <ProFormDependency name={names as any} {...fieldProps} key={item.key as any}>
      {(values: Record<string, any>) => helpers.genItems((item.columns as any)(values))}
    </ProFormDependency>
  )
}
