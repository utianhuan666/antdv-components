import { flushPromises, mount } from '@vue/test-utils'
import { ConfigProvider } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { ProLayout, useRouteContext } from '../../layout'
import { AppsLogoComponents } from '../../layout/components/AppsLogoComponents'
import { DefaultHeader } from '../../layout/components/Header'
import { PageContainer } from '../../layout/components/PageContainer'
import { SiderMenu } from '../../layout/components/SiderMenu'
import { BaseMenu } from '../../layout/components/SiderMenu/BaseMenu'
import { TopNavHeader } from '../../layout/components/TopNavHeader'
import { waitFor } from '../testUtils'
import { bigDefaultProps } from './defaultProps'

afterEach(() => {
  document.body.innerHTML = ''
  document.title = ''
  vi.restoreAllMocks()
})

const menuRoute = {
  path: '/',
  children: [
    { path: '/welcome', name: '欢迎' },
    {
      path: '/admin',
      name: '管理页',
      children: [
        { path: '/admin/sub-page1', name: '一级页面' },
        { path: '/admin/sub-page2', name: '二级页面' },
      ],
    },
  ],
}

const nestedMenuData = [
  {
    path: '/admin',
    name: '管理页',
    children: [
      { path: '/admin/sub-page1', name: '一级页面' },
      { path: '/admin/sub-page2', name: '二级页面' },
    ],
  },
  {
    path: '/list',
    name: '列表页',
    children: [
      {
        path: '/list/sub-page',
        name: '一级列表页面',
        children: [{ path: '/list/sub-page/sub-sub-page1', name: '一一级列表页面' }],
      },
    ],
  },
]

describe('basicLayout', () => {
  it('🥩 base use', async () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      slots: { default: () => 'welcome' },
    })

    expect(wrapper.find('.ant-pro-basicLayout').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-basicLayout-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('welcome')
  })

  it('🥩 support loading', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        loading: true,
        menu: { loading: true },
      },
    })

    expect(wrapper.find('.ant-spin').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-basicLayout').exists()).toBe(false)
  })

  it('🥩 do not render menu', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { menuRender: false },
    })

    expect(wrapper.find('[data-testid="pro-layout-sider"]').exists()).toBe(false)
    expect(wrapper.find('.ant-pro-sider-menu').exists()).toBe(false)
    expect(wrapper.find('.ant-pro-basicLayout-content').exists()).toBe(true)
  })

  it('🥩 do not render footer', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { title: 'title', footerRender: false },
    })

    expect(wrapper.find('[data-testid="pro-layout-footer"]').exists()).toBe(false)
    expect(wrapper.find('footer').exists()).toBe(false)
  })

  it('🥩 use onLogoClick', async () => {
    const onLogoClick = vi.fn()
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        logo: (
          <div id="test_log" role="button" tabindex={0} onClick={onLogoClick}>
            Logo
          </div>
        ),
      },
    })

    await wrapper.get('#test_log').trigger('click')
    expect(onLogoClick).toHaveBeenCalled()
  })

  it('🥩 render logo', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        logo: <div id="test_log">Logo</div>,
      },
    })

    expect(wrapper.get('#test_log').text()).toEqual('Logo')
  })

  it('🥩 render logo by function', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        logo: () => <div id="test_log">Logo</div>,
      },
    })

    expect(wrapper.get('#test_log').text()).toEqual('Logo')
  })

  it('🥩 render default Logo when logo is undefined', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        route: { children: [{ path: '/welcome', name: '欢迎' }] },
      },
    })

    expect(wrapper.find('[data-testid="pro-layout-sider-logo"] svg[viewBox="0 0 200 200"]').exists()).toBe(true)
  })

  it('🥩 onCollapse', async () => {
    const onCollapse = vi.fn()
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { onCollapse },
    })

    await wrapper.get('[data-testid="pro-layout-sider-collapsed-button"]').trigger('click')
    expect(onCollapse).toHaveBeenCalledWith(true)
  })

  it('🥩 siderWidth default', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { route: { children: nestedMenuData } },
    })

    const sider = wrapper.get('[data-testid="pro-layout-sider"]').element as HTMLElement
    expect(sider.style.width).toBe('240px')
    expect(sider.style.maxWidth).toBe('240px')
  })

  it('🥩 siderWidth=160', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        route: { children: nestedMenuData },
        siderWidth: 160,
      },
    })

    const sider = wrapper.get('[data-testid="pro-layout-sider"]').element as HTMLElement
    expect(sider.style.width).toBe('160px')
    expect(sider.style.maxWidth).toBe('160px')
  })

  it('🥩 do not render collapsed button', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { collapsedButtonRender: false },
    })

    expect(wrapper.find('[data-testid="pro-layout-sider-collapsed-button"]').exists()).toBe(false)
  })

  it('🥩 when renderMenu=false, do not render collapsed button', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { menuRender: false },
    })

    expect(wrapper.find('[data-testid="pro-layout-sider-collapsed-button"]').exists()).toBe(false)
  })

  it('🥩 render customize collapsed button', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        collapsedButtonRender: (_collapsed: boolean, dom: any) => (
          <div id="customize_collapsed_button">
            {dom}
            <span>customize</span>
          </div>
        ),
      },
    })

    expect(wrapper.get('#customize_collapsed_button').text()).toContain('customize')
    expect(wrapper.find('[data-testid="pro-layout-sider-collapsed-button"]').exists()).toBe(true)
  })

  it('🥩 mix layout follows side layout class semantics', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { layout: 'mix' },
    })

    const layout = wrapper.get('[data-testid="pro-layout"]')
    expect(layout.classes()).toContain('ant-pro-layout-side')
    expect(layout.classes()).not.toContain('ant-pro-layout-mix')
  })

  it('🥩 set page title render', async () => {
    const pageTitleRender = vi.fn((_props, _pageName, info) => info?.pageName || 'ant')
    mount(ProLayout, {
      attachTo: document.body,
      props: {
        route: { children: [{ path: '/', name: 'welcome' }] },
        location: { pathname: '/' },
        pageTitleRender,
      },
    })

    await waitFor(() => {
      expect(pageTitleRender).toHaveBeenCalled()
      expect(document.title).toBe('welcome')
    })
  })

  it('🥩 onPageChange', async () => {
    const onPageChange = vi.fn()
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        onPageChange,
        location: { pathname: '/' },
      },
    })

    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith({ pathname: '/' })
    })
    await wrapper.setProps({ location: { pathname: '/name' } })
    await waitFor(() => {
      expect(onPageChange).toHaveBeenCalledWith({ pathname: '/name' })
    })
  })

  it('🥩 renderPageTitle return value should is string', async () => {
    const renderPageTitle = vi.fn()
    mount(ProLayout, {
      attachTo: document.body,
      props: {
        location: { pathname: '/' },
        pageTitleRender: () => {
          renderPageTitle()
          return 1221 as any
        },
      },
    })

    await waitFor(() => {
      expect(renderPageTitle).toHaveBeenCalled()
    })
  })

  it('🥩 pageTitleRender non-string falls back to default page title', async () => {
    mount(ProLayout, {
      attachTo: document.body,
      props: {
        title: 'Ant Design Pro',
        route: { children: [{ path: '/welcome', name: '欢迎' }] },
        location: { pathname: '/welcome' },
        pageTitleRender: () => 1221 as any,
      },
    })

    await waitFor(() => {
      expect(document.title).toBe('欢迎 - Ant Design Pro')
    })
  })

  it('🥩 ProLayout support current menu', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        route: { children: [{ path: '/welcome', name: '欢迎' }] },
        location: { pathname: '/welcome' },
      },
    })

    const selectedItem = wrapper.get('.ant-pro-base-menu-vertical-item--selected')
    expect(selectedItem.text()).toContain('欢迎')
    expect(selectedItem.attributes('aria-selected')).toBe('true')
  })

  it('🥩 ProLayout support menu.request', async () => {
    const actionRef: { current?: { reload: () => void } } = {}
    const request = vi.fn(async () => [{ path: '/welcome', name: '欢迎' }])
    const onLoadingChange = vi.fn()
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        actionRef,
        menu: {
          request,
          onLoadingChange,
        },
      },
    })

    await flushPromises()
    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1)
      expect(wrapper.text()).toContain('欢迎')
      expect(onLoadingChange).toHaveBeenCalledWith(true)
      expect(onLoadingChange).toHaveBeenCalledWith(false)
    })

    await actionRef.current?.reload()
    await flushPromises()
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('🥩 ProLayout support menu.params', async () => {
    const request = vi.fn(async (params: any) => {
      return [{ path: '/welcome', name: params.id || '欢迎' }]
    })
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        menu: {
          request,
          params: { id: '1212' },
        },
      },
    })

    await flushPromises()
    await waitFor(() => {
      expect(request).toHaveBeenCalledWith({ id: '1212' }, expect.any(Array))
      expect(wrapper.text()).toContain('1212')
    })

    await wrapper.setProps({
      menu: {
        request,
        params: { id: '123' },
      },
    })
    await flushPromises()
    await waitFor(() => {
      expect(request).toHaveBeenCalledWith({ id: '123' }, expect.any(Array))
      expect(wrapper.text()).toContain('123')
    })
  })

  it('🥩 ProLayout support menu.defaultOpenAll', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        menu: { defaultOpenAll: true },
        location: { pathname: '/admin/sub-page1' },
        menuDataRender: () => [
          {
            path: '/data_hui',
            name: '汇总数据',
            children: [
              {
                name: '域买家维度交易',
                path: '/xx',
                children: [
                  { name: '月表', path: '/data_hui2' },
                  { name: '日表', path: '/data_hui3' },
                ],
              },
              {
                name: '维度交易',
                path: '/',
                children: [
                  { name: '月表', path: '/data_hui4' },
                  { name: '日表', path: '/data_hui5' },
                ],
              },
            ],
          },
        ],
      },
    })

    expect(wrapper.findAll('[data-pro-layout-nav-submenu]')).toHaveLength(3)
    expect(wrapper.findAll('[data-pro-layout-nav-submenu-open]')).toHaveLength(3)
  })

  it('🥩 ProLayout support suppressSiderWhenMenuEmpty', async () => {
    let serviceData = [{ path: '/welcome', name: '欢迎' }]
    const actionRef: { current?: { reload: () => void } } = {}
    const request = vi.fn(async () => serviceData)
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        actionRef,
        suppressSiderWhenMenuEmpty: true,
        menu: { request },
      },
    })

    await flushPromises()
    await waitFor(() => {
      expect(wrapper.find('[data-testid="pro-layout-sider"]').exists()).toBe(true)
    })

    serviceData = []
    await actionRef.current?.reload()
    await flushPromises()
    await waitFor(() => {
      expect(wrapper.find('[data-testid="pro-layout-sider"]').exists()).toBe(false)
    })
  })

  it('🐞 menuItemRender clickable area should follow full title content', async () => {
    const handleMenuItemClick = vi.fn()
    const wrapper = mount(SiderMenu, {
      attachTo: document.body,
      props: {
        menuData: [{ path: '/welcome', name: '欢迎' }],
        matchMenuKeys: [],
        menuItemRender: (item: any, dom: any) => (
          <div role="button" tabindex={0} onClick={() => handleMenuItemClick(item.path)}>
            {dom}
          </div>
        ),
      },
    })

    const titleRow = document.body.querySelector<HTMLElement>(
      '.ant-pro-base-menu-vertical-item .ant-pro-base-menu-vertical-item-title',
    )

    expect(titleRow).toBeTruthy()
    expect(titleRow!.style.width).toBe('100%')
    await wrapper.get('[data-testid="pro-layout-nav-menu-item"]').trigger('click')
    expect(handleMenuItemClick).toHaveBeenCalledWith('/welcome')
  })

  it('🥩 TopNavHeader merges menuProps once on root nav', async () => {
    mount(TopNavHeader, {
      attachTo: document.body,
      props: {
        layout: 'top',
        menuData: [{ path: '/welcome', name: '欢迎' }],
        matchMenuKeys: [],
        menuProps: { 'data-testid': 'top-nav-menu-root' },
      },
    })

    const roots = document.body.querySelectorAll('[data-testid="top-nav-menu-root"]')
    expect(roots.length).toBe(1)
    expect(roots[0]?.tagName.toLowerCase()).toBe('nav')
  })

  it('🥩 do not render menu content', async () => {
    mount(SiderMenu, {
      attachTo: document.body,
      props: {
        menuContentRender: false,
        menuData: [{ path: '/welcome', name: '欢迎' }],
        matchMenuKeys: [],
      },
    })

    expect(document.body.querySelector('.ant-pro-sider')).toBeTruthy()
    expect(document.body.querySelector('.ant-pro-sider-menu')).toBeFalsy()
  })

  it('🥩 support appList', async () => {
    const itemClicking = vi.fn()
    const wrapper = mount(AppsLogoComponents, {
      attachTo: document.body,
      props: {
        prefixCls: 'ant-pro',
        onItemClick: itemClicking,
        appList: [
          {
            icon: 'https://example.com/logo.svg',
            title: 'Ant Design',
            desc: '杭州市较知名的 UI 设计语言',
            url: 'https://ant.design',
          },
          {
            title: 'UI 设计语言',
            icon: () => <span>a</span>,
            desc: '杭州市较知名的 UI 设计语言2',
            children: [
              {
                icon: () => <span>a</span>,
                title: 'Ant Design',
                desc: '杭州市较知名的 UI 设计语言',
                url: 'https://ant.design',
              },
            ],
          },
        ],
      },
    })

    await wrapper.get('.ant-pro-layout-apps-icon').trigger('click')
    expect(document.body.querySelectorAll('.ant-pro-layout-apps-icon').length).toBe(1)
    await waitFor(() => {
      expect(document.body.textContent).toContain('UI 设计语言')
    })

    document.body.querySelector<HTMLElement>('.ant-pro-layout-apps-default-content-list-item a')?.click()
    expect(itemClicking).toHaveBeenCalled()
  })

  it('🥩 appList icon is simple', async () => {
    const itemClicking = vi.fn()
    const wrapper = mount(AppsLogoComponents, {
      attachTo: document.body,
      props: {
        prefixCls: 'ant-pro',
        onItemClick: itemClicking,
        appList: [
          {
            title: 'UI 设计语言',
            children: [
              {
                title: 'Ant Design',
                url: 'https://ant.design',
              },
            ],
          },
        ],
      },
    })

    await wrapper.get('.ant-pro-layout-apps-icon').trigger('click')
    await waitFor(() => {
      expect(document.body.textContent).toContain('UI 设计语言')
    })

    document.body.querySelector<HTMLElement>('.ant-pro-layout-apps-simple-content-list-item a')?.click()
    expect(itemClicking).toHaveBeenCalled()
  })

  it('🥩 collapsed vertical: nested submenu (third level) renders inside popup', async () => {
    const wrapper = mount(BaseMenu, {
      attachTo: document.body,
      props: {
        collapsed: true,
        mode: 'vertical',
        matchMenuKeys: ['/a', '/a/b', '/a/b/c'],
        menuData: [
          {
            path: '/a',
            name: '一级',
            children: [
              {
                path: '/a/b',
                name: '二级',
                children: [{ path: '/a/b/c', name: '三级页面' }],
              },
            ],
          },
        ],
      },
    })

    expect(wrapper.element.querySelectorAll('.ant-pro-base-menu-vertical-submenu').length).toBeGreaterThanOrEqual(1)
    await wrapper.get('[data-testid="pro-layout-nav-menu-popup-submenu-title"]').trigger('click')

    await waitFor(() => {
      expect(document.body.querySelector('[class*="ant-pro-base-menu-vertical-submenu-popup"]')).toBeTruthy()
      expect(document.body.textContent).toContain('三级页面')
    })
  })

  it('🥩 customize render menu header', async () => {
    mount(SiderMenu, {
      attachTo: document.body,
      props: {
        matchMenuKeys: [],
        menuHeaderRender: (logo: any, title: any) => (
          <div id="customize_menu_header">
            {logo}
            {title}
            <div id="customize_menu_header_text">customize_menu_header</div>
          </div>
        ),
      },
    })

    const dom = document.body.querySelector<HTMLDivElement>('#customize_menu_header')
    expect(dom).toBeTruthy()
    expect(dom?.querySelector('#customize_menu_header_text')?.textContent).toEqual('customize_menu_header')
  })

  it('🥩 onMenuHeaderClick', async () => {
    const onMenuHeaderClick = vi.fn()
    const wrapper = mount(SiderMenu, {
      attachTo: document.body,
      props: {
        matchMenuKeys: [],
        onMenuHeaderClick,
      },
    })

    await wrapper.get('#logo').trigger('click')
    expect(onMenuHeaderClick).toHaveBeenCalled()
  })

  it('🥩 BasicLayout menu support onSelect', async () => {
    const fn = vi.fn()
    const Demo = defineComponent({
      setup() {
        const pathname = ref('/admin/sub-page1')
        return () => (
          <BaseMenu
            mode="vertical"
            openKeys={['/admin']}
            matchMenuKeys={[pathname.value]}
            onSelect={fn}
            menuItemRender={(item: any, dom: any) => (
              <button
                type="button"
                onClick={() => {
                  item.onClick()
                  pathname.value = item.path || '/welcome'
                }}
              >
                {dom}
              </button>
            )}
            menuData={[
              {
                path: '/admin',
                name: '管理页',
                children: [
                  { path: '/admin/sub-page1', name: '一级页面' },
                  { path: '/admin/sub-page2', name: '二级页面' },
                ],
              },
            ]}
          />
        )
      },
    })
    const wrapper = mount(Demo, { attachTo: document.body })

    await wrapper.findAll('button').find(button => button.text().includes('二级页面'))!.trigger('click')
    await nextTick()
    expect(fn).toHaveBeenCalledWith({ key: '/admin/sub-page2', selectedKeys: ['/admin/sub-page2'] })
  })

  it('🥩 horizontal top menu: clicking submenu title opens popup and leaf click navigates', async () => {
    const onPathChange = vi.fn()
    const onSelectFn = vi.fn()
    const Demo = defineComponent({
      setup() {
        const pathname = ref('/welcome')
        return () => (
          <TopNavHeader
            layout="top"
            location={{ pathname: pathname.value }}
            matchMenuKeys={[pathname.value]}
            onSelect={onSelectFn}
            menuData={[
              { path: '/welcome', name: '欢迎' },
              {
                path: '/account',
                name: '账户',
                children: [
                  { path: '/account/user', name: '用户管理' },
                  { path: '/account/org', name: '组织管理' },
                ],
              },
              { path: '/session', name: '会话管理' },
            ]}
            menuItemRender={(item: any, dom: any) => (
              <div
                data-testid={`menu-link-${item.path}`}
                onClick={() => {
                  pathname.value = item.path || '/welcome'
                  onPathChange(item.path)
                }}
              >
                {dom}
              </div>
            )}
          />
        )
      },
    })
    mount(Demo, { attachTo: document.body })

    const submenuTitle = document.body.querySelector<HTMLElement>(
      '[data-pro-layout-nav-root] [data-testid="pro-layout-nav-menu-popup-submenu-title"]',
    )
    expect(submenuTitle).toBeTruthy()
    submenuTitle!.click()

    await waitFor(() => {
      expect(document.body.querySelector('[class*="submenu-popup"]')).toBeTruthy()
      expect(document.body.querySelector('[data-testid="menu-link-/account/user"]')).toBeTruthy()
    })

    document.body.querySelector<HTMLElement>('[data-testid="menu-link-/account/user"]')?.click()
    expect(onPathChange).toHaveBeenCalledWith('/account/user')
    expect(onSelectFn).toHaveBeenCalledWith({ key: '/account/user', selectedKeys: ['/account/user'] })
  })

  it('🥩 support headerRender', () => {
    const wrapper = mount(DefaultHeader, {
      attachTo: document.body,
      props: {
        layout: 'side',
        prefixCls: 'ant-pro',
        matchMenuKeys: [],
        headerRender: () => <div id="testid">testid</div>,
      },
    })

    expect(wrapper.element.querySelector('#testid')).toBeTruthy()
  })

  it('🐞 leaf: li click on row blank delegates to inner a[href] when anchor does not fill row', async () => {
    const onInnerNav = vi.fn((event: MouseEvent) => event.preventDefault())
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        menuDataRender: () => [{ path: '/welcome', name: '欢迎' }],
        menuItemRender: (item: any, dom: any) => (
          <a href={item.path} data-testid="inner-nav-anchor" onClick={onInnerNav}>{dom}</a>
        ),
      },
    })

    await nextTick()
    await wrapper.get('[data-pro-layout-nav-leaf]').trigger('click')
    expect(onInnerNav).toHaveBeenCalled()
  })

  it('🐞 leaf: li click delegates to plain div onClick when no a/role=button', async () => {
    const onRow = vi.fn()
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        menuDataRender: () => [{ path: '/welcome', name: '欢迎' }],
        menuItemRender: (item: any, dom: any) => <div data-testid="plain-row" onClick={() => onRow(item.path)}>{dom}</div>,
      },
    })

    await nextTick()
    await wrapper.get('[data-pro-layout-nav-leaf]').trigger('click')
    expect(onRow).toHaveBeenCalledWith('/welcome')
  })

  it('🥩 group title when collapsed, title is hidden', async () => {
    mount(ProLayout, {
      attachTo: document.body,
      props: {
        collapsed: true,
        menu: { type: 'group' },
        menuDataRender: () => [{
          path: '/welcome',
          name: '欢迎',
          children: [{ path: '/welcome/child', name: 'one' }],
        }],
      },
    })

    await nextTick()
    const title = document.body.querySelector<HTMLElement>('[data-pro-layout-nav-group-title]')
    expect(title).toBeTruthy()
    expect(title?.textContent).toContain('欢迎')
  })

  it('🥩 header support fixed-header-scroll', async () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { fixedHeader: true, title: 'fixed-header-scroll' },
    })

    expect(wrapper.find('.ant-pro-layout-header-fixed-header').exists()).toBe(true)
  })

  it('🥩 fixed header responds to target scroll state', async () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { fixedHeader: true },
    })
    const container = wrapper.get('[data-testid="pro-layout-container"]').element as HTMLElement

    container.scrollTop = 400
    container.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('.ant-pro-layout-header-fixed-header-scroll').exists()).toBe(true)

    container.scrollTop = 0
    container.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('.ant-pro-layout-header-fixed-header-scroll').exists()).toBe(false)
  })

  it('🥩 menuDataRender change date', async () => {
    const Demo = defineComponent({
      setup() {
        const menus = ref<any[]>([])
        return { menus }
      },
      render() {
        return <ProLayout menuDataRender={() => this.menus} />
      },
    })
    const wrapper = mount(Demo, { attachTo: document.body })

    expect(wrapper.find('nav.ant-pro-sider-menu').exists()).toBe(false)
    ;(wrapper.vm as any).menus = [{ path: '/home', name: '首页' }]
    await nextTick()
    expect(wrapper.find('nav.ant-pro-sider-menu').exists()).toBe(true)
  })

  it('🥩 support hideMenuWhenCollapsed', async () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        collapsed: true,
        menu: { hideMenuWhenCollapsed: true },
        menuDataRender: () => [{ path: '/welcome', name: '欢迎' }],
      },
    })

    expect(wrapper.find('.ant-pro-sider-menu').exists()).toBe(false)
  })

  it('🥩 do not render menu header', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { menuHeaderRender: false },
    })

    expect(wrapper.find('[data-testid="pro-layout-sider-logo"]').exists()).toBe(false)
  })

  it('🥩 do not render bgListDom', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { bgLayoutImgList: [] },
    })

    expect(wrapper.find('.ant-pro-layout-bg-list').exists()).toBe(false)
  })

  it('🥩 render bgLayoutImgList', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        bgLayoutImgList: [
          { src: 'https://example.com/one.png', width: '100px', left: 12 },
          { src: 'https://example.com/two.png', height: '80px', right: 24 },
        ],
      },
    })

    const bgList = wrapper.get('[data-testid="pro-layout-bg-list"]')
    expect(bgList.findAll('img')).toHaveLength(2)
    expect((bgList.findAll('img')[0]!.element as HTMLImageElement).src).toContain('/one.png')
    expect((bgList.findAll('img')[0]!.element as HTMLElement).style.left).toBe('12px')
  })

  it('🥩 contentStyle should change dom', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { contentStyle: { backgroundColor: 'rgb(255, 0, 0)' } },
    })

    expect(wrapper.get('.ant-pro-layout-content').attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('🥩 support className', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { className: 'custom-layout' },
    })

    expect(wrapper.find('.custom-layout').exists()).toBe(true)
  })

  it('🥩 support links', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { links: [<a href="/help">help</a>] },
    })

    expect(wrapper.find('[data-testid="pro-layout-sider-links"]').text()).toContain('help')
  })

  it('🥩 do no render links', () => {
    const wrapper = mount(ProLayout, { attachTo: document.body })

    expect(wrapper.find('[data-testid="pro-layout-sider-links"]').exists()).toBe(false)
  })

  it('🥩 pure style', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { pure: true },
      slots: { default: () => <div id="pure-content">pure</div> },
    })

    expect(wrapper.find('#pure-content').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-layout').exists()).toBe(false)
  })

  it('🥩 hideInMenu render right', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        route: {
          path: '/',
          children: [
            { path: '/welcome', name: '欢迎' },
            { path: '/hidden', name: '隐藏', hideInMenu: true },
          ],
        },
      },
    })

    expect(wrapper.text()).toContain('欢迎')
    expect(wrapper.text()).not.toContain('隐藏')
  })

  it('🥩 BasicLayout menu support menu.true', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { route: menuRoute, menu: {} },
    })

    expect(wrapper.find('nav.ant-pro-sider-menu').exists()).toBe(true)
  })

  it('🥩 BasicLayout menu support autoClose', async () => {
    const Demo = defineComponent({
      setup() {
        const pathname = ref('/admin/sub-page1')
        return () => (
          <ProLayout
            menu={{ autoClose: false }}
            location={{ pathname: pathname.value }}
            menuItemRender={(item: any, dom: any) => (
              <button
                type="button"
                onClick={() => {
                  item.onClick()
                  pathname.value = item.path || '/welcome'
                }}
              >
                {dom}
              </button>
            )}
            menuDataRender={() => [
              {
                path: '/admin',
                name: '管理页',
                children: [
                  { path: '/admin/sub-page1', name: '一级页面' },
                  { path: '/admin/sub-page2', name: '二级页面' },
                  { path: '/admin/sub-page3', name: '三级页面' },
                ],
              },
              {
                name: '列表页',
                path: '/list',
                children: [
                  { path: '/list/sub-page', name: '一级列表页面' },
                  { path: '/list/sub-page2', name: '二级列表页面' },
                  { path: 'https://ant.design', name: 'AntDesign外链' },
                ],
              },
            ]}
          />
        )
      },
    })
    const wrapper = mount(Demo, { attachTo: document.body })

    expect(wrapper.findAll('[data-pro-layout-nav-submenu]')).toHaveLength(2)
    await wrapper.findAll('[data-testid="pro-layout-nav-menu-inline-submenu-title"]').find(item => item.text().includes('列表页'))!.trigger('click')
    await nextTick()
    expect(wrapper.findAll('[data-pro-layout-nav-submenu-open]')).toHaveLength(2)
    await wrapper.findAll('button').find(item => item.text().includes('二级列表页面'))!.trigger('click')
    await wrapper.findAll('button').find(item => item.text().includes('AntDesign外链'))!.trigger('click')
    await nextTick()
    expect(wrapper.findAll('[data-pro-layout-nav-submenu]')).toHaveLength(2)
  })

  it('🥩 ProLayout support menu.ignoreFlatMenu', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        route: {
          path: '/',
          children: [{
            path: '/flat',
            name: 'flat',
            flatMenu: true,
            children: [{ path: '/flat/child', name: 'flat child' }],
          }],
        },
        menu: { ignoreFlatMenu: true },
      },
    })

    expect(wrapper.text()).toContain('flat child')
  })

  it('🥩 formatMessage support', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        route: { path: '/', children: [{ path: '/welcome', name: 'Welcome', locale: 'menu.welcome' }] },
        formatMessage: ({ id }: any) => `intl:${id}`,
      },
    })

    expect(wrapper.text()).toContain('intl:menu.welcome')
  })

  it('🥩 pure should has provide', () => {
    const Child = defineComponent({
      setup() {
        const context = useRouteContext()
        return () => <span id="route-title">{context.title}</span>
      },
    })
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { pure: true, title: 'Provided' },
      slots: { default: () => <Child /> },
    })

    expect(wrapper.get('#route-title').text()).toBe('Provided')
  })

  it('🥩 RouteContext provides full layout fields', () => {
    const Child = defineComponent({
      setup() {
        const context = useRouteContext()
        return () => (
          <div id="route-context">
            {JSON.stringify({
              title: context.title,
              contentWidth: context.contentWidth,
              layout: context.layout,
              hasSiderMenu: context.hasSiderMenu,
              isMobile: context.isMobile,
              siderWidth: context.siderWidth,
              collapsed: context.collapsed,
              fixedHeader: context.fixedHeader,
              hasHeader: context.hasHeader,
              hasFooter: context.hasFooter,
              hasFooterToolbar: context.hasFooterToolbar,
              hasPageContainer: context.hasPageContainer,
              matchMenuKeys: context.matchMenuKeys,
              currentMenu: context.currentMenu?.path,
              pageTitleInfo: context.pageTitleInfo?.title,
              menuDataLength: context.menuData?.length,
            })}
          </div>
        )
      },
    })
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        fixedHeader: true,
        collapsed: true,
        route: { children: [{ path: '/welcome', name: '欢迎' }] },
        location: { pathname: '/welcome' },
      },
      slots: { default: () => <Child /> },
    })

    const context = JSON.parse(wrapper.get('#route-context').text())
    expect(context).toMatchObject({
      title: '欢迎',
      contentWidth: 'Fluid',
      layout: 'side',
      hasSiderMenu: true,
      isMobile: false,
      siderWidth: 64,
      collapsed: true,
      fixedHeader: true,
      hasHeader: true,
      hasFooter: true,
      hasFooterToolbar: false,
      hasPageContainer: 0,
      matchMenuKeys: ['/welcome'],
      currentMenu: '/welcome',
      pageTitleInfo: '欢迎',
      menuDataLength: 1,
    })
  })

  it('🥩 siderMenu should restore openKeys when collapsed is false', async () => {
    const Demo = defineComponent({
      setup() {
        const collapsed = ref(false)
        return { collapsed }
      },
      render() {
        return <ProLayout {...bigDefaultProps} location={{ pathname: '/list/sub-page/sub-sub-page1' }} collapsed={this.collapsed} />
      },
    })
    const wrapper = mount(Demo, { attachTo: document.body })

    expect(wrapper.findAll('[data-pro-layout-nav-submenu-open]')).toHaveLength(2)
    ;(wrapper.vm as any).collapsed = true
    await nextTick()
    ;(wrapper.vm as any).collapsed = false
    await nextTick()
    expect(wrapper.findAll('[data-pro-layout-nav-submenu-open]')).toHaveLength(2)
  })

  it('🐞 horizontal popup: second-level leaf should have item--selected class', async () => {
    mount(TopNavHeader, {
      attachTo: document.body,
      props: {
        layout: 'top',
        location: { pathname: '/account/user' },
        matchMenuKeys: ['/account/user'],
        menuData: [
          {
            path: '/account',
            name: '账户',
            children: [{ path: '/account/user', name: '用户管理' }],
          },
        ],
      },
    })

    document.body.querySelector<HTMLElement>('[data-testid="pro-layout-nav-menu-popup-submenu-title"]')?.click()
    await waitFor(() => {
      expect(document.body.querySelector('.ant-pro-base-menu-horizontal-item--selected')?.textContent).toContain('用户管理')
    })
  })

  it('🥩 top + Fixed: PageContainer wraps header and grid in top-fixed-slot', () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: { layout: 'top', contentWidth: 'Fixed' },
      slots: { default: () => <PageContainer title="name">content</PageContainer> },
    })

    const slot = wrapper.get('[data-testid="pro-page-container-top-fixed-slot"]')
    expect(slot.find('[data-testid="pro-page-header"]').exists()).toBe(true)
    expect(slot.find('[data-testid="pro-grid-content"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('content')
  })

  it('🥩 SiderMenu/Header/TopNavHeader support prefix, stylish and className', () => {
    const siderWrapper = mount(SiderMenu, {
      attachTo: document.body,
      props: {
        prefixCls: 'custom-pro',
        className: 'custom-sider',
        stylish: () => ({ color: 'red' }),
        menuData: [{ path: '/welcome', name: '欢迎' }],
        matchMenuKeys: [],
      },
    })
    expect(siderWrapper.find('.custom-pro-sider.custom-sider.custom-pro-sider-stylish').exists()).toBe(true)
    expect(siderWrapper.find('nav.custom-pro-base-menu-vertical').exists()).toBe(true)

    const headerWrapper = mount(DefaultHeader, {
      attachTo: document.body,
      props: {
        prefixCls: 'custom-pro',
        className: 'custom-header',
        stylish: () => ({ color: 'red' }),
        layout: 'side',
        matchMenuKeys: [],
      },
    })
    expect(headerWrapper.find('.custom-pro-layout-header.custom-header.custom-pro-layout-header-stylish').exists()).toBe(true)

    const topWrapper = mount(TopNavHeader, {
      attachTo: document.body,
      props: {
        prefixCls: 'custom-pro',
        className: 'custom-top',
        layout: 'top',
        menuData: [{ path: '/welcome', name: '欢迎' }],
        matchMenuKeys: [],
      },
    })
    expect(topWrapper.find('.custom-pro-top-nav-header.custom-top').exists()).toBe(true)
    expect(topWrapper.find('nav.custom-pro-base-menu-horizontal').exists()).toBe(true)
  })

  it('uses getPrefixCls("pro") from antd config', () => {
    const wrapper = mount({
      render: () => (
        <ConfigProvider prefixCls="acme">
          <ProLayout pure={false}>welcome</ProLayout>
        </ConfigProvider>
      ),
    }, { attachTo: document.body })

    expect(wrapper.find('.acme-pro-layout').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-basicLayout').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-layout').exists()).toBe(false)
  })
})
