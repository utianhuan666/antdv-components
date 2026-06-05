import { ProCard, ProConfigProvider } from '@antdv/components'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import { waitFor } from '../testUtils'

function withProvider(node: any) {
  return <ProConfigProvider>{node}</ProConfigProvider>
}

describe('card', () => {
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
    expect(wrapper.findAll('.ant-pro-card-loading-block').length).toBeGreaterThan(0)
  })
})
