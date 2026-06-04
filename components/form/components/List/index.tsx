import type { PropType } from 'vue'
import type { NamePath } from '../../typing'
import type { FormListActionGuard, FormListActionType, IconConfig, ProFormListCommonProps } from './typing'
import { computed, defineComponent, onMounted, watchEffect } from 'vue'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'
import { useFormListContext } from './FormListContext'
import { ProFormListContainer } from './ListContainer'

export type { FormListActionGuard, FormListActionType, IconConfig, ProFormListCommonProps } from './typing'

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

function normalizeNamePath(name: NamePath): (string | number)[] {
  return Array.isArray(name) ? name : [name]
}

function getValueByNamePath(model: any, name: NamePath) {
  const path = normalizeNamePath(name)
  if (!path.length)
    return model
  return path.reduce<any>((current, key) => current?.[key], model)
}

function setValueByNamePath(model: any, name: NamePath, value: any) {
  const path = normalizeNamePath(name)
  if (!path.length) {
    if (Array.isArray(model)) {
      model.splice(0, model.length, ...(Array.isArray(value) ? value : []))
      return
    }
    if (model && typeof model === 'object') {
      Object.keys(model).forEach(key => delete model[key])
      Object.assign(model, value || {})
    }
    return
  }

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

const ProFormList = defineComponent({
  name: 'ProFormList',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, required: true },
    label: { type: [String, Number, Object] as PropType<any>, default: undefined },
    tooltip: { type: [String, Number, Object] as PropType<any>, default: undefined },
    initialValue: { type: Array as PropType<Record<string, any>[]>, default: undefined },
    creatorRecord: { type: [Object, Function] as PropType<Record<string, any> | (() => Record<string, any>)>, default: undefined },
    creatorButtonProps: { type: [Object, Boolean] as PropType<ProFormListCommonProps['creatorButtonProps']>, default: () => ({}) },
    copyIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: () => ({}) },
    deleteIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: () => ({}) },
    upIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: () => ({}) },
    downIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: () => ({}) },
    actionGuard: { type: Object as PropType<FormListActionGuard>, default: undefined },
    actionRef: { type: Object as PropType<{ value?: FormListActionType }>, default: undefined },
    actionRender: { type: Function as PropType<ProFormListCommonProps['actionRender']>, default: undefined },
    itemRender: { type: Function as PropType<ProFormListCommonProps['itemRender']>, default: undefined },
    itemContainerRender: { type: Function as PropType<ProFormListCommonProps['itemContainerRender']>, default: undefined },
    fieldExtraRender: { type: Function as PropType<ProFormListCommonProps['fieldExtraRender']>, default: undefined },
    creatorButtonText: { type: String, default: undefined },
    alwaysShowItemLabel: { type: Boolean, default: false },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    arrowSort: { type: Boolean, default: false },
    rules: { type: Array as PropType<any[]>, default: undefined },
    required: { type: Boolean, default: undefined },
    readonly: { type: Boolean, default: false },
    isValidateList: { type: Boolean, default: false },
    emptyListMessage: { type: String, default: '列表不能为空' },
    colProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    rowProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    containerClassName: { type: String, default: undefined },
    containerStyle: { type: Object as PropType<Record<string, any>>, default: undefined },
    onAfterAdd: { type: Function as PropType<(defaultValue: any, insertIndex: number, count: number) => void>, default: undefined },
    onAfterRemove: { type: Function as PropType<(index: number, count: number) => void>, default: undefined },
  },
  setup(props, { slots }) {
    const fieldContext = useFieldContext()
    const parentListContext = useFormListContext()

    const currentName = computed(() => {
      if (parentListContext.name === undefined)
        return normalizeNamePath(props.name)
      return [parentListContext.name, ...normalizeNamePath(props.name)]
    })

    function getRowFieldPath(index: number): (string | number)[] {
      const parentListName = parentListContext.listName || []
      return [...parentListName, ...normalizeNamePath(props.name), index]
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
      const nextRecord = cloneValue(defaultValue ?? getCreatorRecord())
      const canAdd = await props.actionGuard?.beforeAddRow?.(nextRecord, index, list.length)
      if (canAdd === false)
        return
      const next = [...list]
      next.splice(index, 0, nextRecord)
      setList(next)
      props.onAfterAdd?.(nextRecord, index, next.length)
    }

    async function remove(index: number) {
      const list = getList()
      if (props.min !== undefined && list.length <= props.min)
        return
      const canRemove = await props.actionGuard?.beforeRemoveRow?.(index, list.length)
      if (canRemove === false)
        return
      setList(list.filter((_, listIndex) => listIndex !== index))
      props.onAfterRemove?.(index, list.length - 1)
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

    onMounted(applyInitialValue)
    watchEffect(() => {
      if (props.actionRef)
        props.actionRef.value = action
    })

    const finalRules = computed(() => {
      const rules = [...(props.rules || [])]
      if (props.isValidateList || rules.some(rule => rule?.required)) {
        rules.unshift({
          required: true,
          validator: async (_rule: any, value: any) => {
            if (!value || value.length === 0)
              throw new Error(props.emptyListMessage)
          },
        })
      }
      return rules
    })

    return () => {
      const list = getList()
      const fields = list.map((record, index) => ({ name: index, key: index, record }))
      return (
        <div class="ant-pro-form-list">
          <ProFormItem
            name={props.name}
            label={props.label}
            tooltip={props.tooltip}
            rules={finalRules.value}
            required={props.required || props.rules?.some(rule => rule?.required)}
            colProps={props.colProps}
            formItemProps={{ style: { marginBottom: 16 } }}
          >
            <ProFormListContainer
              name={currentName.value as any}
              originName={props.name as any}
              listName={getRowFieldPath}
              fields={fields}
              action={action}
              readonly={props.readonly}
              creatorRecord={props.creatorRecord}
              creatorButtonProps={props.creatorButtonProps}
              creatorButtonText={props.creatorButtonText}
              copyIconProps={props.copyIconProps}
              deleteIconProps={props.deleteIconProps}
              upIconProps={props.upIconProps}
              downIconProps={props.downIconProps}
              actionGuard={props.actionGuard}
              actionRender={props.actionRender}
              itemRender={props.itemRender}
              itemContainerRender={props.itemContainerRender}
              fieldExtraRender={props.fieldExtraRender}
              alwaysShowItemLabel={props.alwaysShowItemLabel}
              min={props.min}
              max={props.max}
              arrowSort={props.arrowSort}
              containerClassName={props.containerClassName}
              containerStyle={props.containerStyle}
            >
              {{
                default: (slotProps: Record<string, any>) => slots.default?.(slotProps),
              }}
            </ProFormListContainer>
          </ProFormItem>
        </div>
      )
    }
  },
})

export default ProFormList
