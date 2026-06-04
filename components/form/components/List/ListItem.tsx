import type { PropType, VNode, VNodeChild } from 'vue'
import type { NamePath } from '../../typing'
import type { FormListActionType, FormListActionGuard, IconConfig, ProFormListCommonProps } from './typing'
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@antdv-next/icons'
import { Space, Tooltip } from 'antdv-next'
import { cloneVNode, Comment, computed, defineComponent, Fragment, h, isVNode, Text } from 'vue'
import { useEditOrReadOnly } from '../../BaseForm/EditOrReadOnlyContext'
import { provideFieldContext, useFieldContext } from '../../FieldContext'
import { provideFormListContext, useFormListContext } from './FormListContext'

export type ChildrenItemFunction = (
  field: { name: number, key: number },
  index: number,
  action: FormListActionType & {
    getCurrentRowData: () => any
    setCurrentRowData: (data: Record<string, any>) => void
  },
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

function renderIcon(iconProps: IconConfig | false | undefined, fallback: any, className: string) {
  if (iconProps === false)
    return undefined
  const Icon = iconProps?.Icon || fallback
  return h(Icon, { class: className })
}

function renderActionIcon(options: {
  iconProps?: IconConfig | false
  fallbackIcon: any
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

const ListItemProvider = defineComponent({
  name: 'ProFormListItemProvider',
  props: {
    model: { type: [Object, Array] as PropType<Record<string, any>>, required: true },
    listName: { type: Array as PropType<(string | number)[]>, required: true },
    name: { type: Number, required: true },
  },
  setup(props, { slots }) {
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
})

const ProFormListItem = defineComponent({
  name: 'ProFormListItem',
  props: {
    field: { type: Object as PropType<{ name: number, key: number }>, required: true },
    index: { type: Number, required: true },
    record: { type: [Object, Array] as PropType<Record<string, any>>, required: true },
    fields: { type: Array as PropType<{ name: number, key: number }[]>, required: true },
    count: { type: Number, required: true },
    name: { type: [String, Number, Array] as PropType<NamePath>, required: true },
    originName: { type: [String, Number, Array] as PropType<NamePath>, required: true },
    listName: { type: Array as PropType<(string | number)[]>, required: true },
    action: { type: Object as PropType<FormListActionType>, required: true },
    readonly: { type: Boolean, default: false },
    copyIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: undefined },
    deleteIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: undefined },
    upIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: undefined },
    downIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: undefined },
    arrowSort: { type: Boolean, default: false },
    actionRender: { type: Function as PropType<ProFormListCommonProps['actionRender']>, default: undefined },
    itemRender: { type: Function as PropType<ProFormListCommonProps['itemRender']>, default: undefined },
    itemContainerRender: { type: Function as PropType<ProFormListCommonProps['itemContainerRender']>, default: undefined },
    alwaysShowItemLabel: { type: Boolean, default: false },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    containerClassName: { type: String, default: undefined },
    containerStyle: { type: Object as PropType<Record<string, any>>, default: undefined },
  },
  setup(props, { slots }) {
    const editContext = useEditOrReadOnly()
    const parentListContext = useFormListContext()
    const isReadMode = computed(() => props.readonly || editContext.readonly || editContext.mode === 'read')

    function currentAction() {
      return {
        ...props.action,
        getCurrentRowData: () => props.record,
        setCurrentRowData: (data: Record<string, any>) => {
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
      const action = currentAction()
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
          hidden: isReadMode.value || !props.arrowSort || props.index <= 0,
          onClick: () => props.action.move(props.index, props.index - 1),
        }),
        renderActionIcon({
          iconProps: props.downIconProps,
          fallbackIcon: ArrowDownOutlined,
          tooltipText: '向下排序',
          className: 'action-down',
          hidden: isReadMode.value || !props.arrowSort || props.index + 1 >= props.count,
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
        <div class={['ant-pro-form-list-item', { 'ant-pro-form-list-item-show-label': props.alwaysShowItemLabel }]}>
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
})

export { ProFormListItem }
