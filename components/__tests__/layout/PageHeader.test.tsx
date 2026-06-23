import { mount } from '@vue/test-utils'
import { Breadcrumb, ConfigProvider } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { PageHeader } from '../../layout/components/PageHeader'
import { ProConfigProvider } from '../../provider'

function withProvider(node: any) {
  return <ProConfigProvider>{node}</ProConfigProvider>
}

describe('pageContainer', () => {
  it('💄 base use', async () => {
    const wrapper = mount({
      render: () => withProvider(<PageHeader title="期贤" />),
    })

    expect(wrapper.find('.ant-page-header-heading-title').text()).toBe('期贤')
    expect(wrapper.find('.ant-page-header').exists()).toBe(true)
  })

  it('pageHeader should not contain back it back', () => {
    const routes = [
      { path: 'index', breadcrumbName: 'First-level Menu' },
      { path: 'first', breadcrumbName: 'Second-level Menu' },
      { path: 'second', breadcrumbName: 'Third-level Menu' },
    ]
    const wrapper = mount({
      render: () => withProvider(<PageHeader title="Page Title" breadcrumb={{ routes } as any} />),
    })

    expect(wrapper.findAll('.ant-page-header-back')).toHaveLength(0)
  })

  it('pageHeader should have breadcrumb', () => {
    const items = [{ path: 'index', title: 'First-level Menu' }]
    const wrapper = mount({
      render: () => withProvider(<PageHeader title="Page Title" breadcrumb={{ items }} />),
    })

    expect(wrapper.findAll('.ant-breadcrumb')).toHaveLength(1)
    expect(wrapper.findAll('.ant-page-header-back')).toHaveLength(0)
  })

  it('pageHeader should have breadcrumb (component)', () => {
    const routes = [{ path: 'index', title: 'First-level Menu' }]
    const wrapper = mount({
      render: () => (
        withProvider(
          <PageHeader
            title="Page Title"
            breadcrumb={<Breadcrumb items={routes} />}
          />,
        )
      ),
    })

    expect(wrapper.findAll('.ant-breadcrumb')).toHaveLength(1)
    expect(wrapper.findAll('.ant-page-header-back')).toHaveLength(0)
  })

  it('pageHeader support breadcrumbRender', () => {
    const wrapper = mount({
      render: () => (
        withProvider(
          <PageHeader
            title="Page Title"
            avatar={{
              src: 'https://avatars1.githubusercontent.com/u/8186664?s=460&v=4',
              alt: 'avatar',
            }}
            breadcrumbRender={() => <div id="test">test</div>}
          />,
        )
      ),
    })

    expect(wrapper.findAll('#test')).toHaveLength(1)
    expect(wrapper.findAll('.ant-page-header-back')).toHaveLength(0)
  })

  it('pageHeader support breadcrumbRender return false', () => {
    const wrapper = mount({
      render: () => withProvider(<PageHeader title="Page Title" breadcrumbRender={() => false} />),
    })

    expect(wrapper.findAll('.ant-page-header-back')).toHaveLength(0)
  })

  it('pageHeader do not has title', () => {
    const items = [{ path: 'index', title: 'First-level Menu' }]
    const wrapper = mount({
      render: () => withProvider(<PageHeader breadcrumb={{ items }}>test</PageHeader>),
    })

    expect(wrapper.find('.ant-page-header-heading-lef').exists()).toBe(false)
    expect(wrapper.find('.ant-page-header-heading').exists()).toBe(false)
  })

  it('pageHeader should no contain back', () => {
    const wrapper = mount({
      render: () => withProvider(<PageHeader title="Page Title" backIcon={false} />),
    })

    expect(wrapper.findAll('.ant-page-header-back')).toHaveLength(0)
  })

  it('pageHeader should contain back it back', () => {
    const callback = vi.fn(() => true)
    const wrapper = mount({
      render: () => (
        <ConfigProvider direction="rtl">
          {withProvider(<PageHeader title="Page Title" onBack={callback} />)}
        </ConfigProvider>
      ),
    })

    expect(wrapper.findAll('.ant-page-header-back')).toHaveLength(1)
  })

  it('pageHeader onBack transfer', async () => {
    const callback = vi.fn(() => true)
    const wrapper = mount({
      render: () => withProvider(<PageHeader title="Page Title" onBack={callback} />),
    })

    await wrapper.find('div.ant-page-header-back-button').trigger('click')
    expect(callback).toHaveBeenCalled()
  })

  it('pageHeader should support className', () => {
    const wrapper = mount({
      render: () => withProvider(<PageHeader title="Page Title" className="not-works" backIcon={false} />),
    })

    const pageHeader = wrapper.find('.ant-page-header')
    expect(pageHeader.classes()).toContain('not-works')
    expect(pageHeader.classes()).toContain('ant-page-header')
    expect(wrapper.find('.ant-page-header-back').exists()).toBe(false)
  })

  it('pageHeader should not render blank dom', () => {
    const wrapper = mount({
      render: () => withProvider(<PageHeader title={false} />),
    })

    expect(wrapper.find('.ant-page-header-heading').exists()).toBe(false)
  })

  it('breadcrumbs and back icon can coexist', async () => {
    const items = [
      { path: 'index', title: 'First-level Menu' },
      { path: 'first', title: 'Second-level Menu' },
      { path: 'second', title: 'Third-level Menu' },
    ]
    const wrapper = mount({
      props: { hasBack: false },
      render(this: any) {
        return (
          withProvider(
            <PageHeader
              title="Title"
              breadcrumb={{ items }}
              onBack={this.hasBack ? () => {} : undefined}
            />,
          )
        )
      },
    })

    expect(wrapper.findAll('.ant-breadcrumb')).toHaveLength(1)
    await wrapper.setProps({ hasBack: true })
    expect(wrapper.findAll('.ant-breadcrumb')).toHaveLength(1)
  })

  it('pageHeader should render correctly int RTL direction', () => {
    const wrapper = mount({
      render: () => withProvider(<PageHeader title="Page Title" />),
    })

    expect(wrapper.find('.ant-page-header-heading-title').text()).toBe('Page Title')
    expect(wrapper.find('.ant-page-header').exists()).toBe(true)
  })
})
