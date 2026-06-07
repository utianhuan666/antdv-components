import { ConfigProvider } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProFormText, QueryFilter } from '../../form'
import { cleanup, fireEvent, render, waitFor } from '../testUtils'

const AnyQueryFilter = QueryFilter as any

afterEach(() => {
  cleanup()
})

describe('queryFilter', () => {
  it('🕵️‍♀️ basic use', async () => {
    const onFinish = vi.fn()
    const wrapper = render(
      <AnyQueryFilter
        onFinish={onFinish}
        initialValues={{
          a: 'testa',
        }}
      >
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
      </AnyQueryFilter>,
    )

    fireEvent.click(await wrapper.findByText('提 交'))

    expect(wrapper.container.querySelectorAll('.ant-input').length).toEqual(2)

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({
        a: 'testa',
      })
    })
  })

  it('🕵️‍♀️ collapseRender should work', async () => {
    const wrapper = render(
      <AnyQueryFilter
        style={{ width: 1064 }}
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
      </AnyQueryFilter>,
    )

    expect(
      wrapper.container.querySelector('a.ant-pro-query-filter-collapse-button')?.textContent,
    ).toContain('open')

    fireEvent.click(wrapper.container.querySelector('a.ant-pro-query-filter-collapse-button'))

    await waitFor(() => {
      expect(
        wrapper.container.querySelector('a.ant-pro-query-filter-collapse-button')?.textContent,
      ).toContain('close')
    })
  })

  it('uses getPrefixCls for query filter class names from antd config', async () => {
    const wrapper = render(
      <ConfigProvider prefixCls="acme">
        <AnyQueryFilter defaultCollapsed layout="vertical">
          <ProFormText label="a" name="a" />
          <ProFormText label="b" name="b" />
          <ProFormText label="c" name="c" />
          <ProFormText label="d" name="d" />
        </AnyQueryFilter>
      </ConfigProvider>,
    )

    await wrapper.findByText('提 交')

    expect(wrapper.container.querySelector('.acme-pro-query-filter')).not.toBeNull()
    expect(wrapper.container.querySelector('.acme-pro-query-filter-collapse-button')).not.toBeNull()
    expect(wrapper.container.querySelector('.ant-pro-query-filter')).toBeNull()
  })
})
