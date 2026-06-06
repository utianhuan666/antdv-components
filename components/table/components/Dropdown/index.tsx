import type { CSSProperties, VNodeChild } from 'vue'
import { DownOutlined, EllipsisOutlined } from '@antdv-next/icons'
import { Button, Dropdown } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

export interface MenuItems {
  key: string
  name?: VNodeChild
  disabled?: boolean
}

export interface TableDropdownProps {
  className?: string
  style?: CSSProperties
  menus?: MenuItems[]
  onSelect?: (key: string) => void
}

function buildMenu(menus: MenuItems[] | undefined, onSelect?: (key: string) => void) {
  return {
    items: (menus || []).map(item => ({
      key: item.key,
      label: item.name ?? item.key,
      disabled: item.disabled,
    })),
    onClick: ({ key }: { key: string }) => {
      const menu = menus?.find(item => item.key === key)
      if (!menu?.disabled)
        onSelect?.(key)
    },
  }
}

function getMenuKey(info: any) {
  return info?.key ?? info?.item?.key
}

const DropdownButton = defineComponent({
  name: 'TableDropdownButton',
  props: ['menus', 'onSelect', 'className', 'style'],
  setup(props, { slots }) {
    const open = ref(false)
    const prefixCls = useProPrefixCls('pro-table-dropdown')
    const triggerProps = {
      onMouseenter: () => open.value = true,
      onMouseover: () => open.value = true,
      onClick: () => open.value = true,
    } as any
    const menu = () => buildMenu(props.menus, (key) => {
      props.onSelect?.(key)
      open.value = false
    })

    return () => (
      <Dropdown
        class={[prefixCls.value, props.className]}
        menu={menu()}
        open={open.value}
        onOpenChange={(next: boolean) => open.value = next}
        onMenuClick={(info: any) => {
          const key = getMenuKey(info)
          if (key !== undefined)
            menu().onClick({ key })
        }}
      >
        <Button
          style={props.style}
          {...triggerProps}
        >
          {slots.default?.()}
          <DownOutlined />
        </Button>
      </Dropdown>
    )
  },
})

const TableDropdownImpl = defineComponent({
  name: 'TableDropdown',
  props: ['menus', 'onSelect', 'className', 'style'],
  setup(props, { slots }) {
    const open = ref(false)
    const prefixCls = useProPrefixCls('pro-table-dropdown')
    const menu = () => buildMenu(props.menus, (key) => {
      props.onSelect?.(key)
      open.value = false
    })

    return () => (
      <Dropdown
        class={[prefixCls.value, props.className]}
        menu={menu()}
        open={open.value}
        onOpenChange={(next: boolean) => open.value = next}
        onMenuClick={(info: any) => {
          const key = getMenuKey(info)
          if (key !== undefined)
            menu().onClick({ key })
        }}
      >
        <span
          style={props.style}
          onMouseenter={() => open.value = true}
          onMouseover={() => open.value = true}
          onClick={() => open.value = true}
        >
          {slots.default?.() || <EllipsisOutlined />}
        </span>
      </Dropdown>
    )
  },
})

const TableDropdown = TableDropdownImpl as typeof TableDropdownImpl & {
  Button: typeof DropdownButton
}

TableDropdown.Button = DropdownButton

export default TableDropdown
