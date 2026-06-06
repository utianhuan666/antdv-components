import type { ProDescriptionsColumn } from './typing'
import { getValueByNamePath } from '../utils'

export function getDataFromConfig(
  item: ProDescriptionsColumn,
  entity: Record<string, unknown> | undefined,
) {
  if (item.dataIndex === undefined)
    return undefined
  return getValueByNamePath(entity || {}, item.dataIndex as any)
}
