import type { VNodeChild } from 'vue'
import { ColumnHeightOutlined } from '@antdv-next/icons'
import { Tooltip } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useTableContext } from '../../Store/Provide'

export type DensitySize = 'middle' | 'small' | 'large' | undefined

export default defineComponent({
  name: 'DensityIcon',
  props: ['icon'],
  setup(props) {
    const counter = useTableContext()
    const intl = useIntl()
    const open = ref(false)
    const items: { key: Exclude<DensitySize, undefined>, label: string }[] = [
      { key: 'large', label: intl.getMessage('tableToolBar.densityLarger', '宽松') },
      { key: 'middle', label: intl.getMessage('tableToolBar.densityMiddle', '中等') },
      { key: 'small', label: intl.getMessage('tableToolBar.densitySmall', '紧凑') },
    ]

    return () => {
      const icon = (props.icon as VNodeChild) || <ColumnHeightOutlined />
      return (
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <Tooltip title={intl.getMessage('tableToolBar.density', '表格密度')}>
            <span
              onClick={() => open.value = true}
              onMouseenter={() => open.value = true}
              onMouseover={() => open.value = true}
            >
              {icon}
            </span>
          </Tooltip>
          <ul
            class="ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical"
            style={{
              width: '80px',
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 1050,
              display: open.value ? undefined : 'none',
            }}
          >
            {items.map(item => (
              <li
                key={item.key}
                class={[
                  'ant-dropdown-menu-item',
                  counter?.tableSize.value === item.key ? 'ant-dropdown-menu-item-selected' : undefined,
                ]}
                role="menuitem"
                onClick={() => {
                  counter?.setTableSize(item.key)
                  open.value = false
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </span>
      )
    }
  },
})
