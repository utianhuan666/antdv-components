import type { ProDescriptionsColumn } from './typing'

export function resolveDescriptionsValueType(
  item: ProDescriptionsColumn,
  entity: Record<string, unknown> | undefined,
) {
  const valueType = item.valueType
  if (typeof valueType === 'function')
    return valueType(entity || {}, 'descriptions')
  return valueType || 'text'
}
