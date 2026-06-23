import { mount } from '@vue/test-utils'
import { Skeleton } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { FooterToolbar } from '../../layout/components/FooterToolbar'
import { PageContainer } from '../../layout/components/PageContainer'
import { RouteContextProvider } from '../../layout/components/PageContainer/context'
import { ProConfigProvider } from '../../provider'
import { waitFor } from '../testUtils'

function mountAttached(component: any) {
  return mount(component, { attachTo: document.body })
}

function withProvider(node: any) {
  return <ProConfigProvider>{node}</ProConfigProvider>
}

describe('pageContainer', () => {
  it('💄 base use', async () => {
    const wrapper = mount({
      render: () => <PageContainer title="期贤" />,
    })

    expect(wrapper.find('.ant-page-header-heading-title').text()).toBe('期贤')
    expect(wrapper.find('.ant-pro-page-container').exists()).toBe(true)
    expect(wrapper.find('.ant-page-header').exists()).toBe(true)
  })

  it('💄 config is null', async () => {
    const wrapper = mount({
      render: () => <PageContainer />,
    })

    expect(wrapper.find('.ant-pro-page-container').exists()).toBe(true)
  })

  it('💄 title,ghost,header,breadcrumbRender = false', async () => {
    const wrapper = mount({
      render: () => (
        <PageContainer
          title={false}
          ghost={false}
          header={undefined}
          breadcrumbRender={false}
        >
          qixian
        </PageContainer>
      ),
    })

    expect(wrapper.findAll('.ant-page-header')).toHaveLength(0)
  })

  it('💄 has PageContainer className', async () => {
    const count = ref(0)
    const state = ref(0)
    const Demo = defineComponent({
      setup() {
        return () => (
          <RouteContextProvider
            value={{
              setHasPageContainer: (updater: (num: number) => number) => {
                count.value = updater(count.value)
              },
            }}
          >
            <button
              type="button"
              onClick={() => {
                state.value += 1
              }}
            >
              切换
            </button>
            {state.value > 0 && state.value < 3
              ? (
                  <PageContainer title={false} ghost={false} header={undefined} breadcrumbRender={false}>
                    qixian
                  </PageContainer>
                )
              : null}
            {state.value > 1 && state.value < 4
              ? (
                  <PageContainer title={false} ghost={false} header={undefined} breadcrumbRender={false}>
                    qixian2
                  </PageContainer>
                )
              : null}
          </RouteContextProvider>
        )
      },
    })
    const wrapper = mountAttached(Demo)

    expect(count.value).toBe(0)
    await wrapper.find('button').trigger('click')
    expect(count.value).toBe(1)
    await wrapper.find('button').trigger('click')
    expect(count.value).toBe(2)
    await wrapper.find('button').trigger('click')
    expect(count.value).toBe(1)
    await wrapper.find('button').trigger('click')
    expect(count.value).toBe(0)
  })

  it('💄 pageContainer support breadcrumbRender', async () => {
    const wrapper = mount({
      render: () => (
        <PageContainer breadcrumbRender={() => <div>这里是面包屑</div>}>
          content
        </PageContainer>
      ),
    })

    expect(wrapper.find('.ant-page-header-has-breadcrumb div').text()).toBe('这里是面包屑')
  })

  it('💄 pageContainer support tabBarExtraContent', async () => {
    const wrapper = mount({
      render: () => <PageContainer tabBarExtraContent="测试">content</PageContainer>,
    })

    expect(wrapper.find('.ant-tabs-extra-content').text()).toContain('测试')
  })

  it('⚡️ support footer', async () => {
    const wrapper = mountAttached({
      render: () => (
        <PageContainer
          title="期贤"
          footer={[
            <button type="button" key="button">
              right
            </button>,
          ]}
          footerToolBarProps={{ portalDom: false }}
        />
      ),
    })

    expect(wrapper.findAll('.ant-pro-page-container-with-footer')).toHaveLength(1)
    const footerBar = wrapper.find('.ant-pro-footer-bar')
    expect(footerBar.exists()).toBe(true)
    expect(footerBar.text()).toContain('right')
  })

  it('⚡️ support fixedHeader', async () => {
    const wrapper = mount({
      render: () => <PageContainer title="期贤" fixedHeader />,
    })

    expect(wrapper.find('.ant-page-header-heading-title').text()).toBe('期贤')
  })

  it('⚡️ support loading', async () => {
    const wrapper = mount({
      render: () => <PageContainer title="期贤" loading={<Skeleton />} />,
    })

    expect(wrapper.find('.ant-skeleton').exists()).toBe(true)
  })

  it('⚡️ support more loading props', async () => {
    const wrapper = mount({
      render: () => (
        <PageContainer
          title="期贤"
          loading={{ spinning: true, tip: '加载中' }}
        />
      ),
    })

    expect(wrapper.find('.ant-spin').exists()).toBe(true)
    expect(wrapper.find('.ant-spin-spinning').exists()).toBe(true)
    expect(wrapper.text().replace(/\s/g, '')).toContain('加载中')
  })

  it('🔥 support footer and breadcrumb', async () => {
    const wrapper = mountAttached({
      render: () => (
        <PageContainer
          title="期贤"
          breadcrumb={{
            items: [
              {
                path: '/',
                title: 'home',
              },
            ],
          }}
          footer={[
            <button key="right" type="button">
              right
            </button>,
          ]}
          footerToolBarProps={{ portalDom: false }}
        />
      ),
    })

    expect(wrapper.find('.ant-breadcrumb').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-footer-bar').exists()).toBe(true)
    expect(wrapper.find('.ant-breadcrumb').text()).toContain('home')
  })

  it('🔥 footer bar support extra', async () => {
    const wrapper = mount({
      render: () => (
        withProvider(
          <FooterToolbar
            className="qixian_footer"
            portalDom={false}
            extra={<img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="logo" />}
          >
            <button key="button" type="button">
              right
            </button>
          </FooterToolbar>,
        )
      ),
    })

    expect(wrapper.find('.qixian_footer').exists()).toBe(true)
    expect(wrapper.find('img[alt="logo"]').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('🔥 footer bar support renderContent', async () => {
    const wrapper = mount({
      render: () => (
        withProvider(
          <FooterToolbar
            className="qixian_footer"
            portalDom={false}
            extra={<img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" alt="logo" />}
            renderContent={() => 'home_toolbar'}
          >
            <button key="button" type="button">
              right
            </button>
          </FooterToolbar>,
        )
      ),
    })

    expect(wrapper.text()).toContain('home_toolbar')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('🐲 footer should know width', async () => {
    const route = ref<any>({ hasSiderMenu: true, siderWidth: 235, isMobile: false, layout: 'side' })
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={route.value}>
          <PageContainer
            title="期贤"
            footer={[
              <button type="button" key="button">
                qixian
              </button>,
            ]}
            footerToolBarProps={{ portalDom: false }}
          />
        </RouteContextProvider>
      ),
    })

    expect((wrapper.find('.ant-pro-footer-bar').element as HTMLElement).style.width).toBe('calc(100% - 235px)')

    route.value = { hasSiderMenu: true, siderWidth: 64, isMobile: false, layout: 'side' } as any
    await nextTick()
    expect((wrapper.find('.ant-pro-footer-bar').element as HTMLElement).style.width).toBe('calc(100% - 64px)')

    route.value = { hasSiderMenu: false, siderWidth: undefined, isMobile: false, layout: 'top' } as any
    await nextTick()
    expect((wrapper.find('.ant-pro-footer-bar').element as HTMLElement).style.width).toBe('')
    expect(wrapper.find('.ant-pro-footer-bar').text()).toContain('qixian')
  })

  it('🐲 FooterToolbar should know width', async () => {
    const route = ref<any>({ hasSiderMenu: true, siderWidth: 235, isMobile: false, layout: 'side' })
    const wrapper = mount({
      render: () => (
        <RouteContextProvider value={route.value}>
          <PageContainer>
            <FooterToolbar
              portalDom={false}
              stylish={() => ({
                height: '100%',
              })}
            >
              <button type="button" key="button">
                qixian
              </button>
            </FooterToolbar>
          </PageContainer>
        </RouteContextProvider>
      ),
    })

    expect((wrapper.find('.ant-pro-footer-bar').element as HTMLElement).style.width).toBe('calc(100% - 235px)')

    route.value = { hasSiderMenu: true, siderWidth: 64, isMobile: false, layout: 'side' } as any
    await nextTick()
    expect((wrapper.find('.ant-pro-footer-bar').element as HTMLElement).style.width).toBe('calc(100% - 64px)')

    route.value = { hasSiderMenu: true, siderWidth: undefined, isMobile: false, layout: 'top' } as any
    await nextTick()
    expect((wrapper.find('.ant-pro-footer-bar').element as HTMLElement).style.width).toBe('100%')
    expect(wrapper.find('.ant-pro-footer-bar').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('qixian')

    wrapper.unmount()
  })

  it('🐲 footer is null, do not render footerToolbar ', async () => {
    const showFooter = ref(true)
    const wrapper = mount({
      render: () => (
        <PageContainer
          footer={showFooter.value
            ? [
                <button type="button" key="button">
                  qixian
                </button>,
              ]
            : undefined}
          footerToolBarProps={{ portalDom: false }}
        />
      ),
    })

    expect(wrapper.find('.ant-pro-footer-bar').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('qixian')

    showFooter.value = false
    await nextTick()
    expect(wrapper.find('.ant-pro-footer-bar').exists()).toBe(false)
  })

  it('🐲 pro-layout support breadcrumbProps', async () => {
    const wrapper = mount({
      render: () => (
        <RouteContextProvider
          value={{
            breadcrumbProps: {
              separator: '>',
              items: [
                { path: 'index', title: 'home' },
                { path: 'first', title: 'first' },
                { path: 'second', title: 'second' },
              ],
            },
          }}
        >
          <PageContainer />
        </RouteContextProvider>
      ),
    })

    const breadcrumb = wrapper.find('.ant-breadcrumb')
    expect(breadcrumb.exists()).toBe(true)
    expect(breadcrumb.text()).toContain('home')
    expect(breadcrumb.text()).toContain('first')
    expect(breadcrumb.text()).toContain('second')
    expect(wrapper.findAll('.ant-breadcrumb-separator').length).toBeGreaterThan(0)
  })

  it('🐲 header.footer is null, do not render footerToolbar ', async () => {
    const showFooter = ref(true)
    const wrapper = mount({
      render: () => (
        <PageContainer
          footer={showFooter.value
            ? [
                <button type="button" key="button">
                  qixian
                </button>,
              ]
            : undefined}
          footerToolBarProps={{ portalDom: false }}
        />
      ),
    })

    expect(wrapper.find('.ant-pro-footer-bar').exists()).toBe(true)

    showFooter.value = false
    await nextTick()

    expect(wrapper.find('.ant-pro-footer-bar').exists()).toBe(false)
  })

  it('🐲 tabList and onTabChange is run', async () => {
    const fn = vi.fn()
    const wrapper = mount({
      render: () => (
        <PageContainer
          title="标题"
          onTabChange={fn}
          tabProps={{
            type: 'card',
          }}
          tabList={[
            {
              tab: '基本信息',
              key: 'base',
            },
            {
              tab: '详细信息',
              key: 'info',
            },
          ]}
        />
      ),
    })

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('info')
    })
  })

  it('🐲 content is text and title is null', () => {
    const wrapper = mount({
      render: () => <PageContainer content="just so so" />,
    })

    expect(wrapper.text()).toContain('just so so')
    expect(wrapper.find('.ant-page-header-heading-title').exists()).toBe(false)

    const wrapper2 = mount({
      render: () => <PageContainer extraContent={<div>extraContent</div>} />,
    })

    expect(wrapper2.text()).toContain('extraContent')
  })

  it('🐛 className prop should not be passed to its page header, fix #3493', async () => {
    const wrapper = mount({
      render: () => (
        <PageContainer
          className="custom-className"
          header={{
            title: '页面标题',
          }}
        />
      ),
    })

    expect(wrapper.findAll('.custom-className')).toHaveLength(1)
    expect(wrapper.find('.ant-page-header').classes()).not.toContain('custom-className')
    expect(wrapper.find('.ant-page-header-heading-title').text()).toBe('页面标题')
  })

  it('🌛 PageContainer with custom loading', async () => {
    const loading = ref<any>((
      <div id="customLoading" style={{ color: 'red', padding: '30px', textAlign: 'center' }}>
        自定义加载...
      </div>
    ))
    const App = defineComponent({
      setup() {
        setTimeout(() => {
          loading.value = false
        }, 100)
        return () => (
          <PageContainer
            loading={loading.value}
            className="custom-className"
            header={{
              title: '页面标题',
            }}
          />
        )
      },
    })

    const wrapper = mount(App)
    expect(wrapper.findAll('#customLoading')).toHaveLength(1)
    expect(wrapper.text()).toContain('自定义加载...')

    await waitFor(() => {
      expect(wrapper.findAll('#customLoading')).toHaveLength(0)
    })
  })

  it('🐛 breadcrumbRender and restProps?.header?.breadcrumbRender', async () => {
    const disabled = ref(true)
    const wrapper = mount({
      render: () => (
        <PageContainer
          className="custom-className"
          breadcrumbRender={disabled.value ? false : undefined}
          header={{
            breadcrumbRender: () => 'diss',
          }}
        />
      ),
    })

    expect(wrapper.find('.ant-page-header-has-breadcrumb').exists()).toBe(false)

    disabled.value = false
    await nextTick()

    expect(wrapper.find('.ant-page-header-has-breadcrumb').html()).toContain('diss')
  })
})
