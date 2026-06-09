import type { ProDescriptionsColumn } from './typing'
import { get } from '@v-c/util'

export function getDataFromConfig(
  item: ProDescriptionsColumn,
  entity: Record<string, unknown> | undefined,
) {
  if (item.dataIndex === undefined)
    return undefined
  return get(entity || {}, (Array.isArray(item.dataIndex) ? item.dataIndex : [item.dataIndex]) as any)
}
