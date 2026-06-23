import type { GetRowKey, TableRowSelection } from 'antdv-next/dist/table/interface'
import { Checkbox, Radio } from 'antdv-next'
import { computed, ref, watch } from 'vue'

type Key = string | number

interface UseSelectionConfig<RecordType> {
  getRowKey: GetRowKey<RecordType>
  getRecordByKey: (key: Key) => RecordType | undefined
  prefixCls?: string
  data: RecordType[]
  pageData: RecordType[]
  expandType?: 'row' | 'nest'
  childrenColumnName?: string
  locale?: any
}

function useSelection<RecordType>(
  config: UseSelectionConfig<RecordType>,
  rowSelection?: TableRowSelection<RecordType>,
) {
  const controlledKeys = () => rowSelection?.selectedRowKeys
  const innerKeys = ref<Key[]>(controlledKeys() || [])

  watch(
    () => controlledKeys()?.join(';'),
    () => {
      if (controlledKeys())
        innerKeys.value = controlledKeys() || []
    },
  )

  const selectedKeySet = computed(() => new Set(innerKeys.value))

  const toggleKey = (key: Key, record: RecordType, checked: boolean) => {
    if (rowSelection?.type === 'radio') {
      const nextKeys = [key]
      const selectedRows = [record]
      rowSelection?.onChange?.(nextKeys, selectedRows, { type: 'single', selectedRows, selectedRowKeys: nextKeys } as any)
      rowSelection?.onSelect?.(record, checked, selectedRows, {} as any)
      if (!controlledKeys())
        innerKeys.value = nextKeys
      return
    }
    const next = new Set(innerKeys.value)
    if (checked)
      next.add(key)
    else
      next.delete(key)
    const nextKeys = Array.from(next)
    const selectedRows = config.data.filter((item, idx) => next.has(config.getRowKey(item, idx)))
    rowSelection?.onChange?.(nextKeys, selectedRows, { type: 'multiple', selectedRows, selectedRowKeys: nextKeys } as any)
    rowSelection?.onSelect?.(record, checked, config.data.filter((item, idx) => next.has(config.getRowKey(item, idx))), {} as any)
    if (!controlledKeys())
      innerKeys.value = nextKeys
  }

  const selectItemRender = (_columns?: any[]) => {
    if (!rowSelection)
      return []
    return [
      {
        render: (_text: any, record: RecordType, index: number) => {
          const key = config.getRowKey(record, index)
          const checked = selectedKeySet.value.has(key)
          if (rowSelection.type === 'radio') {
            return (
              <Radio
                checked={checked}
                onChange={(event: any) => toggleKey(key, record, event.target.checked)}
              />
            )
          }
          return (
            <Checkbox
              checked={checked}
              onChange={(event: any) => toggleKey(key, record, event.target.checked)}
            />
          )
        },
      },
    ]
  }

  return [selectItemRender, selectedKeySet] as const
}

export default useSelection
