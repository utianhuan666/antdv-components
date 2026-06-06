import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { ProLayout, useRouteContext } from '../../layout'
import { GlobalHeader } from '../../layout/components/GlobalHeader'
import { SiderMenu } from '../../layout/components/SiderMenu'
import { waitFor } from '../testUtils'

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

  it('📱 ProLayout follows breakpoint and disableMobile', async () => {
    const originalMatchMedia = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query.includes('max-width: 575px'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const Child = defineComponent({
      setup() {
        const context = useRouteContext()
        return () => <span id="is-mobile">{String(context.isMobile)}</span>
      },
    })

    try {
      const wrapper = mount(ProLayout, {
        attachTo: document.body,
        props: {
          route: { children: mobileMenuData },
          getContainer: false,
        },
        slots: { default: () => <Child /> },
      })

      await waitFor(() => {
        expect(wrapper.get('#is-mobile').text()).toBe('true')
      })
      expect(wrapper.find('.ant-pro-drawer-sider').exists()).toBe(true)

      await wrapper.setProps({ disableMobile: true })
      await waitFor(() => {
        expect(wrapper.get('#is-mobile').text()).toBe('false')
      })
      expect(wrapper.find('.ant-pro-drawer-sider').exists()).toBe(false)
    }
    finally {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: originalMatchMedia,
      })
    }
  })
})
