import type { CSSProperties, VNodeChild } from 'vue'
import { DownOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Space } from 'antdv-next'
import { defineComponent } from 'vue'
import { useIntl, useProProviderContext } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

export interface ActionsProps {
  submitter: VNodeChild
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  setCollapsed: (collapse: boolean) => void
  isForm?: boolean
  style?: CSSProperties
  collapseRender?:
    | ((
      collapsed: boolean,
      props: ActionsProps,
      intl: ReturnType<typeof useIntl>,
      hiddenNum?: false | number,
    ) => VNodeChild)
    | false
  hiddenNum?: false | number
}

const defaultCollapseRender: NonNullable<ActionsProps['collapseRender']> = (
  collapsed,
  _,
  intl,
  hiddenNum,
) => (
  <>
    {collapsed
      ? intl.getMessage('tableForm.collapsed', '展开')
      : intl.getMessage('tableForm.expand', '收起')}
    {collapsed && hiddenNum ? `(${hiddenNum})` : null}
    <DownOutlined
      style={{
        marginInlineStart: '0.5em',
        transition: '0.3s all',
        transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
      }}
    />
  </>
)

const Actions = defineComponent<ActionsProps>({
  name: 'QueryFilterActions',
  props: ['submitter', 'collapsed', 'onCollapse', 'setCollapsed', 'isForm', 'style', 'collapseRender', 'hiddenNum'],
  setup(rawProps) {
    const props = rawProps
    const intl = useIntl()
    const proProvider = useProProviderContext()
    const prefixCls = useProPrefixCls('pro-query-filter-collapse-button')

    return () => {
      const collapseRender = props.collapseRender || defaultCollapseRender

      return (
        <Space style={props.style} size={16}>
          {props.submitter}
          {props.collapseRender !== false
            ? (
                <a
                  class={clsx(prefixCls.value, proProvider.hashId)}
                  onClick={() => props.setCollapsed(!props.collapsed)}
                >
                  {collapseRender?.(!!props.collapsed, props, intl, props.hiddenNum)}
                </a>
              )
            : null}
        </Space>
      )
    }
  },
})

export default Actions
