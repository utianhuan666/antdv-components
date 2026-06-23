import type { SpaceProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import { RightOutlined } from '@antdv-next/icons'
import { Space } from 'antdv-next'
import { computed, defineComponent, ref, watch } from 'vue'
import { useProPrefixCls } from '../../../../provider/useProPrefixCls'
import { useStyle } from './style'

export interface ProFormGroupProps {
  title?: VNodeChild
  label?: VNodeChild
  tooltip?: VNodeChild
  extra?: VNodeChild
  size?: SpaceProps['size']
  style?: CSSProperties
  titleStyle?: CSSProperties
  titleRender?: (title: VNodeChild, props: ProFormGroupProps) => VNodeChild
  align?: SpaceProps['align']
  spaceProps?: SpaceProps
  direction?: SpaceProps['orientation']
  labelLayout?: 'inline' | 'twoLine'
  collapsed?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  autoFocus?: boolean
}

const Group = defineComponent({
  name: 'ProFormGroup',
  inheritAttrs: false,
  setup(props: ProFormGroupProps, { attrs, slots }) {
    const prefixCls = useProPrefixCls('pro-form-group')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const innerCollapsed = ref(Boolean(props.defaultCollapsed))
    watch(() => props.collapsed, (value) => {
      if (value !== undefined)
        innerCollapsed.value = value
    }, { immediate: true })

    const collapsed = computed(() => props.collapsed ?? innerCollapsed.value)
    const setCollapsed = (next: boolean) => {
      innerCollapsed.value = next
      props.onCollapse?.(next)
    }

    return () => {
      const title = props.title ?? props.label
      const label = (
        <span>
          {props.collapsible ? <RightOutlined rotate={collapsed.value ? undefined : 90} style={{ marginInlineEnd: 8 }} /> : null}
          {title}
          {props.tooltip ? <span style={{ marginInlineStart: 4 }}>{props.tooltip}</span> : null}
        </span>
      )
      const titleDom = props.titleRender ? props.titleRender(label, props) : label

      return wrapSSR(
        <div {...attrs} class={[prefixCls.value, hashId, props.labelLayout === 'twoLine' && `${prefixCls.value}-twoLine`, (attrs as any).class]} style={props.style}>
          {(title || props.tooltip || props.extra)
            ? (
                <div
                  class={`${prefixCls.value}-title`}
                  role={props.collapsible ? 'button' : undefined}
                  tabindex={props.collapsible ? 0 : undefined}
                  style={props.titleStyle}
                  onClick={() => props.collapsible && setCollapsed(!collapsed.value)}
                  onKeydown={(event: KeyboardEvent) => {
                    if (props.collapsible && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault()
                      setCollapsed(!collapsed.value)
                    }
                  }}
                >
                  {props.extra
                    ? (
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                          {titleDom}
                          <span>{props.extra}</span>
                        </div>
                      )
                    : titleDom}
                </div>
              )
            : null}
          <div class={`${prefixCls.value}-container`} style={{ display: props.collapsible && collapsed.value ? 'none' : undefined }}>
            <Space
              {...props.spaceProps}
              size={props.size ?? 32}
              align={props.align ?? 'start'}
              orientation={props.direction}
              style={{ rowGap: 0, ...(props.spaceProps as any)?.style }}
            >
              {slots.default?.()}
            </Space>
          </div>
        </div>,
      )
    }
  },
}) as any

Group.displayName = 'ProForm-Group'

export default Group
