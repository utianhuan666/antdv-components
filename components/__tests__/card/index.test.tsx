import { mount } from '@vue/test-utils'
import { ConfigProvider } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import { ProCard, Statistic, StatisticCard } from '../../card'
import { ProConfigProvider } from '../../provider'
import { waitFor } from '../testUtils'

function withProvider(node: any) {
  return <ProConfigProvider>{node}</ProConfigProvider>
}

describe('card', () => {
  it('renders without ProConfigProvider', () => {
    const wrapper = mount({
      render: () => <ProCard title="direct">content</ProCard>,
    })

    expect(wrapper.find('.ant-pro-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('direct')
    expect(wrapper.text()).toContain('content')
  })

  it('🥩 collapsible onCollapse', async () => {
    const fn = vi.fn()

    const wrapper = mount({
      render: () => (
        withProvider(
          <ProCard title="父节点">
            <ProCard
              title="可折叠"
              headerBordered
              collapsible
              defaultCollapsed
              onCollapse={fn}
              colSpan={{ xs: 24 }}
            >
              内容
            </ProCard>
          </ProCard>,
        )
      ),
    })

    expect(wrapper.text()).toContain('可折叠')

    await wrapper.find('.ant-pro-card-collapsible-icon').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalled()
    })
  })

  it('🥩 collapsible defaultCollapsed', () => {
    const wrapper = mount({
      render: () => (
        withProvider(
          <ProCard title="可折叠" headerBordered collapsible defaultCollapsed>
            内容
          </ProCard>,
        )
      ),
    })

    expect(wrapper.text()).toContain('可折叠')
    expect(wrapper.find('.ant-pro-card-collapse').exists()).toBe(true)
  })

  it('🥩 collapsible collapsed', async () => {
    const title = ref('可折叠')
    const collapsed = ref(true)
    const wrapper = mount({
      render: () => {
        return (
          withProvider(
            <ProCard title={title.value} headerBordered collapsed={collapsed.value}>
              内容
            </ProCard>,
          )
        )
      },
    })

    expect(wrapper.text()).toContain('可折叠')
    expect(wrapper.find('.ant-pro-card-collapse').exists()).toBe(true)

    title.value = '可打开'
    collapsed.value = false
    await nextTick()

    expect(wrapper.text()).toContain('可打开')
    expect(wrapper.find('.ant-pro-card-collapse').exists()).toBe(false)
  })

  it('🥩 collapsible icon custom render with defaultCollapsed', () => {
    const wrapper = mount({
      render: () => (
        withProvider(
          <ProCard
            title="可折叠-图标自定义"
            collapsibleIconRender={({ collapsed }: { collapsed: boolean }) => h('span', collapsed ? '更多' : '收起')}
            headerBordered
            defaultCollapsed
            collapsible
          >
            内容
          </ProCard>,
        )
      ),
    })

    expect(wrapper.text()).toContain('可折叠-图标自定义')
    expect(wrapper.find('.ant-pro-card-collapse').exists()).toBe(true)
    expect(wrapper.text()).toContain('更多')
  })

  it('🥩 collapsible icon custom render', async () => {
    const wrapper = mount({
      render: () => (
        withProvider(
          <ProCard
            title="可折叠-图标自定义"
            collapsibleIconRender={({ collapsed }: { collapsed: boolean }) => h('span', collapsed ? '更多' : '收起')}
            defaultCollapsed={false}
            collapsible
            extra={<div><span>操作</span></div>}
          >
            内容
          </ProCard>,
        )
      ),
    })

    expect(wrapper.text()).toContain('可折叠-图标自定义')
    expect(wrapper.find('.ant-pro-card').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card-collapse').exists()).toBe(false)
    expect(wrapper.text()).toContain('收起')

    await wrapper.find('.ant-pro-card-extra').trigger('click')
  })

  it('🥩 collapsible icon mode with custom icon render', async () => {
    const fn = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <ProCard
            title="仅图标可折叠"
            collapsibleIconRender={({ collapsed }: { collapsed: boolean }) => h('span', collapsed ? '展开' : '收起')}
            collapsible="icon"
            defaultCollapsed
            onCollapse={fn}
          >
            内容
          </ProCard>,
        )
      ),
    })

    expect(wrapper.text()).toContain('仅图标可折叠')
    expect(wrapper.find('.ant-pro-card-collapse').exists()).toBe(true)

    await wrapper.find('.ant-pro-card-collapsible-icon').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(false)
    })
  })

  it('🥩 collapsible icon custom render with controlled collapsed', async () => {
    const fn = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <ProCard
            title="可折叠-受控模式"
            collapsibleIconRender={({ collapsed }: { collapsed: boolean }) => h('span', collapsed ? '更多' : '收起')}
            headerBordered
            collapsible
            collapsed
            onCollapse={fn}
          >
            内容
          </ProCard>,
        )
      ),
    })

    expect(wrapper.text()).toContain('可折叠-受控模式')
    expect(wrapper.find('.ant-pro-card-collapse').exists()).toBe(true)
    expect(wrapper.text()).toContain('更多')

    await wrapper.find('.ant-pro-card-collapsible-icon').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(false)
    })
  })

  it('🥩 tabs onChange', async () => {
    const fn = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <ProCard
            tabs={{
              onChange: fn,
              items: [
                { label: 'tab1', key: 'tab1', children: '产品一' },
                { label: 'tab2', key: 'tab2', children: '产品二' },
              ],
            }}
          />,
        )
      ),
    })

    await nextTick()
    await wrapper.findAll('.ant-pro-card-tabs .ant-tabs-tab')[1]!.trigger('click')

    expect(fn).toHaveBeenCalledWith('tab2')
  })

  it('🥩 divider orientation follows react api', () => {
    const wrapper = mount({
      render: () => withProvider(<ProCard.Divider />),
    })

    expect(wrapper.find('.ant-pro-card-divider').classes()).toContain('ant-pro-card-divider-vertical')
  })

  it('🥩 loading renders block skeleton', () => {
    const wrapper = mount({
      render: () => withProvider(<ProCard loading />),
    })

    expect(wrapper.find('.ant-pro-card-loading-content').exists()).toBe(true)
    expect(wrapper.findAll('.ant-pro-card-loading-block')).toHaveLength(10)
    expect(wrapper.html()).not.toContain('[object Object]-loading-block')
  })

  it('uses getPrefixCls("pro-card") from antd config', () => {
    const wrapper = mount({
      render: () => (
        <ConfigProvider prefixCls="acme">
          <ProConfigProvider>
            <ProCard title="prefix">内容</ProCard>
          </ProConfigProvider>
        </ConfigProvider>
      ),
    })

    expect(wrapper.find('.acme-pro-card').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card').exists()).toBe(false)
  })

  it('supports semantic classNames and styles', () => {
    const wrapper = mount({
      render: () => withProvider(
        <ProCard
          classNames={{
            root: 'root-class',
            body: 'body-class',
          }}
          styles={{
            body: { padding: '0px' },
          }}
          actions={[<span class="action-one">Action</span>]}
        >
          内容
        </ProCard>,
      ),
    })

    expect(wrapper.find('.ant-pro-card').classes()).toContain('root-class')
    expect(wrapper.find('.ant-pro-card-body').classes()).toContain('body-class')
    expect(wrapper.find('.ant-pro-card-body').attributes('style')).toContain('padding: 0px')
    expect(wrapper.find('.action-one').text()).toBe('Action')
  })

  it('renders actions with react-compatible item structure', () => {
    const wrapper = mount({
      render: () => withProvider(
        <ProCard
          actions={[
            <button class="action-one">One</button>,
            null,
            <button class="action-two">Two</button>,
          ]}
        >
          内容
        </ProCard>,
      ),
    })

    const items = wrapper.findAll('.ant-pro-card-actions-item')
    expect(items).toHaveLength(3)
    expect(items[0]!.attributes('style')).toContain('width: 33.333')
    expect(items[0]!.attributes('style')).toContain('padding: 0px')
    expect(items[0]!.attributes('style')).toContain('margin: 0px')
    expect(items[0]!.element.firstElementChild?.tagName).toBe('BUTTON')
    expect(items[1]!.text()).toBe('')
    expect(items[2]!.element.firstElementChild?.tagName).toBe('BUTTON')
  })

  it('does not apply inactive responsive colSpan classes', () => {
    const wrapper = mount({
      render: () => withProvider(
        <ProCard wrap>
          <ProCard colSpan={{ xxl: 4, xl: 8 }}>
            子卡片
          </ProCard>
        </ProCard>,
      ),
    })

    const col = wrapper.find('.ant-pro-card-col')
    expect(col.exists()).toBe(true)
    expect(col.classes()).not.toContain('ant-pro-card-col-4')
    expect(col.classes()).not.toContain('ant-pro-card-col-8')
  })

  it('adds default padding to loading placeholder when body padding is zero', () => {
    const wrapper = mount({
      render: () => withProvider(<ProCard loading styles={{ body: { padding: 0 } }} />),
    })

    expect(wrapper.find('.ant-pro-card-loading-content').attributes('style')).toContain('padding')
  })

  it('does not add loading padding when body padding is not zero', () => {
    const wrapper = mount({
      render: () => withProvider(<ProCard loading styles={{ body: { padding: 8 } }} />),
    })

    expect(wrapper.find('.ant-pro-card-loading-content').attributes('style') || '').not.toContain('padding')
  })

  it('follows react truthy rendering for card header and cover', () => {
    const titleWrapper = mount({
      render: () => withProvider(<ProCard title={0}>content</ProCard>),
    })
    const coverWrapper = mount({
      render: () => withProvider(<ProCard cover={0}>content</ProCard>),
    })

    expect(titleWrapper.find('.ant-pro-card-header').exists()).toBe(false)
    expect(coverWrapper.find('.ant-pro-card-cover').exists()).toBe(false)
  })

  it('injects tabs placement styles compatible with react', () => {
    mount({
      render: () => withProvider(
        <ProCard
          tabs={{
            tabPlacement: 'left',
            items: [{ label: 'tab1', key: 'tab1', children: '产品一' }],
          }}
        />,
      ),
    })

    const styleText = Array.from(document.querySelectorAll('style'))
      .map(style => style.textContent || '')
      .join('\n')
    expect(styleText).toContain('tabs-left')
    expect(styleText).toContain('tabs-right')
    expect(styleText).toContain('tabs-bottom')
  })

  it('renders Statistic with react-compatible status, tip, icon, and trend structure', () => {
    const wrapper = mount({
      render: () => withProvider(
        <Statistic
          title="指标"
          value={12}
          tip="说明"
          status="success"
          trend="up"
          icon={<span class="custom-icon">I</span>}
          prefix="¥"
        />,
      ),
    })

    expect(wrapper.find('.ant-pro-card-statistic-layout-inline').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card-statistic-tip').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card-statistic-status .ant-badge-status-dot').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card-statistic-icon .custom-icon').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card-statistic-trend-icon-up').exists()).toBe(true)
  })

  it('renders Statistic layouts with react class names', () => {
    const wrapper = mount({
      render: () => withProvider(
        <>
          <Statistic value={1} layout="horizontal" />
          <Statistic value={2} layout="vertical" />
          <Statistic value={3} layout="inline" />
        </>,
      ),
    })

    expect(wrapper.find('.ant-pro-card-statistic-layout-horizontal').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card-statistic-layout-vertical').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-card-statistic-layout-inline').exists()).toBe(true)
  })

  it('does not leak StatisticCard private props to ProCard root dom', () => {
    const wrapper = mount({
      render: () => withProvider(
        <StatisticCard
          statistic={{ title: '销售额', value: 100 }}
          chart={<div class="chart">chart</div>}
          footer={<div class="footer">footer</div>}
          chartPlacement="left"
        />,
      ),
    })

    const cardAttrs = wrapper.find('.ant-pro-card').attributes()
    expect(cardAttrs).not.toHaveProperty('statistic')
    expect(cardAttrs).not.toHaveProperty('chart')
    expect(cardAttrs).not.toHaveProperty('footer')
    expect(cardAttrs).not.toHaveProperty('chartplacement')
    expect(wrapper.find('.chart').exists()).toBe(true)
    expect(wrapper.find('.footer').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-statistic-card-content').element.firstElementChild?.className).toContain('chart')
  })

  it('follows react truthy rendering for StatisticCard footer', () => {
    const wrapper = mount({
      render: () => withProvider(<StatisticCard footer={0} />),
    })

    expect(wrapper.find('.ant-pro-statistic-card-footer').exists()).toBe(false)
  })
})
