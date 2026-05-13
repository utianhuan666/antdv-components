import type { PropType, VNodeChild } from 'vue'
import { DownOutlined } from '@antdv-next/icons'
import { Space } from 'antdv-next'
import { defineComponent } from 'vue'

export interface ActionsCollapseProps {
  collapsed: boolean
  hiddenNum?: number | false
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
  props: {
    submitter: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    collapsed: { type: Boolean, default: false },
    setCollapsed: { type: Function as PropType<(collapsed: boolean) => void>, required: true },
    collapseRender: {
      type: [Function, Boolean] as PropType<CollapseRender>,
      default: undefined,
    },
    hiddenNum: { type: [Number, Boolean] as PropType<number | false>, default: false },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
  },
  setup(props) {
    return () => {
      const renderFn = typeof props.collapseRender === 'function'
        ? props.collapseRender
        : defaultCollapseRender
      return (
        <Space style={props.style} size={16}>
          {props.submitter}
          {props.collapseRender !== false
            ? (
                <a
                  class="ant-pro-query-filter-collapse-button"
                  onClick={() => props.setCollapsed(!props.collapsed)}
                >
                  {renderFn(props.collapsed, { collapsed: props.collapsed, hiddenNum: props.hiddenNum }, props.hiddenNum)}
                </a>
              )
            : null}
        </Space>
      )
    }
  },
})

export default Actions
