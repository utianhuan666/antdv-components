import { ProFormText, QueryFilter } from '@antdv/components'
// @ts-nocheck
import { ConfigProvider } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountAttached, waitFor } from '../testUtils'

describe('queryFilter', () => {
  it('🕵️‍♀️ basic use', async () => {
    const onFinish = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <QueryFilter onFinish={onFinish} initialValues={{ a: 'testa' }}>
          <ProFormText label="a" name="a" />
          <ProFormText label="b" name="b" />
        </QueryFilter>
      ),
    })

    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    expect(wrapper.findAll('.ant-input')).toHaveLength(2)
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ a: 'testa' })
    })
  })

  it('🕵️‍♀️ keep all field value when collapsed', async () => {
    const onFinish = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <QueryFilter
          defaultCollapsed
          defaultFormItemsNumber={2}
          onFinish={onFinish}
          initialValues={{ a: 'testa', b: 'testb', c: 'testc' }}
        >
          <ProFormText label="a" name="a" />
          <ProFormText label="b" name="b" />
          <ProFormText label="c" name="c" />
        </QueryFilter>
      ),
    })

    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ a: 'testa', b: 'testb', c: 'testc' })
    })
  })

  it('🕵️‍♀️ no keep collapsed field value', async () => {
    const onFinish = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <QueryFilter
          defaultCollapsed
          defaultFormItemsNumber={2}
          onFinish={onFinish}
          preserve={false}
          initialValues={{ a: 'testa', b: 'testb', c: 'testc' }}
        >
          <ProFormText label="a" name="a" />
          <ProFormText label="b" name="b" />
          <ProFormText label="c" name="c" />
        </QueryFilter>
      ),
    })

    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ a: 'testa', b: 'testb' })
    })
  })

  it('🕵️‍♀️ labelWidth', () => {
    const wrapper = mountAttached({
      render: () => (
        <QueryFilter labelWidth={70} initialValues={{ a: 'testa' }}>
          <ProFormText label="a" name="a" />
        </QueryFilter>
      ),
    })

    expect((wrapper.find('.ant-form-item-label').element as HTMLElement).style.flex).toBe('0 0 70px')
  })

  it('🕵️‍♀️ collapseRender should work', async () => {
    const wrapper = mountAttached({
      render: () => (
        <QueryFilter
          defaultCollapsed
          layout="vertical"
          collapseRender={(collapsed: boolean) => (collapsed ? 'open' : 'close')}
        >
          <ProFormText label="a" name="a" />
          <ProFormText label="b" name="b" />
          <ProFormText label="c" name="c" />
          <ProFormText label="d" name="d" />
          <ProFormText label="e" name="e" />
          <ProFormText label="f" name="f" />
        </QueryFilter>
      ),
    })

    expect(wrapper.find('.ant-pro-query-filter-collapse-button').text()).toContain('open')

    await wrapper.setProps?.({})
    await wrapper.find('.ant-pro-query-filter-collapse-button').trigger('click')

    expect(wrapper.find('.ant-pro-query-filter-collapse-button').text()).toContain('close')
  })

  it(' ✔️ QueryFilter resize', async () => {
    const wrapper = mountAttached({
      render: () => (
        <QueryFilter>
          <ProFormText name="name1" label="名称" />
        </QueryFilter>
      ),
    })

    await nextTick()

    const container = wrapper.find('.ant-pro-query-filter-container').element as HTMLElement
    container.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 200,
      toJSON: () => {},
    })

    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(wrapper.find('form.ant-pro-query-filter').exists()).toBe(true)
  })

  it('uses getPrefixCls("pro-query-filter") from antd config', () => {
    const wrapper = mountAttached({
      render: () => (
        <ConfigProvider prefixCls="acme">
          <QueryFilter>
            <ProFormText label="a" name="a" />
          </QueryFilter>
        </ConfigProvider>
      ),
    })

    expect(wrapper.find('form.acme-pro-query-filter').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-query-filter-container').exists()).toBe(true)
    expect(wrapper.find('form.ant-pro-query-filter').exists()).toBe(false)
  })
})
