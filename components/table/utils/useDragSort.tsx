import type { TableProps } from 'antdv-next'
import { computed, defineComponent, h, inject, provide } from 'vue'

const SortableItemContextKey = Symbol('ProTableSortableItemContext')

export interface UseDragSortOptions<T> {
  dataSource?: T[]
  onDragSortEnd?: (
    beforeIndex: number,
    afterIndex: number,
    newDataSource: T[],
  ) => Promise<void> | void
  dragSortKey?: string
  components?: TableProps<T>['components']
  rowKey: any
  DragHandle: any
}

function arrayMove<T>(data: T[], from: number, to: number) {
  const next = [...data]
  const [item] = next.splice(from, 1)
  if (item !== undefined)
    next.splice(to, 0, item)
  return next
}

export function useDragSort<T>(props: UseDragSortOptions<T>) {
  const handleDragEnd = (beforeIndex: number, afterIndex: number) => {
    if (beforeIndex === afterIndex || beforeIndex < 0 || afterIndex < 0)
      return
    const newData = arrayMove(props.dataSource || [], beforeIndex, afterIndex)
    props.onDragSortEnd?.(beforeIndex, afterIndex, newData)
  }

  const SortableRow = defineComponent({
    name: 'ProTableSortableRow',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      let dragStartIndex = -1
      const resolveIndex = () => {
        const rowKey = attrs['data-row-key']
        if (typeof props.rowKey === 'function') {
          return (props.dataSource || []).findIndex((item: any, index) =>
            props.rowKey(item, index) === rowKey,
          )
        }
        return (props.dataSource || []).findIndex((item: any) =>
          item?.[props.rowKey ?? 'index'] === rowKey,
        )
      }

      return () => {
        const index = resolveIndex()
        const rowProps = {
          ...attrs,
          draggable: !props.dragSortKey,
          onDragstart: (event: DragEvent) => {
            dragStartIndex = index
            event.dataTransfer?.setData('text/plain', String(index))
            ;(attrs as any).onDragstart?.(event)
          },
          onDragover: (event: DragEvent) => {
            event.preventDefault()
            ;(attrs as any).onDragover?.(event)
          },
          onDrop: (event: DragEvent) => {
            event.preventDefault()
            const before = Number(event.dataTransfer?.getData('text/plain') || dragStartIndex)
            handleDragEnd(before, index)
            ;(attrs as any).onDrop?.(event)
          },
        }
        const children = slots.default?.() || []

        if (!props.dragSortKey) {
          return h('tr', rowProps, children)
        }

        return h('tr', rowProps, children.map((child: any, childIndex) => {
          if (child?.key !== props.dragSortKey)
            return child
          const handle = h(props.DragHandle, {
            rowData: child?.props?.record,
            index: child?.props?.index ?? index,
            draggable: true,
            onDragstart: (event: DragEvent) => {
              dragStartIndex = index
              event.dataTransfer?.setData('text/plain', String(index))
            },
          })
          return h(
            defineComponent({
              name: 'ProTableSortableCellProvider',
              setup(_, { slots: providerSlots }) {
                provide(SortableItemContextKey, { handle })
                return () => providerSlots.default?.()
              },
            }),
            { key: child.key || childIndex },
            { default: () => child },
          )
        }))
      }
    },
  })

  const SortableItemCell = defineComponent({
    name: 'ProTableSortableItemCell',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const context = inject<{ handle?: any }>(SortableItemContextKey, {})
      return () => {
        const children = slots.default?.()
        if (!context.handle)
          return h('td', attrs, children)
        return h('td', attrs, [
          h('div', { style: { display: 'flex', alignItems: 'center' } }, [
            context.handle,
            ...(children || []),
          ]),
        ])
      }
    },
  })

  const components = computed(() => {
    const merged = props.components || {}
    if (!props.dragSortKey)
      return merged
    return {
      ...merged,
      body: {
        wrapper: (p: any) => h('tbody', p, p?.children),
        row: SortableRow,
        cell: SortableItemCell,
        ...(merged as any).body,
      },
    }
  })

  const DndContext = (_contextProps: any) => _contextProps?.children

  function move(beforeIndex: number, afterIndex: number) {
    handleDragEnd(beforeIndex, afterIndex)
  }

  return {
    DndContext,
    components: components.value,
    move,
  }
}
