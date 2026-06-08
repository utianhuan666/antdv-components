import type { PropType, VNodeChild } from 'vue'
import { ColumnHeightOutlined } from '@antdv-next/icons'
import { Dropdown, Tooltip } from 'antdv-next'
import { defineComponent } from 'vue'
import { useIntl } from '../../../provider'
import { useTableContext } from '../../Store/Provide'

export type DensitySize = 'middle' | 'small' | 'large' | undefined

const DensityIcon = defineComponent({
  name: 'DensityIcon',
  props: {
    icon: { type: [Object, String, Number, Boolean, Array, Function] as PropType<VNodeChild>, default: undefined },
  },
  setup(props) {
    const counter = useTableContext()
    const intl = useIntl()

    return () => {
      const icon = props.icon ?? <ColumnHeightOutlined />
      return (
        <Dropdown
          menu={{
            selectedKeys: [counter.tableSize as string],
            onClick: ({ key }: { key: string | number }) => {
              counter.setTableSize?.(key as DensitySize)
            },
            style: {
              width: 80,
            },
            items: [
              {
                key: 'large',
                label: intl.getMessage('tableToolBar.densityLarger', '宽松'),
              },
              {
                key: 'middle',
                label: intl.getMessage('tableToolBar.densityMiddle', '中等'),
              },
              {
                key: 'small',
                label: intl.getMessage('tableToolBar.densitySmall', '紧凑'),
              },
            ],
          }}
          trigger={['click']}
        >
          <Tooltip title={intl.getMessage('tableToolBar.density', '表格密度')}>
            <span>{icon}</span>
          </Tooltip>
        </Dropdown>
      )
    }
  },
})

export default DensityIcon
