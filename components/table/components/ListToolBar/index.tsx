import type { TabPaneProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { LabelTooltipType } from '../../../utils'
import type { ListToolBarHeaderMenuProps } from './HeaderMenu'
import { clsx } from '@v-c/util'
import { Input, Tabs, Tooltip } from 'antdv-next'
import { computed, defineComponent, isVNode, onBeforeUnmount, onMounted, ref } from 'vue'
import { proTheme, useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { LabelIconTip } from '../../../utils'
import HeaderMenu from './HeaderMenu'
import { useStyle } from './style'

export interface ListToolBarSetting {
  icon: VNodeChild
  tooltip?: LabelTooltipType | string
  key?: string
  onClick?: (key?: string) => void
}

/** Antd 默认直接导出了 rc 组件中的 Tab.Pane 组件。 */
type TabPane = TabPaneProps & {
  key?: string
}

export interface ListToolBarTabs {
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
  items?: TabPane[]
}

export type ListToolBarMenu = ListToolBarHeaderMenuProps

type SearchPropType
  = | (Record<string, any> & {
    onSearch: (searchValue: string) => Promise<false | void> | false | void
  })
  | VNodeChild
  | boolean
type SettingPropType = VNodeChild | ListToolBarSetting

export interface ListToolBarProps {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  /** 标题 */
  title?: VNodeChild
  /** 副标题 */
  subTitle?: VNodeChild
  /** 标题提示 */
  tooltip?: string | LabelTooltipType
  /** 搜索输入栏相关配置 */
  search?: SearchPropType
  /** 搜索回调 */
  onSearch?: (keyWords: string) => void
  /** 工具栏右侧操作区 */
  actions?: VNodeChild[]
  /** 工作栏右侧设置区 */
  settings?: SettingPropType[]
  /** 是否多行展示 */
  multipleLine?: boolean
  /** 过滤区，通常配合 LightFilter 使用 */
  filter?: VNodeChild
  /** 标签页配置，仅当 `multipleLine` 为 true 时有效 */
  tabs?: ListToolBarTabs
  /** 菜单配置 */
  menu?: ListToolBarMenu
}

/**
 * 获取配置区域 DOM Item
 *
 * @param setting 配置项
 */
function getSettingItem(setting: SettingPropType): VNodeChild {
  if (isVNode(setting))
    return setting

  if (setting) {
    const settingConfig: ListToolBarSetting = setting as ListToolBarSetting
    const { icon, tooltip, onClick, key } = settingConfig
    if (icon && tooltip) {
      return (
        <Tooltip title={tooltip as VNodeChild}>
          <span
            key={key}
            onClick={() => {
              if (onClick)
                onClick(key)
            }}
          >
            {icon}
          </span>
        </Tooltip>
      )
    }
    if (icon !== undefined || onClick) {
      return (
        <span
          key={key}
          onClick={() => {
            if (onClick)
              onClick(key)
          }}
        >
          {icon}
        </span>
      )
    }
    return setting as VNodeChild
  }
  return null
}

interface ListToolBarTabBarProps {
  prefixCls: string
  hashId?: string
  filtersNode?: VNodeChild
  multipleLine: boolean
  tabs?: ListToolBarProps['tabs']
}

interface ListToolBarResizeWrapProps {
  onResize?: (width: number) => void
}

const ListToolBarTabBar = defineComponent<ListToolBarTabBarProps>({
  name: 'ListToolBarTabBar',
  props: ['prefixCls', 'hashId', 'filtersNode', 'multipleLine', 'tabs'],
  setup(rawProps) {
    const props = rawProps
    return () => {
      const { prefixCls, hashId, tabs, multipleLine, filtersNode } = props
      if (!multipleLine)
        return null
      return (
        <div class={clsx(`${prefixCls}-extra-line`, hashId)}>
          {tabs?.items && tabs?.items.length
            ? (
                <Tabs
                  style={{ width: '100%' }}
                  defaultActiveKey={tabs.defaultActiveKey}
                  activeKey={tabs.activeKey}
                  items={tabs.items.map((item, index) => ({
                    label: (item as any).tab,
                    ...item,
                    key: item.key?.toString() || index?.toString(),
                  })) as any}
                  onChange={tabs.onChange}
                  tabBarExtraContent={filtersNode}
                />
              )
            : (
                filtersNode
              )}
        </div>
      )
    }
  },
})

/**
 * React 端用 `@rc-component/resize-observer` 监听容器宽度变化以切换移动端布局。
 * Vue 端用原生 ResizeObserver 在挂载后监听根节点，行为等价。
 */
const ListToolBarResizeWrap = defineComponent<ListToolBarResizeWrapProps>({
  name: 'ListToolBarResizeWrap',
  props: ['onResize'],
  setup(rawProps, { slots, attrs }) {
    const props = rawProps
    const rootRef = ref<HTMLDivElement | null>(null)
    let resizeObserver: ResizeObserver | undefined

    onMounted(() => {
      if (typeof ResizeObserver === 'undefined' || !rootRef.value)
        return
      resizeObserver = new ResizeObserver(([entry]) => {
        if (entry)
          props.onResize?.(entry.contentRect.width)
      })
      resizeObserver.observe(rootRef.value)
    })

    onBeforeUnmount(() => resizeObserver?.disconnect())

    return () => (
      <div ref={rootRef} {...attrs}>
        {slots.default?.()}
      </div>
    )
  },
})

const ListToolBar = defineComponent<ListToolBarProps>({
  name: 'ListToolBar',
  props: ['prefixCls', 'title', 'subTitle', 'tooltip', 'className', 'style', 'search', 'onSearch', 'multipleLine', 'filter', 'actions', 'settings', 'tabs', 'menu'],
  setup(rawProps) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-table-list-toolbar', computed(() => props.prefixCls))
    const themeToken = proTheme.useToken()
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const intl = useIntl()
    const isMobile = ref(false)

    return () => {
      const {
        title,
        subTitle,
        tooltip,
        className,
        style,
        search,
        onSearch,
        multipleLine = false,
        filter,
        actions = [],
        settings = [],
        tabs,
        menu,
      } = props
      const pre = prefixCls.value
      const token = themeToken.token.value

      const placeholder = intl.getMessage('tableForm.inputPlaceholder', '请输入')

      /**
       * 获取搜索栏 DOM
       *
       * @param search 搜索框相关配置
       */
      let searchNode: VNodeChild = null
      if (search) {
        if (isVNode(search)) {
          searchNode = search
        }
        else {
          searchNode = (
            <Input.Search
              style={{ width: 200 }}
              placeholder={placeholder}
              {...(search as Record<string, any>)}
              onSearch={async (...restParams: any[]) => {
                const success = await (search as any).onSearch?.(...restParams)
                if (success !== false)
                  onSearch?.(restParams?.[0])
              }}
            />
          )
        }
      }

      /** 轻量筛选组件 */
      const filtersNode = filter
        ? (
            <div class={clsx(`${pre}-filter`, hashId)}>{filter}</div>
          )
        : null

      /** 有没有 title，需要结合多个场景判断 */
      const hasTitle = menu || title || subTitle || tooltip

      /** 没有 key 的时候帮忙加一下 key 不加的话很烦人 */
      let actionDom: VNodeChild = null
      if (Array.isArray(actions) && actions.length > 0) {
        actionDom = (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${token.marginXS}px`,
            }}
          >
            {actions.map(action => (
              <>{action}</>
            ))}
          </div>
        )
      }
      else if (!Array.isArray(actions)) {
        actionDom = actions
      }

      const hasRight = !!(
        (hasTitle && searchNode)
        || (!multipleLine && filtersNode)
        || actionDom
        || settings?.length
      )

      const hasLeft = !!(
        tooltip
        || title
        || subTitle
        || menu
        || (!hasTitle && searchNode)
      )

      let leftTitleDom: VNodeChild
      // 保留dom是为了占位，不然 right 就变到左边了
      if (!hasLeft && hasRight) {
        leftTitleDom = <div class={clsx(`${pre}-left`, hashId)} />
      }
      else if (!menu && (hasTitle || !searchNode)) {
        // 减少 space 的dom，渲染的时候能节省点性能
        leftTitleDom = (
          <div class={clsx(`${pre}-left`, hashId)}>
            <div class={clsx(`${pre}-title`, hashId)}>
              <LabelIconTip tooltip={tooltip} label={title} subTitle={subTitle} />
            </div>
          </div>
        )
      }
      else {
        leftTitleDom = (
          <div
            class={clsx(`${pre}-left`, hashId, {
              [`${pre}-left-has-tabs`]: menu?.type === 'tab',
              [`${pre}-left-has-dropdown`]: menu?.type === 'dropdown',
              [`${pre}-left-has-inline-menu`]: menu?.type === 'inline',
            })}
          >
            {hasTitle && !menu && (
              <div class={clsx(`${pre}-title`, hashId)}>
                <LabelIconTip tooltip={tooltip} label={title} subTitle={subTitle} />
              </div>
            )}
            {menu && (
              // 这里面实现了 tabs 的逻辑
              <HeaderMenu {...menu} prefixCls={pre} hashId={hashId} />
            )}
            {!hasTitle && searchNode
              ? (
                  <div class={clsx(`${pre}-search`, hashId)}>
                    {searchNode}
                  </div>
                )
              : null}
          </div>
        )
      }

      const rightTitleDom = hasRight
        ? (
            <div
              class={clsx(`${pre}-right`, hashId)}
              style={isMobile.value ? {} : { alignItems: 'center' }}
            >
              {!multipleLine ? filtersNode : null}
              {hasTitle && searchNode
                ? (
                    <div class={clsx(`${pre}-search`, hashId)}>{searchNode}</div>
                  )
                : null}
              {actionDom}
              {settings?.length
                ? (
                    <div class={clsx(`${pre}-setting-items`, hashId)}>
                      {settings.map((setting, index) => {
                        const settingItem = getSettingItem(setting)
                        return (
                          <div
                            key={index}
                            class={clsx(`${pre}-setting-item`, hashId)}
                          >
                            {settingItem}
                          </div>
                        )
                      })}
                    </div>
                  )
                : null}
            </div>
          )
        : null

      const titleNode
        = hasRight || hasLeft
          ? (
              <div
                class={clsx(`${pre}-container`, hashId, {
                  [`${pre}-container-mobile`]: isMobile.value,
                })}
              >
                {leftTitleDom}
                {rightTitleDom}
              </div>
            )
          : null

      return wrapSSR(
        <ListToolBarResizeWrap
          style={style}
          class={clsx(pre, hashId, className)}
          onResize={(width: number) => {
            const nextIsMobile = width < 375
            if (nextIsMobile !== isMobile.value)
              isMobile.value = nextIsMobile
          }}
        >
          {titleNode}
          <ListToolBarTabBar
            filtersNode={filtersNode}
            hashId={hashId}
            prefixCls={pre}
            tabs={tabs}
            multipleLine={multipleLine}
          />
        </ListToolBarResizeWrap>,
      )
    }
  },
})

export default ListToolBar
