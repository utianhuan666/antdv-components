import type { MenuProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import { DownOutlined, EllipsisOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Button, Dropdown } from 'antdv-next'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

export interface MenuItems {
  name: VNodeChild
  key: string
  disabled?: boolean
}

export interface DropdownProps {
  className?: string
  style?: CSSProperties
  menus?: MenuItems[]
  onSelect?: (key: string) => void
  children?: VNodeChild
}

type MenuItemType = NonNullable<NonNullable<DropdownProps['menus']>>

/** 将 menus 转换为 antd Menu items 格式 */
function buildMenuItems(menus: MenuItemType = []): NonNullable<NonNullable<MenuProps['items']>> {
  return menus.map(({ key, name, disabled }) => ({
    key,
    label: name,
    disabled,
  })) as NonNullable<NonNullable<MenuProps['items']>>
}

/**
 * 一个简单的下拉菜单
 */
const DropdownButton = defineComponent<DropdownProps>({
  name: 'TableDropdownButton',
  props: ['className', 'style', 'menus', 'onSelect'],
  setup(rawProps, { slots }) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-table-dropdown')

    return () => (
      <Dropdown
        menu={{
          onClick: ({ key }: { key: string | number }) => props.onSelect?.(key as string),
          items: buildMenuItems(props.menus),
        }}
        class={clsx(prefixCls.value, props.className)}
      >
        <Button style={props.style}>
          {slots.default?.()}
          {' '}
          <DownOutlined />
        </Button>
      </Dropdown>
    )
  },
})

const TableDropdown = defineComponent<DropdownProps>({
  name: 'TableDropdown',
  props: ['className', 'style', 'menus', 'onSelect'],
  setup(rawProps, { slots }) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-table-dropdown')

    return () => (
      <Dropdown
        menu={{
          onClick: ({ key }: { key: string | number }) => props.onSelect?.(key as string),
          items: buildMenuItems(props.menus),
        }}
        class={clsx(prefixCls.value, props.className)}
      >
        <span style={props.style}>{slots.default?.() || <EllipsisOutlined />}</span>
      </Dropdown>
    )
  },
}) as ReturnType<typeof defineComponent> & {
  Button: typeof DropdownButton
}

TableDropdown.Button = DropdownButton

export default TableDropdown
