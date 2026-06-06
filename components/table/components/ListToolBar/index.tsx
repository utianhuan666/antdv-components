import type { CSSProperties, VNodeChild } from 'vue'
import type { LabelTooltipType } from '../../../utils'
import { Input, Tabs, Tooltip } from 'antdv-next'
import { computed, defineComponent, isVNode, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { LabelIconTip } from '../../../utils'
import HeaderMenu from './HeaderMenu'
import useStyle from './style'

export interface ListToolBarSetting {
  icon: VNodeChild
  tooltip?: LabelTooltipType | string
  key?: string
  onClick?: (key?: string) => void
}

export interface ListToolBarTabs {
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
  items?: any[]
}

export interface ListToolBarProps {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  title?: VNodeChild
  subTitle?: VNodeChild
  tooltip?: string | LabelTooltipType
  search?: false | boolean | VNodeChild | Record<string, any>
  onSearch?: (keyWords: string) => void
  actions?: VNodeChild[] | VNodeChild | (() => VNodeChild[] | VNodeChild)
  settings?: (VNodeChild | ListToolBarSetting | null | undefined | false)[] | VNodeChild
  multipleLine?: boolean
  filter?: VNodeChild
  tabs?: ListToolBarTabs
  menu?: any
}

function normalizeNodeList(value: any): any[] {
  const next = typeof value === 'function' ? value() : value
  if (Array.isArray(next))
    return next.filter(item => item !== null && item !== undefined && item !== false)
  if (next === undefined || next === null || next === false)
    return []
  return [next]
}

function getSettingItem(setting: any) {
  if (isVNode(setting))
    return setting
  if (!setting)
    return null
  const node = (
    <span
      key={setting.key}
      onClick={() => setting.onClick?.(setting.key)}
    >
      {setting.icon}
    </span>
  )
  if (setting.tooltip)
    return <Tooltip title={setting.tooltip}>{node}</Tooltip>
  return node
}

const ListToolBarTabBar = defineComponent({
  name: 'ListToolBarTabBar',
  props: ['prefixCls', 'hashId', 'filtersNode', 'multipleLine', 'tabs'],
  setup(props) {
    return () => {
      if (!props.multipleLine)
        return null
      const tabs = props.tabs
      return (
        <div class={[`${props.prefixCls}-extra-line`, props.hashId]}>
          {tabs?.items?.length
            ? (
                <Tabs
                  style={{ width: '100%' }}
                  defaultActiveKey={tabs.defaultActiveKey}
                  activeKey={tabs.activeKey}
                  items={tabs.items.map((item: any, index: number) => ({
                    ...item,
                    label: item.tab ?? item.label,
                    key: item.key?.toString() || index.toString(),
                  }))}
                  onChange={tabs.onChange}
                  tabBarExtraContent={props.filtersNode}
                />
              )
            : props.filtersNode}
        </div>
      )
    }
  },
})

export default defineComponent({
  name: 'ListToolBar',
  props: [
    'prefixCls',
    'className',
    'style',
    'title',
    'subTitle',
    'tooltip',
    'search',
    'onSearch',
    'actions',
    'settings',
    'multipleLine',
    'filter',
    'tabs',
    'menu',
  ],
  setup(props) {
    const intl = useIntl()
    const isMobile = ref(false)
    const prefixCls = useProPrefixCls('pro-table-list-toolbar', computed(() => props.prefixCls))
    let styleInfo: ReturnType<typeof useStyle>
    try {
      styleInfo = useStyle(prefixCls.value)
    }
    catch {
      styleInfo = {
        wrapSSR: node => node,
        hashId: '',
      }
    }
    const { wrapSSR, hashId } = styleInfo
    const placeholder = intl.getMessage('tableForm.inputPlaceholder', '请输入')

    function renderSearchNode() {
      const search = props.search
      if (!search)
        return null
      if (isVNode(search))
        return search

      const searchProps = search === true ? {} : { ...(search as Record<string, any>) }
      const submitSearch = async (value: string) => {
        const success = await searchProps.onSearch?.(value)
        if (success !== false)
          props.onSearch?.(value)
      }
      return (
        <Input.Search
          style={{ width: 200, ...(searchProps.style || {}) }}
          placeholder={searchProps.placeholder || placeholder}
          {...searchProps}
          onPressEnter={(event: KeyboardEvent) => submitSearch((event.target as HTMLInputElement)?.value)}
          onSearch={(value: string) => submitSearch(value)}
        />
      )
    }

    function onSearchKeydown(event: KeyboardEvent) {
      if (event.key !== 'Enter')
        return
      const search = props.search
      if (!search || isVNode(search))
        return
      const searchProps = search === true ? {} : { ...(search as Record<string, any>) }
      const value = (event.target as HTMLInputElement)?.value
      void (async () => {
        const success = await searchProps.onSearch?.(value)
        if (success !== false)
          props.onSearch?.(value)
      })()
    }

    return () => {
      const searchNode = renderSearchNode()
      const filtersNode = props.filter
        ? <div class={[`${prefixCls.value}-filter`, hashId]}>{props.filter}</div>
        : null
      const hasTitle = !!(props.menu || props.title || props.subTitle || props.tooltip)
      const actions = normalizeNodeList(props.actions)
      const settings = normalizeNodeList(props.settings)
      const actionDom = actions.length
        ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {actions.map((action, index) => <span key={index}>{action}</span>)}
            </div>
          )
        : null

      const hasRight = !!(
        (hasTitle && searchNode)
        || (!props.multipleLine && filtersNode)
        || actionDom
        || settings.length
      )
      const hasLeft = !!(
        props.tooltip
        || props.title
        || props.subTitle
        || props.menu
        || (!hasTitle && searchNode)
      )

      const leftDom = !hasLeft && hasRight
        ? <div class={[`${prefixCls.value}-left`, hashId]} />
        : (
            <div
              class={[
                `${prefixCls.value}-left`,
                props.menu?.type === 'tab' ? `${prefixCls.value}-left-has-tabs` : undefined,
                props.menu?.type === 'dropdown' ? `${prefixCls.value}-left-has-dropdown` : undefined,
                props.menu?.type === 'inline' ? `${prefixCls.value}-left-has-inline-menu` : undefined,
                hashId,
              ]}
            >
              {hasTitle && !props.menu
                ? (
                    <div class={[`${prefixCls.value}-title`, hashId]}>
                      <LabelIconTip tooltip={props.tooltip} label={props.title} subTitle={props.subTitle} />
                    </div>
                  )
                : null}
              {props.menu ? <HeaderMenu {...props.menu} prefixCls={prefixCls.value} hashId={hashId} /> : null}
              {!hasTitle && searchNode
                ? <div class={[`${prefixCls.value}-search`, hashId]} onKeydown={onSearchKeydown}>{searchNode}</div>
                : null}
            </div>
          )

      const rightDom = hasRight
        ? (
            <div
              class={[`${prefixCls.value}-right`, hashId]}
              style={isMobile.value ? undefined : { alignItems: 'center' }}
            >
              {!props.multipleLine ? filtersNode : null}
              {hasTitle && searchNode
                ? <div class={[`${prefixCls.value}-search`, hashId]} onKeydown={onSearchKeydown}>{searchNode}</div>
                : null}
              {actionDom}
              {settings.length
                ? (
                    <div class={[`${prefixCls.value}-setting-items`, hashId]}>
                      {settings.map((setting, index) => (
                        <div key={index} class={[`${prefixCls.value}-setting-item`, hashId]}>
                          {getSettingItem(setting)}
                        </div>
                      ))}
                    </div>
                  )
                : null}
            </div>
          )
        : null

      return wrapSSR(
        <div
          style={props.style}
          class={[prefixCls.value, hashId, props.className]}
        >
          {hasRight || hasLeft
            ? (
                <div class={[`${prefixCls.value}-container`, isMobile.value ? `${prefixCls.value}-container-mobile` : undefined, hashId]}>
                  {leftDom}
                  {rightDom}
                </div>
              )
            : null}
          <ListToolBarTabBar
            filtersNode={filtersNode}
            hashId={hashId}
            prefixCls={prefixCls.value}
            tabs={props.tabs}
            multipleLine={props.multipleLine}
          />
        </div>,
      )
    }
  },
})
