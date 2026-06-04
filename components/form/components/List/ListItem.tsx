import type { Component, DefineComponent, VNode, VNodeChild } from 'vue'
import type { FormListActionWithCurrentRow, IconConfig, ProFormListItemProps, ProFormListItemProviderProps } from './typing'
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@antdv-next/icons'
import { Space, Tooltip } from 'antdv-next'
import { cloneVNode, Comment, computed, defineComponent, Fragment, h, isVNode, Text } from 'vue'
import { useEditOrReadOnly } from '../../BaseForm/EditOrReadOnlyContext'
import { provideFieldContext, useFieldContext } from '../../FieldContext'
import { provideFormListContext } from './FormListContext'

export type ChildrenItemFunction = (
  field: { name: number, key: number },
  index: number,
  action: FormListActionWithCurrentRow,
  count: number,
) => VNodeChild

function normalizeChildren(children?: VNodeChild): VNode[] {
  if (!Array.isArray(children))
    return isVNode(children) ? [children] : []

  return children.flatMap((node) => {
    if (!isVNode(node) || node.type === Comment)
      return []
    if (node.type === Text && typeof node.children === 'string' && !node.children.trim())
      return []
    if (node.type === Fragment)
      return normalizeChildren(node.children as VNodeChild)
    return [node]
  })
}

function renderIcon(iconProps: IconConfig | false | undefined, fallback: Component, className: string) {
  if (iconProps === false)
    return undefined
  const Icon = iconProps?.Icon || fallback
  return h(Icon, { class: className })
}

function renderActionIcon(options: {
  iconProps?: IconConfig | false
  fallbackIcon: Component
  tooltipText: string
  className: string
  hidden?: boolean
  onClick: () => void | Promise<void>
}) {
  if (options.iconProps === false || options.hidden)
    return null
  const tooltipText = options.iconProps?.tooltipText ?? options.tooltipText
  const icon = renderIcon(options.iconProps, options.fallbackIcon, `ant-pro-form-list-action-icon ${options.className}`)
  const node = <span onClick={options.onClick as any}>{icon}</span>
  return tooltipText ? <Tooltip title={tooltipText}>{node}</Tooltip> : node
}

const listItemProviderPropNames = [
  'model',
  'listName',
  'name',
] as const

const ListItemProvider = defineComponent({
  name: 'ProFormListItemProvider',
  props: [...listItemProviderPropNames],
  setup(rawProps, { slots }) {
    const props = rawProps as unknown as ProFormListItemProviderProps
    const parentContext = useFieldContext()
    provideFieldContext({
      ...parentContext,
      get model() {
        return props.model
      },
    })
    provideFormListContext({
      get listName() {
        return props.listName
      },
      get name() {
        return props.name
      },
      get key() {
        return props.name
      },
    })

    return () => slots.default?.()
  },
}) as unknown as DefineComponent<ProFormListItemProviderProps>

const proFormListItemPropNames = [
  'field',
  'index',
  'record',
  'fields',
  'count',
  'name',
  'originName',
  'listName',
  'action',
  'readonly',
  'copyIconProps',
  'deleteIconProps',
  'upIconProps',
  'downIconProps',
  'arrowSort',
  'actionRender',
  'itemRender',
  'itemContainerRender',
  'alwaysShowItemLabel',
  'min',
  'max',
  'containerClassName',
  'containerStyle',
] as const

function normalizeBooleanProp(value: unknown, defaultValue = false) {
  if (value === '')
    return true
  return typeof value === 'boolean' ? value : defaultValue
}

const ProFormListItem = defineComponent({
  name: 'ProFormListItem',
  props: [...proFormListItemPropNames],
  setup(rawProps, { slots }) {
    const props = rawProps as unknown as ProFormListItemProps
    const editContext = useEditOrReadOnly()
    const isReadMode = computed(() => normalizeBooleanProp(props.readonly) || editContext.readonly || editContext.mode === 'read')
    const arrowSort = computed(() => normalizeBooleanProp(props.arrowSort))

    function currentAction(): FormListActionWithCurrentRow {
      return {
        ...props.action,
        getCurrentRowData: () => props.record,
        setCurrentRowData: (data) => {
          Object.assign(props.record, data || {})
        },
      }
    }

    function renderChildren() {
      const field = props.field
      const children = slots.default?.({
        field,
        index: props.index,
        action: currentAction(),
        count: props.count,
      })
      return normalizeChildren(children).map((node, childIndex) => cloneVNode(node, { key: node.key ?? childIndex }))
    }

    return () => {
      const field = props.field
      const rowMeta = {
        name: props.originName,
        field,
        fields: props.fields,
        index: props.index,
        operation: props.action,
        record: props.record,
        meta: { errors: [] },
      }
      const defaultActionDom = [
        renderActionIcon({
          iconProps: props.copyIconProps,
          fallbackIcon: CopyOutlined,
          tooltipText: '复制此项',
          className: 'action-copy',
          hidden: isReadMode.value || (props.max !== undefined && props.count >= props.max),
          onClick: () => props.action.add(props.record, props.count),
        }),
        renderActionIcon({
          iconProps: props.deleteIconProps,
          fallbackIcon: DeleteOutlined,
          tooltipText: '删除此项',
          className: 'action-remove',
          hidden: isReadMode.value || (props.min !== undefined && props.count <= props.min),
          onClick: () => props.action.remove(field.name),
        }),
        renderActionIcon({
          iconProps: props.upIconProps,
          fallbackIcon: ArrowUpOutlined,
          tooltipText: '向上排序',
          className: 'action-up',
          hidden: isReadMode.value || !arrowSort.value || props.index <= 0,
          onClick: () => props.action.move(props.index, props.index - 1),
        }),
        renderActionIcon({
          iconProps: props.downIconProps,
          fallbackIcon: ArrowDownOutlined,
          tooltipText: '向下排序',
          className: 'action-down',
          hidden: isReadMode.value || !arrowSort.value || props.index + 1 >= props.count,
          onClick: () => props.action.move(props.index, props.index + 1),
        }),
      ].filter(Boolean) as VNodeChild[]
      const actions = props.actionRender?.(field, props.action, defaultActionDom, props.count) ?? defaultActionDom
      const actionDom = actions.length && !isReadMode.value
        ? <div class="ant-pro-form-list-action"><Space size={8}>{actions}</Space></div>
        : null

      const children = (
        <ListItemProvider model={props.record} listName={props.listName} name={props.index}>
          {renderChildren()}
        </ListItemProvider>
      )
      const itemContainer = props.itemContainerRender?.(children, rowMeta) ?? children
      const listDom = (
        <div class={['ant-pro-form-list-container', props.containerClassName]} style={props.containerStyle}>
          {itemContainer}
        </div>
      )
      const content = props.itemRender?.({ listDom, action: actionDom }, rowMeta) ?? (
        <div class={['ant-pro-form-list-item', { 'ant-pro-form-list-item-show-label': normalizeBooleanProp(props.alwaysShowItemLabel) }]}>
          {listDom}
          {actionDom}
        </div>
      )

      return (
        <ListItemProvider model={props.record} listName={props.listName} name={props.index}>
          {content}
        </ListItemProvider>
      )
    }
  },
}) as unknown as DefineComponent<ProFormListItemProps>

export { ProFormListItem }
