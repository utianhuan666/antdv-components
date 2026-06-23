import type { InjectionKey, Ref } from 'vue'
import type { NamePath } from '../../../utils'
import { Button, Space } from 'antdv-next'
import { defineComponent, inject, provide, ref } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import ProFormItem from '../FormItem'
import { useStyle } from './style'

export interface FormListContextValue {
  name?: NamePath
  listName?: NamePath
}

export const FormListContext: InjectionKey<FormListContextValue> = Symbol('FormListContext')
export const useFormListContext = () => inject(FormListContext, {})

export interface FormListActionType {
  add: (defaultValue?: any) => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
}

export interface ProFormListProps {
  name?: NamePath
  actionRef?: Ref<FormListActionType | undefined>
}

export const ProFormList = defineComponent({
  name: 'ProFormList',
  inheritAttrs: false,
  props: ['name', 'label', 'actionRef', 'creatorButtonProps'],
  setup(props, { slots }) {
    const prefixCls = useProPrefixCls('pro-form-list')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const items = ref<any[]>([{}])
    const action: FormListActionType = {
      add: (defaultValue = {}) => items.value.push(defaultValue),
      remove: (index: number) => items.value.splice(index, 1),
      move: (from: number, to: number) => {
        const [item] = items.value.splice(from, 1)
        items.value.splice(to, 0, item)
      },
    }
    if (props.actionRef)
      props.actionRef.value = action
    provide(FormListContext, { name: props.name, listName: props.name })
    return () => wrapSSR(
      <ProFormItem class={[prefixCls.value, hashId]} name={props.name as any} label={props.label as any} valueType="formList">
        <Space direction="vertical">
          {items.value.map((item, index) => slots.default?.({ index, record: item, action, field: { name: index, key: index } }))}
          {props.creatorButtonProps === false ? null : <Button class={`${prefixCls.value}-creator-button-bottom`} onClick={() => action.add()}>{props.creatorButtonProps?.creatorButtonText ?? '新增一行'}</Button>}
        </Space>
      </ProFormItem>,
    )
  },
})

export default ProFormList
