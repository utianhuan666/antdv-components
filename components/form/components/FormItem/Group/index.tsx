import type { PropType, VNodeChild } from 'vue'
import type { ProFormGroupProps } from '../../../typing'
import { Col, Row, Space } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import { useGridHelpers } from '../../../helpers'

/**
 * ProForm.Group – 对标 React `src/form/components/FormItem/Group/index.tsx`：
 * 1. 支持折叠
 * 2. 支持 grid 模式自动布局
 */
const Group = defineComponent({
  name: 'ProFormGroup',
  props: {
    title: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    extra: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    collapsible: { type: Boolean, default: false },
    defaultCollapsed: { type: Boolean, default: false },
    labelLayout: { type: String as PropType<NonNullable<ProFormGroupProps['labelLayout']>>, default: 'inline' },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
    grid: { type: Boolean, default: undefined },
    rowProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    colProps: { type: Object as PropType<Record<string, any>>, default: undefined },
  },
  setup(props, { slots }) {
    const { grid, rowProps } = useGridHelpers(props.colProps)
    const collapsed = ref(props.defaultCollapsed)

    function toggle() {
      if (props.collapsible)
        collapsed.value = !collapsed.value
    }

    return () => {
      const isGrid = props.grid ?? grid.value

      const children = slots.default?.()
      const body = isGrid
        ? (
            <Row {...{ ...rowProps.value, ...(props.rowProps || {}) }}>
              {Array.isArray(children)
                ? children.map((child, idx) => (
                    <Col key={idx} {...(props.colProps || { xs: 24 })}>
                      {child}
                    </Col>
                  ))
                : children}
            </Row>
          )
        : (
            <Space direction="vertical" style={{ width: '100%' }}>
              {children}
            </Space>
          )

      const titleNode = props.title
        ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                cursor: props.collapsible ? 'pointer' : 'default',
                fontWeight: 500,
              }}
              onClick={toggle}
            >
              <span>{props.title}</span>
              {props.extra ? <span>{props.extra}</span> : null}
            </div>
          )
        : null

      return (
        <div style={{ marginBottom: 16, ...(props.style || {}) }}>
          {titleNode}
          {!collapsed.value ? body : null}
        </div>
      )
    }
  },
})

export default Group
