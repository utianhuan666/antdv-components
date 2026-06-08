import type { VNodeChild } from 'vue'
import type { Key } from '../../typing'
import { DownOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Dropdown, Space, Tabs } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { useProProviderContext } from '../../../provider'
import { useRefFunction } from '../../../utils'

export interface ListToolBarMenuItem {
  key: Key
  label: VNodeChild
  disabled?: boolean
}

export interface ListToolBarHeaderMenuProps {
  type?: 'inline' | 'dropdown' | 'tab'
  activeKey?: Key
  defaultActiveKey?: Key
  items?: ListToolBarMenuItem[]
  onChange?: (activeKey?: Key) => void
  prefixCls?: string
  hashId?: string
}

const HeaderMenu = defineComponent<ListToolBarHeaderMenuProps>({
  name: 'ListToolBarHeaderMenu',
  props: ['type', 'activeKey', 'defaultActiveKey', 'items', 'onChange', 'prefixCls', 'hashId'],
  setup(rawProps) {
    const props = rawProps
    const proProvider = useProProviderContext()

    const activeKeyInner = ref<Key | undefined>(
      props.activeKey ?? props.defaultActiveKey,
    )
    const activeKey = computed<Key | undefined>(() =>
      props.activeKey !== undefined ? props.activeKey : activeKeyInner.value,
    )

    const setActiveKey = useRefFunction((next: Key) => {
      const prev = activeKey.value
      ;(
        props.onChange as
          | ((key?: Key, prev?: Key) => void)
          | undefined
      )?.(next, prev)
      activeKeyInner.value = next
    })

    return () => {
      const hashId = props.hashId ?? proProvider.hashId
      const { items = [], type = 'inline', prefixCls } = props

      if (items.length < 1)
        return null

      const activeItem
        = items.find((item) => {
          return item.key === activeKey.value
        }) || items[0]

      if (type === 'inline') {
        return (
          <div
            class={clsx(
              `${prefixCls}-menu`,
              `${prefixCls}-inline-menu`,
              hashId,
            )}
          >
            {items.map((item, index) => (
              <div
                key={item.key || index}
                onClick={() => {
                  setActiveKey(item.key)
                }}
                class={clsx(
                  `${prefixCls}-inline-menu-item`,
                  activeItem.key === item.key
                    ? `${prefixCls}-inline-menu-item-active`
                    : undefined,
                  hashId,
                )}
              >
                {item.label}
              </div>
            ))}
          </div>
        )
      }

      if (type === 'tab') {
        return (
          <Tabs
            items={items.map(item => ({
              ...item,
              key: item.key?.toString(),
            })) as any}
            activeKey={activeItem.key as string}
            onTabClick={(key: string) => setActiveKey(key)}
          />
        )
      }

      return (
        <div
          class={clsx(`${prefixCls}-menu`, `${prefixCls}-dropdownmenu`, hashId)}
        >
          <Dropdown
            trigger={['click']}
            menu={{
              selectedKeys: [activeItem.key as string],
              onClick: (item: { key: string | number }) => {
                setActiveKey(item.key)
              },
              items: items.map((item, index) => ({
                key: item.key || index,
                disabled: item.disabled,
                label: item.label,
              })) as any,
            }}
          >
            <Space class={clsx(`${prefixCls}-dropdownmenu-label`, hashId)}>
              {activeItem.label}
              <DownOutlined />
            </Space>
          </Dropdown>
        </div>
      )
    }
  },
})

export default HeaderMenu
