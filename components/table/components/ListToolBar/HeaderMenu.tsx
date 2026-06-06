import type { VNodeChild } from 'vue'
import { DownOutlined } from '@antdv-next/icons'
import { Tabs } from 'antdv-next'
import { computed, defineComponent, ref, watch } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

export interface ListToolBarMenuItem {
  key: string | number | symbol
  label?: VNodeChild
  tab?: VNodeChild
  disabled?: boolean
}

export interface ListToolBarHeaderMenuProps {
  type?: 'inline' | 'dropdown' | 'tab'
  activeKey?: string | number | symbol
  defaultActiveKey?: string | number | symbol
  items?: ListToolBarMenuItem[]
  onChange?: (activeKey?: string | number | symbol, oldKey?: string | number | symbol) => void
  prefixCls?: string
  hashId?: string
}

export default defineComponent({
  name: 'HeaderMenu',
  props: ['type', 'items', 'activeKey', 'defaultActiveKey', 'onChange', 'prefixCls', 'hashId'],
  setup(props) {
    const innerActiveKey = ref<string | number | symbol | undefined>(props.activeKey ?? props.defaultActiveKey)

    watch(() => props.activeKey, (key) => {
      if (key !== undefined)
        innerActiveKey.value = key
    })

    const prefixCls = useProPrefixCls('pro-table-list-toolbar', computed(() => props.prefixCls))
    const activeKey = computed(() => props.activeKey ?? innerActiveKey.value)

    function getLabel(item: ListToolBarMenuItem) {
      return item.label ?? item.tab
    }

    function setActiveKey(next?: string | number | symbol) {
      const list = (props.items || []) as ListToolBarMenuItem[]
      const item = list.find(item => item.key === next)
      if (item?.disabled)
        return
      const prev = activeKey.value
      props.onChange?.(next, prev)
      if (props.activeKey === undefined)
        innerActiveKey.value = next
    }

    return () => {
      const items = ((props.items || []) as ListToolBarMenuItem[]).filter(Boolean)
      if (items.length < 1)
        return null

      const current = items.find(item => item.key === activeKey.value) || items[0]!
      const type = props.type || 'inline'

      if (type === 'tab') {
        return (
          <Tabs
            class={[`${prefixCls.value}-menu`, `${prefixCls.value}-tabs`, props.hashId]}
            activeKey={String(current.key)}
            items={items.map((item, index) => ({
              ...item,
              label: getLabel(item),
              key: item.key?.toString() || index.toString(),
            }))}
            onChange={(key: string) => setActiveKey(key)}
          />
        )
      }

      if (type === 'dropdown') {
        return (
          <div class={[`${prefixCls.value}-menu`, `${prefixCls.value}-dropdownmenu`, props.hashId]}>
            <div
              class={[`${prefixCls.value}-dropdownmenu-label`, props.hashId]}
            >
              {getLabel(current)}
              <DownOutlined />
            </div>
            <div class="ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical">
              {items.filter(item => item.key !== current.key).map((item, index) => (
                <div
                  key={item.key || index}
                  class={[
                    'ant-dropdown-menu-item',
                    item.disabled ? 'ant-dropdown-menu-item-disabled' : undefined,
                  ]}
                  onClick={() => setActiveKey(item.key)}
                >
                  {getLabel(item)}
                </div>
              ))}
            </div>
          </div>
        )
      }

      return (
        <div class={[`${prefixCls.value}-menu`, `${prefixCls.value}-inline-menu`, props.hashId]}>
          {items.map((item, index) => (
            <div
              key={item.key || index}
              class={[
                `${prefixCls.value}-inline-menu-item`,
                current.key === item.key ? `${prefixCls.value}-inline-menu-item-active` : undefined,
                item.disabled ? `${prefixCls.value}-inline-menu-item-disabled` : undefined,
                props.hashId,
              ]}
              onClick={() => setActiveKey(item.key)}
            >
              {getLabel(item)}
            </div>
          ))}
        </div>
      )
    }
  },
})
