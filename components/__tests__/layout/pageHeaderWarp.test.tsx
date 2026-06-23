import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { PageContainer } from '../../layout/components/PageContainer'
import { RouteContextProvider } from '../../layout/components/PageContainer/context'
import { ProLayout } from '../../layout/ProLayout'

describe('basicLayout', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  const defaultLayoutProps = {
    route: {
      path: '/',
      children: [
        {
          path: '/',
          name: 'welcome',
          children: [{ path: '/welcome', name: 'one' }],
        },
      ],
    },
    location: { pathname: '/' },
  }

  it('base use', () => {
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={{ title: 'welcome' }}>
          <PageContainer />
        </RouteContextProvider>
      ),
    })

    expect(wrapper.find('.ant-pro-page-container').exists()).toBe(true)
    expect(wrapper.find('.ant-page-header').exists()).toBe(true)
  })

  it('content is text', () => {
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={{ title: 'welcome' }}>
          <PageContainer content="just so so" />
        </RouteContextProvider>
      ),
    })

    expect(wrapper.text()).toContain('just so so')
    expect(wrapper.find('.ant-page-header-content').exists()).toBe(true)
  })

  it('title=false, don not render title view', async () => {
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={{ title: 'welcome' }}>
          <PageContainer title={false} />
        </RouteContextProvider>
      ),
    })

    expect(wrapper.findAll('.ant-page-header-heading-title')).toHaveLength(0)
  })

  it('have default title', async () => {
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={{ title: 'welcome' }}>
          <PageContainer />
        </RouteContextProvider>
      ),
    })

    expect(wrapper.find('.ant-page-header-heading-title').text()).toEqual('welcome')
  })

  it('title overrides the default title', async () => {
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={{ title: 'welcome' }}>
          <PageContainer title="name" />
        </RouteContextProvider>
      ),
    })

    expect(wrapper.find('.ant-page-header-heading-title').text()).toEqual('name')
  })

  it('with default prefixCls props TopNavHeader', async () => {
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        ...defaultLayoutProps,
        layout: 'side',
        splitMenus: true,
        headerContentRender: () => <span />,
      },
      slots: { default: () => <PageContainer title="name" /> },
    })

    await wrapper.setProps({
      layout: 'side',
      splitMenus: true,
      headerContentRender: () => <span />,
    })

    expect(wrapper.find('.ant-pro-top-nav-header-menu').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-top-nav-header-logo').exists()).toBe(false)
  })

  it('without custom prefixCls props TopNavHeader', () => {
    const prefixCls = 'ant-oh-pro'
    const wrapper = mount(ProLayout, {
      attachTo: document.body,
      props: {
        ...defaultLayoutProps,
        layout: 'top',
        prefixCls,
      },
      slots: { default: () => <PageContainer title="name" /> },
    })

    expect(wrapper.find(`.${prefixCls}-top-nav-header-logo`).exists()).toBe(true)
  })

  it('pageHeaderRender return false', async () => {
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={{ title: 'welcome' }}>
          <PageContainer title="name" pageHeaderRender={() => null} />
        </RouteContextProvider>
      ),
    })

    expect(wrapper.find('.ant-page-header').exists()).toBe(false)
  })

  it('pageHeaderRender is false', async () => {
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={{ title: 'welcome' }}>
          <PageContainer title="name" pageHeaderRender={false} />
        </RouteContextProvider>
      ),
    })

    expect(wrapper.find('.ant-page-header').exists()).toBe(false)
  })
})
