import type { FunctionalComponent } from 'vue'
import type { ProFormGroupProps } from '../../../typing'
import { Col, Row, Space } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import { useProPrefixCls } from '../../../../provider/useProPrefixCls'
import { useGridHelpers } from '../../../helpers'

const groupPropNames = [
  'title',
  'extra',
  'collapsible',
  'defaultCollapsed',
  'labelLayout',
  'style',
  'grid',
  'rowProps',
  'colProps',
] as const

function resolveBoolean(value: unknown, fallback = false) {
  if (value === '')
    return true
  return typeof value === 'boolean' ? value : fallback
}

/**
 * ProForm.Group – 对标 React `src/form/components/FormItem/Group/index.tsx`：
 * 1. 支持折叠
 * 2. 支持 grid 模式自动布局
 */
const Group = defineComponent({
  name: 'ProFormGroup',
  props: [...groupPropNames],
  setup(rawProps, { slots }) {
    const props = rawProps as Readonly<ProFormGroupProps>
    const prefixCls = useProPrefixCls('pro-form-group')
    const { grid, rowProps } = useGridHelpers(props.colProps)
    const collapsed = ref(resolveBoolean(props.defaultCollapsed))

    function toggle() {
      if (resolveBoolean(props.collapsible))
        collapsed.value = !collapsed.value
    }

    return () => {
      const isGrid = props.grid === undefined ? grid.value : resolveBoolean(props.grid)

      const children = slots.default?.()
      const groupStyle = props.style || {}
      const { gap, rowGap, columnGap, ...rootStyle } = groupStyle
      const bodyStyle = {
        maxWidth: '100%',
        flexWrap: 'wrap',
        rowGap: rowGap ?? 0,
        ...(gap !== undefined ? { gap } : {}),
        ...(columnGap !== undefined ? { columnGap } : {}),
      }

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
            <Space
              class={`${prefixCls.value}-container`}
              align="start"
              size={32}
              style={bodyStyle}
            >
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
                marginBottom: 24,
                cursor: resolveBoolean(props.collapsible) ? 'pointer' : 'default',
                fontWeight: 'bold',
              }}
              onClick={toggle}
            >
              <span>{props.title}</span>
              {props.extra ? <span>{props.extra}</span> : null}
            </div>
          )
        : null

      return (
        <div class={prefixCls.value} style={{ boxSizing: 'border-box', marginBottom: 16, ...rootStyle }}>
          {titleNode}
          {!collapsed.value ? body : null}
        </div>
      )
    }
  },
}) as unknown as FunctionalComponent<ProFormGroupProps>

export default Group
