import type { HeaderViewProps } from '../SiderMenu/types'
import { EllipsisOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Avatar, Dropdown } from 'antdv-next'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useDebounceFn } from '../../../utils'
import { useStyle } from './rightContentStyle'

const MAX_VISIBLE_MOBILE_ACTIONS = 2

export const ActionsContent = defineComponent<HeaderViewProps>({
  name: 'ActionsContent',
  props: [
    'avatarProps',
    'actionsRender',
    'isMobile',
    'prefixCls',
  ] as any,
  setup(props) {
    const rootPrefixCls = useProPrefixCls('pro', computed(() => props.prefixCls))
    const prefixCls = computed(() => `${rootPrefixCls.value}-global-header`)
    const { hashId } = useStyle(prefixCls.value)
    const contentRef = shallowRef<HTMLElement>()
    const rightSize = ref<number | string>('auto')
    const setRightSizeDebounceFn = useDebounceFn(async (width: number) => {
      rightSize.value = width
    }, 160)

    let resizeObserver: ResizeObserver | undefined

    onMounted(() => {
      if (typeof ResizeObserver === 'undefined' || !contentRef.value)
        return
      resizeObserver = new ResizeObserver(([entry]) => {
        if (entry)
          setRightSizeDebounceFn.run(entry.contentRect.width)
      })
      resizeObserver.observe(contentRef.value)
    })

    onBeforeUnmount(() => resizeObserver?.disconnect())

    const avatarDom = computed(() => {
      const avatarProps = props.avatarProps
      if (!avatarProps)
        return null
      const { title, render, ...rest } = avatarProps as any
      const dom = (
        <div>
          {(rest.src || rest.srcSet || rest.icon || rest.children) ? <Avatar {...rest} size={28} /> : null}
          {!props.isMobile && title ? <span style={{ marginInlineStart: '8px' }}>{title}</span> : null}
        </div>
      )
      return render ? render(avatarProps, dom, props as HeaderViewProps) : dom
    })

    return () => {
      const actionProps = { ...props, rightContentSize: rightSize.value } as HeaderViewProps
      const doms = props.actionsRender ? props.actionsRender(actionProps) : undefined
      if (!doms && !avatarDom.value)
        return null
      const actionsContent = (() => {
        if (!Array.isArray(doms)) {
          return (
            <div class={clsx(`${prefixCls.value}-header-actions`, hashId)} data-testid="pro-layout-global-header-actions">
              {doms}
              {avatarDom.value
                ? (
                    <span class={clsx(`${prefixCls.value}-header-actions-avatar`, hashId)} data-testid="pro-layout-global-header-actions-avatar">
                      {avatarDom.value}
                    </span>
                  )
                : null}
            </div>
          )
        }

        const validDoms = doms.filter(Boolean)
        const needCollapse = props.isMobile && validDoms.length > MAX_VISIBLE_MOBILE_ACTIONS
        const visibleDoms = needCollapse ? validDoms.slice(0, MAX_VISIBLE_MOBILE_ACTIONS) : validDoms
        const overflowDoms = needCollapse ? validDoms.slice(MAX_VISIBLE_MOBILE_ACTIONS) : []
        const overflowMenu = {
          items: overflowDoms.map((dom, index) => ({
            key: `overflow-${index}`,
            label: dom,
          })),
        }

        return (
          <div class={clsx(`${prefixCls.value}-header-actions`, hashId)} data-testid="pro-layout-global-header-actions">
            {visibleDoms.map((dom, index) => (
              <div key={index} class={clsx(`${prefixCls.value}-header-actions-item`, hashId)} data-testid="pro-layout-global-header-actions-item">
                {dom}
              </div>
            ))}
            {overflowDoms.length > 0
              ? (
                  <Dropdown trigger={['click']} menu={overflowMenu}>
                    <div class={clsx(`${prefixCls.value}-header-actions-item`, `${prefixCls.value}-header-actions-hover`, hashId)} data-testid="pro-layout-global-header-actions-more">
                      <EllipsisOutlined />
                    </div>
                  </Dropdown>
                )
              : null}
            {avatarDom.value
              ? (
                  <span class={clsx(`${prefixCls.value}-header-actions-avatar`, hashId)} data-testid="pro-layout-global-header-actions-avatar">
                    {avatarDom.value}
                  </span>
                )
              : null}
          </div>
        )
      })()

      return (
        <div class={clsx(`${prefixCls.value}-right-content`, hashId)} style={{ minWidth: typeof rightSize.value === 'number' ? `${rightSize.value}px` : rightSize.value, height: '100%' }} data-testid="pro-layout-global-header-right-content">
          <div style={{ height: '100%' }}>
            <div ref={contentRef as any} style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              {actionsContent}
            </div>
          </div>
        </div>
      )
    }
  },
})
