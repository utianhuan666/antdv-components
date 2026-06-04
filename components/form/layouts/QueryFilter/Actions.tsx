import type { CSSProperties, VNodeChild } from 'vue'
import { DownOutlined } from '@antdv-next/icons'
import { Space } from 'antdv-next'
import { defineComponent } from 'vue'

export interface ActionsCollapseProps {
  collapsed?: boolean
  hiddenNum?: number | false
}

export interface ActionsProps extends ActionsCollapseProps {
  submitter?: VNodeChild
  setCollapsed?: (collapsed: boolean) => void
  collapseRender?: CollapseRender
  style?: CSSProperties
}

export type CollapseRender
  = | ((collapsed: boolean, props: ActionsCollapseProps, hiddenNum?: number | false) => VNodeChild)
    | false

const defaultCollapseRender: Exclude<CollapseRender, false> = (collapsed, _, hiddenNum) => {
  return (
    <>
      {collapsed ? '展开' : '收起'}
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
}

/**
 * QueryFilter 底部操作区，对标 React `src/form/layouts/QueryFilter/Actions.tsx`。
 * 1. 渲染 submitter 中默认按钮组
 * 2. 当需要时附加展开/收起按钮，可由 `collapseRender` 自定义
 */
const Actions = defineComponent({
  name: 'ProQueryFilterActions',
  props: ['submitter', 'collapsed', 'setCollapsed', 'collapseRender', 'hiddenNum', 'style'],
  setup(rawProps) {
    const props = rawProps as Readonly<ActionsProps>
    return () => {
      const renderFn = typeof props.collapseRender === 'function'
        ? props.collapseRender
        : defaultCollapseRender
      const collapsed = props.collapsed ?? false
      const hiddenNum = props.hiddenNum ?? false
      return (
        <Space style={props.style} size={16}>
          {props.submitter}
          {props.collapseRender !== false
            ? (
                <a
                  class="ant-pro-query-filter-collapse-button"
                  onClick={() => props.setCollapsed?.(!collapsed)}
                >
                  {renderFn(collapsed, { collapsed, hiddenNum }, hiddenNum)}
                </a>
              )
            : null}
        </Space>
      )
    }
  },
})

export default Actions
