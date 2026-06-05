export type GetRowKey<RecordType> = (record: RecordType, index?: number) => string | number

interface LazyMapCache<RecordType> {
  data?: readonly RecordType[]
  childrenColumnName?: string
  kvMap?: Map<string | number, RecordType>
  getRowKey?: GetRowKey<RecordType>
}

function useLazyKVMap<RecordType extends Record<string, any> = Record<string, any>>(data: readonly RecordType[], childrenColumnName: string, getRowKey: GetRowKey<RecordType>) {
  const mapCacheRef: { current: LazyMapCache<RecordType> } = { current: {} }

  function getRecordByKey(key: string | number): RecordType | undefined {
    function dig(records: readonly RecordType[], kv: Map<string | number, RecordType>) {
      records.forEach((record, index) => {
        const rowKey = getRowKey(record, index)
        kv.set(rowKey, record)
        if (record && typeof record === 'object' && childrenColumnName in record)
          dig(((record as any)[childrenColumnName] || []) as RecordType[], kv)
      })
    }
    if (
      !mapCacheRef.current
      || mapCacheRef.current.data !== data
      || mapCacheRef.current.childrenColumnName !== childrenColumnName
      || mapCacheRef.current.getRowKey !== getRowKey
    ) {
      const kvMap = new Map<string | number, RecordType>()
      dig(data, kvMap)
      mapCacheRef.current = { data, childrenColumnName, kvMap, getRowKey }
    }
    return mapCacheRef.current.kvMap?.get(key)
  }

  return [getRecordByKey] as const
}

export default useLazyKVMap
