import type { PropType, VNode, VNodeChild } from 'vue'
import type { NamePath } from '../../typing'
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined, PlusOutlined } from '@antdv-next/icons'
import { Button, Space, Tooltip } from 'antdv-next'
import { cloneVNode, Comment, defineComponent, Fragment, h, isVNode, onMounted, Text } from 'vue'
import { provideFieldContext, useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'
import { provideFormListContext, useFormListContext } from './FormListContext'

export interface FormListActionType<T = Record<string, any>> {
  add: (defaultValue?: Partial<T>, insertIndex?: number) => Promise<void>
  remove: (index: number) => Promise<void>
  move: (from: number, to: number) => void
  get: (index: number) => T | undefined
  getList: () => T[]
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value))
    return value.map(item => cloneValue(item)) as T
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.keys(value).reduce<Record<string, any>>((result, key) => {
      result[key] = cloneValue((value as Record<string, any>)[key])
      return result
    }, {}) as T
  }
  return value
}

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

function getValueByNamePath(model: Record<string, any>, name: NamePath) {
  const path = Array.isArray(name) ? name : [name]
  return path.reduce<any>((current, key) => current?.[key], model)
}

function setValueByNamePath(model: Record<string, any>, name: NamePath, value: any) {
  const path = Array.isArray(name) ? name : [name]
  const last = path[path.length - 1]
  if (last === undefined)
    return
  const parent = path.slice(0, -1).reduce<Record<string, any>>((current, key) => {
    if (!current[key] || typeof current[key] !== 'object')
      current[key] = {}
    return current[key]
  }, model)
  parent[last] = value
}

const ListItemProvider = defineComponent({
  name: 'ProFormListItemProvider',
  props: {
    model: { type: Object as PropType<Record<string, any>>, required: true },
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

const ProFormList = defineComponent({
  name: 'ProFormList',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, required: true },
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    initialValue: { type: Array as PropType<Record<string, any>[]>, default: undefined },
    creatorRecord: { type: [Object, Function] as PropType<Record<string, any> | (() => Record<string, any>)>, default: undefined },
    creatorButtonProps: { type: [Object, Boolean] as PropType<Record<string, any> | false>, default: () => ({}) },
    copyIconProps: { type: [Object, Boolean] as PropType<Record<string, any> | false>, default: () => ({}) },
    deleteIconProps: { type: [Object, Boolean] as PropType<Record<string, any> | false>, default: () => ({}) },
    upIconProps: { type: [Object, Boolean] as PropType<Record<string, any> | false>, default: () => ({}) },
    downIconProps: { type: [Object, Boolean] as PropType<Record<string, any> | false>, default: () => ({}) },
    actionGuard: { type: Object as PropType<Record<string, any>>, default: undefined },
    actionRef: { type: Object as PropType<{ value?: FormListActionType }>, default: undefined },
    actionRender: { type: Function as PropType<(field: any, action: FormListActionType, defaultActionDom: VNodeChild[], count: number) => VNodeChild[]>, default: undefined },
    itemRender: { type: Function as PropType<(doms: { listDom: VNodeChild, action: VNodeChild }, meta: { record: Record<string, any>, index: number }) => VNodeChild>, default: undefined },
    itemContainerRender: { type: Function as PropType<(doms: VNodeChild[]) => VNodeChild>, default: undefined },
    creatorButtonText: { type: String, default: undefined },
    alwaysShowItemLabel: { type: Boolean, default: false },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    arrowSort: { type: Boolean, default: false },
    rules: { type: Array as PropType<any[]>, default: undefined },
  },
  setup(props, { slots }) {
    const fieldContext = useFieldContext()
    const parentListContext = useFormListContext()

    function getRowFieldPath(index: number): (string | number)[] {
      const parentListName = parentListContext.listName || []
      const currentName = Array.isArray(props.name) ? props.name : [props.name]
      return [...parentListName, ...currentName, index] as (string | number)[]
    }

    function getList(): Record<string, any>[] {
      const value = getValueByNamePath(fieldContext.model || {}, props.name)
      return Array.isArray(value) ? value : []
    }

    function setList(value: Record<string, any>[]) {
      setValueByNamePath(fieldContext.model || {}, props.name, value)
    }

    function getCreatorRecord() {
      if (typeof props.creatorRecord === 'function')
        return props.creatorRecord()
      return props.creatorRecord ? cloneValue(props.creatorRecord) : {}
    }

    async function add(defaultValue = getCreatorRecord(), insertIndex?: number) {
      const list = getList()
      if (props.max !== undefined && list.length >= props.max)
        return
      const index = insertIndex ?? list.length
      const canAdd = await props.actionGuard?.beforeAddRow?.(defaultValue, index, list.length)
      if (canAdd === false)
        return
      const next = [...list]
      next.splice(index, 0, cloneValue(defaultValue))
      setList(next)
    }

    async function remove(index: number) {
      const list = getList()
      if (props.min !== undefined && list.length <= props.min)
        return
      const canRemove = await props.actionGuard?.beforeRemoveRow?.(index, list.length)
      if (canRemove === false)
        return
      setList(list.filter((_, listIndex) => listIndex !== index))
    }

    function move(from: number, to: number) {
      const list = [...getList()]
      if (from < 0 || to < 0 || from >= list.length || to >= list.length)
        return
      const [item] = list.splice(from, 1)
      if (!item)
        return
      list.splice(to, 0, item)
      setList(list)
    }

    const action: FormListActionType = {
      add,
      remove,
      move,
      get: index => getList()[index],
      getList,
    }

    function applyInitialValue() {
      if (getList().length > 0 || !props.initialValue)
        return
      setList(cloneValue(props.initialValue))
    }

    onMounted(() => {
      applyInitialValue()
      if (props.actionRef)
        props.actionRef.value = action
    })

    function renderIcon(iconProps: Record<string, any> | false | undefined, fallback: any) {
      if (iconProps === false)
        return undefined
      const Icon = iconProps?.Icon || fallback
      return h(Icon)
    }

    function renderActionButton(options: {
      iconProps?: Record<string, any> | false
      fallbackIcon: any
      tooltipText: string
      disabled?: boolean
      onClick: () => void
    }) {
      if (options.iconProps === false)
        return null
      const button = (
        <Button type="link" size="small" disabled={options.disabled} onClick={options.onClick}>
          {renderIcon(options.iconProps, options.fallbackIcon)}
        </Button>
      )
      const tooltipText = options.iconProps && 'tooltipText' in options.iconProps ? options.iconProps.tooltipText : options.tooltipText
      return tooltipText ? <Tooltip title={tooltipText}>{button}</Tooltip> : button
    }

    function renderItem(record: Record<string, any>, index: number) {
      const count = getList().length
      const rowAction: FormListActionType = {
        ...action,
        get: () => record,
        getList,
      }
      const currentRowAction = {
        ...rowAction,
        getCurrentRowData: () => record,
        setCurrentRowData: (data: Record<string, any>) => {
          Object.assign(record, data)
        },
      }
      const field = { name: index, key: index }
      const defaultActionDom = [
        props.arrowSort
          ? renderActionButton({
              iconProps: props.upIconProps,
              fallbackIcon: ArrowUpOutlined,
              tooltipText: '向上',
              disabled: index === 0,
              onClick: () => move(index, index - 1),
            })
          : null,
        props.arrowSort
          ? renderActionButton({
              iconProps: props.downIconProps,
              fallbackIcon: ArrowDownOutlined,
              tooltipText: '向下',
              disabled: index === count - 1,
              onClick: () => move(index, index + 1),
            })
          : null,
        renderActionButton({
          iconProps: props.copyIconProps,
          fallbackIcon: CopyOutlined,
          tooltipText: '复制',
          disabled: props.max !== undefined && count >= props.max,
          onClick: () => add(cloneValue(record), index + 1),
        }),
        renderActionButton({
          iconProps: props.deleteIconProps,
          fallbackIcon: DeleteOutlined,
          tooltipText: '删除',
          disabled: props.min !== undefined && count <= props.min,
          onClick: () => remove(index),
        }),
      ].filter(Boolean) as VNodeChild[]
      const actionDom = props.actionRender?.(field, action, defaultActionDom, count) ?? defaultActionDom
      const listDom = (
        <ListItemProvider model={record} listName={getRowFieldPath(index)} name={index}>
          {normalizeChildren(slots.default?.({ field, index, action: currentRowAction, count })).map((node, childIndex) => cloneVNode(node, { key: node.key ?? childIndex }))}
        </ListItemProvider>
      )
      const content = props.itemContainerRender ? props.itemContainerRender([listDom]) : listDom
      const actionNode = actionDom.length ? <Space size={4}>{actionDom}</Space> : null
      const rowNode = (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBlockEnd: '8px' }}>
          <div style={{ flex: 1 }}>{content}</div>
          {actionNode}
        </div>
      )
      return props.itemRender?.({ listDom: content, action: actionNode }, { record, index }) ?? rowNode
    }

    function renderCreatorButton(position: 'top' | 'bottom') {
      if (props.creatorButtonProps === false)
        return null
      const creatorButtonProps = props.creatorButtonProps || {}
      const buttonPosition = creatorButtonProps.position || 'bottom'
      if (buttonPosition !== position)
        return null
      const list = getList()
      return (
        <Button
          type={creatorButtonProps.type || 'dashed'}
          block={creatorButtonProps.block ?? true}
          disabled={props.max !== undefined && list.length >= props.max}
          style={creatorButtonProps.style}
          onClick={() => add()}
        >
          {creatorButtonProps.icon === false ? null : creatorButtonProps.icon || <PlusOutlined />}
          {creatorButtonProps.creatorButtonText || props.creatorButtonText || '新建一行'}
        </Button>
      )
    }

    return () => {
      const list = getList()
      return (
        <ProFormItem name={props.name} label={props.label} rules={props.rules} formItemProps={{ style: { marginBottom: 16 } }}>
          {renderCreatorButton('top')}
          <div style={{ marginBlockStart: renderCreatorButton('top') ? '8px' : undefined }}>
            {list.map((record, index) => <Fragment key={index}>{renderItem(record, index)}</Fragment>)}
          </div>
          {renderCreatorButton('bottom')}
        </ProFormItem>
      )
    }
  },
})

export default ProFormList
