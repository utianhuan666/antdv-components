import type { SpaceProps } from 'antdv-next'
import type { VNode, VNodeChild } from 'vue'
import type { ProFormFieldItemProps } from '../../typing'
import { cloneVNode, defineComponent } from 'vue'
import {
  getValueFromEvent,
  isElementVNode,
  renderChildren,
  renderFormItem,
  renderSpace,
  toVNodeArray,
} from '../_util'

export type ProFormFieldSetProps<T = any> = ProFormFieldItemProps & {
  value?: T[]
  onChange?: (value: T[]) => void
  space?: SpaceProps
  type?: 'space' | 'group'
  children?: ((value: T[], props: ProFormFieldSetProps<T>) => VNodeChild) | VNodeChild
}

const ProFormFieldSet = defineComponent({
  name: 'ProFormFieldSet',
  inheritAttrs: false,
  setup(props: ProFormFieldSetProps, { attrs, slots }) {
    return () => {
      const current = { ...attrs, ...props } as ProFormFieldSetProps
      const value = current.value || []
      const rawChildren = slots.default?.() || renderChildren(current.children, value, current)
      let itemIndex = -1
      const children = toVNodeArray(rawChildren).map((item: any) => {
        if (!isElementVNode(item))
          return item

        itemIndex += 1
        const index = itemIndex
        return cloneVNode(item as VNode, {
          key: index,
          value: value[index],
          fieldProps: {
            ...((item as VNode).props as any)?.fieldProps,
            value: value[index],
            onChange: (...args: any[]) => {
              const next = [...value]
              next[index] = getValueFromEvent(current.valuePropName || 'value', ...args)
              current.onChange?.(next)
              current.fieldProps?.onChange?.(next)
            },
          },
          onChange: (...args: any[]) => {
            const next = [...value]
            next[index] = getValueFromEvent(current.valuePropName || 'value', ...args)
            current.onChange?.(next)
            current.fieldProps?.onChange?.(next)
            ;((item as VNode).props as any)?.onChange?.(...args)
          },
        })
      })
      return renderFormItem(
        current,
        renderSpace(children, current.space, current.type === 'group'),
      )
    }
  },
}) as any

ProFormFieldSet.displayName = 'ProFormComponent'

export default ProFormFieldSet
