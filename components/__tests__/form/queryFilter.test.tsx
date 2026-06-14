import { ConfigProvider } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProFormGroup, ProFormText, QueryFilter } from '../../form'
import { cleanup, fireEvent, render, waitFor } from '../testUtils'

const AnyQueryFilter = QueryFilter as any

afterEach(() => {
  cleanup()
})

describe('QueryFilter', () => {
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

  it('🕵️‍♀️ keep all field value when collapsed', async () => {
    const onFinish = vi.fn()
    const wrapper = render(
      <AnyQueryFilter
        defaultCollapsed
        onFinish={onFinish}
        initialValues={{
          a: 'testa',
          b: 'testb',
          c: 'testc',
        }}
      >
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
      </AnyQueryFilter>,
    )

    fireEvent.click(await wrapper.findByText('提 交'))

    expect(wrapper.container.querySelectorAll('.ant-input').length).toEqual(3)
    expect(
      wrapper.container.querySelectorAll('.ant-row .ant-form-item-hidden').length,
    ).toEqual(1)

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({
        a: 'testa',
        b: 'testb',
        c: 'testc',
      })
    })
  })

  it('🕵️‍♀️ no keep collapsed field value', async () => {
    const onFinish = vi.fn()
    const wrapper = render(
      <AnyQueryFilter
        defaultCollapsed
        onFinish={onFinish}
        preserve={false}
        initialValues={{
          a: 'testa',
          b: 'testb',
          c: 'testc',
        }}
      >
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
      </AnyQueryFilter>,
    )

    fireEvent.click(await wrapper.findByText('提 交'))

    expect(wrapper.container.querySelectorAll('.ant-input')).toHaveLength(2)
    expect(
      wrapper.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(0)
    expect(wrapper.container.querySelectorAll('.anticon-down')).toHaveLength(1)

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({
        a: 'testa',
        b: 'testb',
      })
    })
  })

  it('🕵️‍♀️ labelWidth', () => {
    const wrapper = render(
      <AnyQueryFilter
        labelWidth={70}
        initialValues={{
          a: 'testa',
        }}
      >
        <ProFormText label="a" name="a" />
      </AnyQueryFilter>,
    )

    const label = wrapper.container.querySelectorAll('.ant-col.ant-form-item-label')[0]
    expect(label?.getAttribute('style') || '').toContain('70px')
  })

  it('🕵️‍♀️ responsive 512', () => {
    const wrapper = render(
      <AnyQueryFilter style={{ width: 512 }} defaultCollapsed>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
      </AnyQueryFilter>,
    )

    expect(
      wrapper.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(1)
  })

  it('🕵️‍♀️ responsive 1064', () => {
    const wrapper = render(
      <AnyQueryFilter defaultCollapsed style={{ width: 1064 }}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
      </AnyQueryFilter>,
    )

    expect(
      wrapper.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(2)
  })

  it('🕵️‍♀️ responsive 1064 with vertical', () => {
    const wrapper = render(
      <AnyQueryFilter style={{ width: 1064 }} defaultCollapsed layout="vertical">
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
      </AnyQueryFilter>,
    )

    expect(
      wrapper.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(2)
  })

  it('🕵️‍♀️ submitter support render', async () => {
    const fn = vi.fn()
    const wrapper = render(
      <AnyQueryFilter
        style={{ width: 1064 }}
        defaultCollapsed
        onFinish={fn}
        submitter={{
          render: (props: any) => {
            return [
              <a
                key="submit"
                id="submit"
                onClick={() => {
                  props.submit()
                }}
              >
                提交
              </a>,
              <a
                key="reset"
                id="reset"
                onClick={() => {
                  props.reset()
                }}
              >
                重置
              </a>,
            ]
          },
        }}
        layout="vertical"
      >
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
        <ProFormText label="e" name="e" />
        <ProFormText label="f" name="f" />
      </AnyQueryFilter>,
    )

    fireEvent.click(
      wrapper.container.querySelector('.ant-pro-query-filter-collapse-button'),
    )
    fireEvent.click(await wrapper.findByText('提交'))
    fireEvent.click(await wrapper.findByText('重置'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalled()
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

    await wrapper.rerender(
      <AnyQueryFilter
        style={{ width: 1064 }}
        defaultCollapsed
        collapsed={false}
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

    await waitFor(() => {
      expect(
        wrapper.container.querySelector('a.ant-pro-query-filter-collapse-button')?.textContent,
      ).toContain('close')
    })
  })

  it('🕵️‍♀️ defaultColsNumber should work', () => {
    const wrapper0 = render(
      <AnyQueryFilter defaultColsNumber={1}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper0.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(2)

    const wrapper1 = render(
      <AnyQueryFilter defaultColsNumber={2}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper1.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(1)

    const wrapper2 = render(
      <AnyQueryFilter defaultColsNumber={3}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper2.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(1)
  })

  it('🕵️‍♀️ defaultFormItemsNumber should work', () => {
    const wrapper0 = render(
      <AnyQueryFilter defaultFormItemsNumber={5}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
        <ProFormText label="e" name="e" />
        <ProFormText label="f" name="f" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper0.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(1)

    const wrapper1 = render(
      <AnyQueryFilter defaultFormItemsNumber={1}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
        <ProFormText label="e" name="e" />
        <ProFormText label="f" name="f" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper1.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(5)

    const wrapper2 = render(
      <AnyQueryFilter defaultFormItemsNumber={6}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
        <ProFormText label="e" name="e" />
        <ProFormText label="f" name="f" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper2.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(0)

    const wrapper3 = render(
      <AnyQueryFilter defaultFormItemsNumber={7}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
        <ProFormText label="e" name="e" />
        <ProFormText label="f" name="f" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper3.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(0)
  })

  it('🕵️‍♀️ colSize不全都是1，collapseRender应该存在', () => {
    const wrapper = render(
      <AnyQueryFilter defaultColsNumber={4} defaultCollapsed={false}>
        <ProFormText
          name="name"
          label="应用名称"
          rules={[{ required: true }]}
          colSize={4}
        />
        <ProFormText name="creater" label="创建人" colSize={3} />
      </AnyQueryFilter>,
    )

    expect(
      wrapper.container.querySelectorAll('a.ant-pro-query-filter-collapse-button'),
    ).toHaveLength(1)
  })

  it('🕵️‍♀️ 表单首项独占一行，收起时应该只展示一项就行了', () => {
    const wrapper = render(
      <AnyQueryFilter defaultCollapsed defaultColsNumber={4}>
        <ProFormText
          name="name"
          label="应用名称"
          rules={[{ required: true }]}
          colSize={4}
        />
        <ProFormText name="creater-1" label="创建人" />
        <ProFormText name="creater-2" label="创建人" />
        <ProFormText name="creater-3" label="创建人" />
        <ProFormText name="creater-4" label="创建人" />
        <ProFormText name="creater-5" label="创建人" />
        <ProFormText name="creater-6" label="创建人" />
        <ProFormText name="creater-7" label="创建人" />
      </AnyQueryFilter>,
    )

    expect(
      wrapper.container.querySelectorAll('.ant-row .ant-form-item-hidden'),
    ).toHaveLength(7)
  })

  it('🕵️‍♀️ QueryFilter support ProForm.Group', () => {
    const wrapper = render(
      <AnyQueryFilter collapsed={true} layout="vertical">
        <ProFormGroup>
          <ProFormText label="a" name="a" />
          <ProFormText label="b" name="b" />
        </ProFormGroup>
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
      </AnyQueryFilter>,
    )

    expect(wrapper.container.querySelectorAll('.ant-pro-form-group')).toHaveLength(0)
  })

  it('🕵️‍♀️ collapseRender', () => {
    const wrapper0 = render(
      <AnyQueryFilter defaultColsNumber={2}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper0.container.querySelectorAll(
        '.ant-pro-query-filter-collapse-button',
      ),
    ).toHaveLength(1)

    const wrapper1 = render(
      <AnyQueryFilter defaultFormItemsNumber={5}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
        <ProFormText label="e" name="e" />
        <ProFormText label="f" name="f" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper1.container.querySelectorAll(
        '.ant-pro-query-filter-collapse-button',
      ),
    ).toHaveLength(1)

    const wrapper2 = render(
      <AnyQueryFilter defaultFormItemsNumber={6}>
        <ProFormText label="a" name="a" />
        <ProFormText label="b" name="b" />
        <ProFormText label="c" name="c" />
        <ProFormText label="d" name="d" />
        <ProFormText label="e" name="e" />
        <ProFormText label="f" name="f" />
      </AnyQueryFilter>,
    )
    expect(
      wrapper2.container.querySelectorAll(
        '.ant-pro-query-filter-collapse-button',
      ),
    ).toHaveLength(0)
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
