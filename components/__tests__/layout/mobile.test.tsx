import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GlobalHeader } from '../../layout/components/GlobalHeader'
import { SiderMenu } from '../../layout/components/SiderMenu'

describe('mobile BasicLayout', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  const mobileMenuData = [
    {
      path: '/',
      name: 'welcome',
      children: [{ path: '/welcome', name: 'one' }],
    },
  ]

  it('📱 base use', () => {
    mount(SiderMenu, {
      attachTo: document.body,
      props: {
        isMobile: true,
        collapsed: false,
        getContainer: false,
        matchMenuKeys: ['/'],
        menuData: mobileMenuData,
      },
    })

    expect(document.body.querySelector('[data-testid="pro-layout-sider"]')).toBeTruthy()
    expect(document.body.querySelector('.ant-pro-drawer-sider')).toBeTruthy()
    expect(document.body.textContent).toContain('welcome')
  })

  it('📱 collapsed=false', () => {
    mount(SiderMenu, {
      attachTo: document.body,
      props: {
        isMobile: true,
        collapsed: false,
        getContainer: false,
        matchMenuKeys: ['/'],
        menuData: mobileMenuData,
      },
    })

    expect(document.body.textContent).toContain('welcome')
    expect(document.body.querySelector('.ant-pro-sider-collapsed')).toBeFalsy()
    expect(document.body.querySelector('[data-testid="pro-layout-sider-collapsed-button"]')).toBeTruthy()
  })

  it('📱 layout menuHeaderRender=false', () => {
    mount(SiderMenu, {
      attachTo: document.body,
      props: {
        isMobile: true,
        collapsed: false,
        matchMenuKeys: [],
        menuHeaderRender: false,
      },
      slots: { default: () => 'welcome' },
    })

    expect(document.body.textContent).not.toContain('Ant Design')
  })

  it('📱 layout menuHeaderRender', () => {
    mount(SiderMenu, {
      attachTo: document.body,
      props: {
        isMobile: true,
        collapsed: false,
        matchMenuKeys: [],
        menuHeaderRender: () => 'title',
      },
    })

    expect(document.body.textContent).toContain('title')
  })

  it('📱 layout menuHeaderRender with custom title', () => {
    mount(SiderMenu, {
      attachTo: document.body,
      props: {
        isMobile: true,
        collapsed: false,
        title: 'Custom',
        matchMenuKeys: [],
        menuHeaderRender: () => 'title',
      },
    })

    expect(document.body.textContent).toContain('title')
  })

  it('📱 layout collapsedButtonRender', async () => {
    const onCollapse = vi.fn()
    const wrapper = mount(GlobalHeader, {
      attachTo: document.body,
      props: {
        isMobile: true,
        collapsed: false,
        onCollapse,
      },
    })

    await wrapper.get('[data-testid="pro-layout-global-header-collapsed-button"]').trigger('click')
    expect(onCollapse).toHaveBeenCalledWith(true)
  })
})
