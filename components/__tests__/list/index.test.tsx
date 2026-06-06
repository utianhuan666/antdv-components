import type { ProColumns } from '../../table'
import { EllipsisOutlined } from '@antdv-next/icons'
import { Progress, Tag } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { BaseProList, ProList } from '../../list'
import { act, cleanup, fireEvent, render, screen, userEvent, waitFor, waitForWaitTime } from '../testUtils'

interface DataSourceType {
  name: string
  desc: {
    text: string
  }
}

const paginationData = [
  '智慧零售平台',
  'Ant Design Pro',
  '云原生微服务框架',
  '数据可视化引擎',
  '智能客服系统',
  'DevOps 工具链',
  '统一权限管理中心',
].map(item => ({
  title: item,
  subTitle: <Tag color="#5BD8A6">技术专栏</Tag>,
  actions: [
    <a key="invite">邀请</a>,
    <a key="operate">操作</a>,
    <a key="rest">
      <EllipsisOutlined />
    </a>,
  ],
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg',
  content: (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ width: 200 }}>
        <div>发布中</div>
        <Progress percent={80} />
      </div>
    </div>
  ),
}))

const PaginationDemo = defineComponent({
  name: 'PaginationDemo',
  setup() {
    return () => (
      <div style={{ padding: 24 }}>
        <ProList
          pagination={{
            defaultPageSize: 5,
            showSizeChanger: true,
          }}
          columns={[
            { dataIndex: 'title', listSlot: 'title' },
            { dataIndex: 'subTitle', listSlot: 'subTitle' },
            { dataIndex: 'type', listSlot: 'type' },
            { dataIndex: 'avatar', listSlot: 'avatar' },
            { dataIndex: 'content', listSlot: 'content' },
            { dataIndex: 'actions', listSlot: 'actions' },
          ]}
          headerTitle="翻页"
          dataSource={paginationData}
        />
      </div>
    )
  },
})

function controlledExpandWrapper(props: Record<string, any>) {
  return defineComponent({
    name: 'ControlledExpandList',
    setup() {
      const expandedRowKeys = ref<any[]>([])
      const onExpandedRowsChange = (keys: any[]) => {
        expandedRowKeys.value = [...keys]
      }
      return () => (
        <ProList
          {...props}
          expandable={{
            ...props.expandable,
            expandedRowKeys: expandedRowKeys.value,
            onExpandedRowsChange,
          }}
        />
      )
    },
  })
}

async function clearAndType(input: HTMLInputElement, text: string) {
  input.value = ''
  fireEvent.change(input, { target: { value: '' } })
  await userEvent.type(input, text)
}

afterEach(() => {
  cleanup()
})

describe('list', () => {
  it('🚏 base use', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('我是名称')
    expect(container.querySelector('.ant-pro-list-row-description')!.innerHTML).toEqual('desc text')
  })

  it('🚏 BaseList', async () => {
    const { container } = render(
      <BaseProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
          { dataIndex: ['desc', 'text'], listSlot: 'xxx' as any },
          { title: 'desc text', listSlot: 'subTitle' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('我是名称')
    expect(container.querySelector('.ant-pro-list-row-description')!.innerHTML).toEqual('desc text')
    expect(container.querySelectorAll('.ant-pro-card')!.length).toBe(0)
  })

  it('🚏 show loading state', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
        ]}
        loading
      />,
    )
    expect(container.querySelector('.ant-spin-spinning')).toBeTruthy()
    const spin = container.querySelector('.ant-spin')
    expect(spin?.getAttribute('aria-busy')).toBe('true')
  })

  it('🚏 only has content', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        columns={[
          {
            listSlot: 'content',
            render: () => (
              <div>
                段落示意：蚂蚁金服设计平台
                design.alipay.com，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。蚂蚁金服设计平台
                design.alipay.com，用最小的工作量，无缝接入蚂蚁金服生态提供跨越设计与开发的体验解决方案。
              </div>
            ),
          },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-content')).toBeTruthy()
    expect(container.querySelector('.ant-pro-list-row-title')).toBeFalsy()
    expect(container.querySelector('.ant-pro-list-row-description')).toBeFalsy()
    expect(container.textContent).toContain('design.alipay.com')
  })

  it('🚏 only has description', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        columns={[
          {
            listSlot: 'description',
            render: () => (
              <>
                <Tag>语雀专栏</Tag>
                <Tag>设计语言</Tag>
                <Tag>蚂蚁金服</Tag>
              </>
            ),
          },
        ]}
      />,
    )
    expect(container.querySelectorAll('.ant-tag').length).toBe(3)
    expect(container.querySelector('.ant-pro-list-row-title')).toBeFalsy()
    const text = container.textContent?.replace(/\s/g, '') ?? ''
    expect(text).toContain('语雀专栏')
    expect(text).toContain('设计语言')
    expect(text).toContain('蚂蚁金服')
  })

  it('🚏 empty', async () => {
    const { container } = render(<ProList columns={[{ dataIndex: 'name', listSlot: 'title' }]} />)
    expect(container.querySelector('.ant-empty-description')!.innerHTML).toEqual('暂无数据')
  })

  it('🚏 expandable', async () => {
    const onExpand = vi.fn()
    const Wrapper = controlledExpandWrapper({
      dataSource: [{ name: '我是名称', content: <div>我是内容</div> }],
      columns: [
        { dataIndex: 'name', listSlot: 'title' },
        { dataIndex: 'content', listSlot: 'content' },
      ],
      expandable: { onExpand },
    })
    const { container } = render(<Wrapper />)
    expect(container.querySelectorAll('.ant-pro-list-row-description').length).toEqual(0)
    await fireEvent.click(container.querySelector('.ant-pro-list-row-expand-icon')!)
    expect(container.querySelector('.ant-pro-list-row-content')!.innerHTML).toEqual('<div>我是内容</div>')
    expect(onExpand).toHaveBeenCalledWith(true, expect.objectContaining({ name: '我是名称' }))
  })

  it('🚏 expandable support expandRowByClick', async () => {
    const onExpand = vi.fn()
    const Wrapper = controlledExpandWrapper({
      dataSource: [{ name: '我是名称', content: <div>我是内容</div> }],
      columns: [
        { dataIndex: 'name', listSlot: 'title' },
        { dataIndex: 'content', listSlot: 'content' },
      ],
      expandable: { onExpand, expandRowByClick: true },
    })
    const { container } = render(<Wrapper />)
    expect(container.querySelectorAll('.ant-pro-list-row-description').length).toEqual(0)
    await fireEvent.click(container.querySelector('.ant-pro-list-item')!)
    expect(container.querySelector('.ant-pro-list-row-content')!.innerHTML).toEqual('<div>我是内容</div>')
    expect(onExpand).toHaveBeenCalledWith(true, expect.objectContaining({ name: '我是名称' }))
  })

  it('🚏 expandable with defaultExpandedRowKeys', async () => {
    const { container } = render(
      <ProList
        dataSource={[
          { name: '我是名称', content: <div>我是内容</div>, itemKey: 'a' },
          { name: '我是名称', content: <div>我是内容b</div>, itemKey: 'b' },
        ]}
        rowKey="itemKey"
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'content', listSlot: 'content' },
        ]}
        expandable={{ defaultExpandedRowKeys: ['b'] }}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-content')!.innerHTML).toEqual('<div>我是内容b</div>')
  })

  it('🚏 expandable with expandedRowRender', async () => {
    const Wrapper = controlledExpandWrapper({
      dataSource: [{ name: '我是名称', content: <div>我是内容</div> }],
      columns: [
        { dataIndex: 'name', listSlot: 'title' },
        { dataIndex: 'content', listSlot: 'content' },
      ],
      expandable: {
        expandedRowClassName: () => 'test-custom-class-name',
        expandedRowRender: (_record: any, index: number) => (
          <div>
            expand:
            {index}
          </div>
        ),
      },
      rowKey: (item: any) => item.name,
    })
    const { container } = render(<Wrapper />)
    expect(container.querySelectorAll('.ant-pro-list-row-description').length).toEqual(0)
    await fireEvent.click(container.querySelector('.ant-pro-list-row-expand-icon')!)
    expect(container.querySelector('.ant-pro-list-row-content .test-custom-class-name')!.innerHTML).toEqual('<div>expand:0</div>')
  })

  it('🚏 expandable with expandIcon', async () => {
    const fn = vi.fn()
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称', content: <div>我是内容</div> }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'content', listSlot: 'content' },
        ]}
        expandable={{
          expandIcon: ({ record }: any) => <div id="test_click" onClick={() => fn(record.name)} class="expand-icon" />,
        }}
        rowKey={(item: any) => item.name}
      />,
    )
    expect(container.querySelectorAll('.expand-icon')).toHaveLength(1)
    await fireEvent.click(container.querySelector('#test_click')!)
    expect(fn).toHaveBeenCalledWith('我是名称')
  })

  it('🚏 ProList support itemRender', async () => {
    render(
      <ProList
        dataSource={[{ name: '我是名称', content: <div>我是内容</div> }]}
        itemRender={(_: any, index: number) => <div data-testid="test_index">{index}</div>}
        rowKey={(item: any) => item.name}
      />,
    )
    expect(screen.getByTestId('test_index').textContent).toContain('0')
  })

  it('🚏 rowSelection', async () => {
    const { container } = render(
      <ProList
        dataSource={[
          { name: '我是名称', description: '我是描述' },
          { name: '我是名称', description: '我是描述' },
        ]}
        rowSelection={{}}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'description', listSlot: 'description' },
        ]}
      />,
    )
    expect(container.querySelectorAll('.ant-checkbox-input')!.length).toEqual(2)
    const first = container.querySelectorAll<HTMLInputElement>('.ant-checkbox-input')[0]!
    first.checked = true
    fireEvent.change(first, { target: { checked: true } })
    expect(first.checked).toBe(true)
    expect(container.querySelectorAll<HTMLInputElement>('.ant-checkbox-input')[1]!.checked).toBe(false)
  })

  it('🚏 support pagination', async () => {
    const { container } = render(<PaginationDemo />)
    expect(container.querySelectorAll('.ant-pro-list-item').length).toEqual(5)
    await act(async () => {
      const pageItem = container.querySelectorAll<HTMLElement>('.ant-pagination-item')[1]!
      ;(pageItem.querySelector<HTMLElement>('a') || pageItem).click()
    })
    expect(container.querySelectorAll('.ant-pro-list-item').length).toEqual(2)

    const select = container.querySelector('.ant-pagination-options-size-changer.ant-select') as HTMLElement
    expect(select).toBeTruthy()
    await act(async () => {
      fireEvent.mouseDown(select)
    })
    await waitFor(() => {
      const options = document.body.querySelectorAll('.ant-select-item.ant-select-item-option')
      expect(options.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
    await act(async () => {
      const options = document.body.querySelectorAll<HTMLElement>('.ant-select-item.ant-select-item-option')
      expect(options.length).toBeGreaterThan(3)
      options[3]!.click()
    })
    await waitFor(() => {
      expect(container.querySelectorAll('.ant-pro-list-item').length).toEqual(7)
    }, { timeout: 3000 })
  })

  it('🚏 filter and request', async () => {
    const onRequest = vi.fn()
    const { container } = render(
      <ProList
        columns={[{ title: '标题', dataIndex: 'title', listSlot: 'title' }]}
        request={(params: any, sort: any, filter: any) => {
          onRequest(params, sort, filter)
          return Promise.resolve({ success: true, data: [{ title: '测试标题1' }, { title: '测试标题2' }] })
        }}
        pagination={{ pageSize: 5, onShowSizeChange: () => {} }}
        search={{ filterType: 'light' }}
      />,
    )
    await waitFor(() => {
      expect(container.querySelectorAll('.ant-pro-list-row-title').length).toEqual(2)
    })
    await userEvent.click(container.querySelector('.ant-pro-core-field-label')!)
    const overlayInput = await waitFor(
      () => document.querySelector('.ant-pro-core-field-dropdown-overlay input.ant-input') as HTMLInputElement,
      { timeout: 5000 },
    )
    await clearAndType(overlayInput, 'test')
    await userEvent.click(document.querySelector('.ant-pro-core-field-dropdown-footer .ant-btn-primary')!)
    await waitFor(() => {
      expect(document.querySelector('[title="test"]')).toBeTruthy()
    })
  })

  it('🚏 ProList support onRow', async () => {
    const onClick = vi.fn()
    const onMouseEnter = vi.fn()
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
        ]}
        onRow={(record: DataSourceType) => ({
          onMouseEnter: () => onMouseEnter(record.name),
          onClick: () => onClick(),
        })}
      />,
    )
    fireEvent.click(container.querySelector('.ant-pro-list-item')!)
    expect(onClick).toHaveBeenCalled()
    fireEvent.mouseEnter(container.querySelector('.ant-pro-list-item')!)
    expect(onMouseEnter).toHaveBeenCalledWith('我是名称')
  })

  it('🚏 ProList support rowClassName as a string', async () => {
    const customizedRowClassName = 'rowClassName'
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
        ]}
        rowClassName={customizedRowClassName}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row')!).toHaveClass(customizedRowClassName)
    container.querySelectorAll('.ant-pro-list-row').forEach((row) => {
      expect(row).toHaveClass(customizedRowClassName)
    })
  })

  it('🚏 ProList support rowClassName as a function', async () => {
    const customizedRowClassName = (_: any, index: number): string => index % 2 === 0 ? 'even' : 'odd'
    const { container } = render(
      <ProList
        dataSource={[
          { name: '我是名称', desc: { text: 'desc text' } },
          { name: '我是名称', desc: { text: 'desc text' } },
        ]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
        ]}
        rowClassName={customizedRowClassName}
      />,
    )
    expect(container.querySelectorAll('.ant-pro-list-row')[0]).toHaveClass('even')
    expect(container.querySelectorAll('.ant-pro-list-row')[1]).toHaveClass('odd')
    expect(container.querySelectorAll('.ant-pro-list-row').length).toBe(2)
    expect(container.querySelectorAll('.ant-pro-list-row.even').length).toBe(1)
    expect(container.querySelectorAll('.ant-pro-list-row.odd').length).toBe(1)
  })

  it('🚏 ProList support itemHeaderRender', async () => {
    const html = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        itemHeaderRender={(item: DataSourceType) => (
          <>
            qixian:
            {item.name}
          </>
        )}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
        ]}
      />,
    )
    await waitForWaitTime(1200)
    expect(html.baseElement.textContent?.includes('qixian:我是名称')).toBeTruthy()
  })

  it('🚏 ProList support itemTitleRender', async () => {
    const html = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        itemTitleRender={(item: DataSourceType) => (
          <>
            qixian:
            {item.name}
          </>
        )}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
        ]}
      />,
    )
    await waitForWaitTime(1200)
    expect(html.baseElement.textContent?.includes('qixian:我是名称')).toBeTruthy()
  })

  it('🚏 list support actions render to extra props', async () => {
    const html = render(
      <ProList
        grid={{ gutter: 16, column: 2 }}
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' }, actions: [<a key="edit" id="html_url">修复</a>] }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
          { listSlot: 'actions' },
        ]}
      />,
    )
    await waitForWaitTime(1200)
    await act(async () => {
      (await html.findByText('修复'))?.click()
    })
    expect(html.baseElement.textContent?.includes('修复')).toBeTruthy()
    expect(!!html.baseElement.querySelector('.ant-pro-card-actions')).toBeFalsy()
  })

  it('🚏 list support actions render to actions props', async () => {
    const html = render(
      <ProList
        grid={{ gutter: 16, column: 2 }}
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' }, actions: {} }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
          { listSlot: 'actions', render: () => [<a key="edit" id="edit">修复</a>] },
        ]}
      />,
    )
    await waitForWaitTime(1000)
    expect(!!html.baseElement.querySelector('.ant-pro-card-extra')).toBeFalsy()
    act(() => {
      html.queryByText('修复')?.click()
    })
  })

  it('🚏 trigger list item event when has grid prop', async () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const html = render(
      <ProList
        grid={{ gutter: 16, column: 2 }}
        onItem={(record: any) => ({
          onMouseEnter: () => fn1(record.name),
          onClick: () => fn2(record.name),
        })}
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' }, actions: {} }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
          { listSlot: 'actions', render: () => [<a key="edit" id="edit">修复</a>] },
        ]}
      />,
    )
    await waitForWaitTime(1000)
    act(() => {
      fireEvent.mouseEnter(html.baseElement.querySelector('.ant-pro-list-row-card')!, {})
      fireEvent.click(html.baseElement.querySelector('.ant-pro-list-row-card')!, {})
    })
    await waitFor(() => {
      expect(fn1).toHaveBeenCalledWith('我是名称')
      expect(fn2).toHaveBeenCalledWith('我是名称')
    })
  })

  it('🚏 rowSelection support radio', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: 'Item 1' }, { name: 'Item 2' }]}
        rowSelection={{ type: 'radio' }}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
      />,
    )
    expect(container.querySelectorAll('.ant-radio-input').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.ant-checkbox-input').length).toBe(0)
  })

  it('🚏 columns API: basic use with listSlot', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称', desc: { text: 'desc text' } }]}
        columns={[
          { title: '名称', dataIndex: 'name', listSlot: 'title' },
          { dataIndex: ['desc', 'text'], listSlot: 'description' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('我是名称')
    expect(container.querySelector('.ant-pro-list-row-description')!.innerHTML).toEqual('desc text')
  })

  it('🚏 columns API: columns take priority over metas', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '列的名称', altName: 'meta的名称' }]}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
        metas={{ title: { dataIndex: 'altName' } }}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('列的名称')
  })

  it('🚏 columns API: actions with cardActionProps', async () => {
    const html = render(
      <ProList
        grid={{ gutter: 16, column: 2 }}
        dataSource={[{ name: '我是名称' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { listSlot: 'actions', render: () => [<a key="edit" id="edit">修复</a>] },
        ]}
      />,
    )
    await waitForWaitTime(1000)
    expect(!!html.baseElement.querySelector('.ant-pro-card-extra')).toBeFalsy()
    act(() => {
      html.queryByText('修复')?.click()
    })
  })

  it('🚏 columns API: expandable support', async () => {
    const onExpand = vi.fn()
    const Wrapper = controlledExpandWrapper({
      dataSource: [{ name: '我是名称', content: <div>我是内容</div> }],
      columns: [
        { dataIndex: 'name', listSlot: 'title' },
        { dataIndex: 'content', listSlot: 'content' },
      ],
      expandable: { onExpand },
    })
    const { container } = render(<Wrapper />)
    await fireEvent.click(container.querySelector('.ant-pro-list-row-expand-icon')!)
    expect(container.querySelector('.ant-pro-list-row-content')!.innerHTML).toEqual('<div>我是内容</div>')
    expect(onExpand).toHaveBeenCalledWith(true, expect.objectContaining({ name: '我是名称' }))
  })

  it('🚏 columns API: with render function', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '我是名称' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          {
            listSlot: 'description',
            render: () => (
              <>
                <Tag>标签一</Tag>
                <Tag>标签二</Tag>
              </>
            ),
          },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-description')).toBeTruthy()
    expect(container.querySelectorAll('.ant-tag').length).toEqual(2)
  })

  it('🚏 columns API: compatible with ProTable ProColumns type', async () => {
    interface DataItem {
      id: string
      name: string
      avatar: string
    }
    const sharedColumns: ProColumns<DataItem>[] = [
      { title: '名称', dataIndex: 'name', listSlot: 'title' },
      { dataIndex: 'avatar', listSlot: 'avatar', search: false },
    ]
    const { container } = render(
      <ProList
        rowKey="id"
        dataSource={[
          {
            id: '1',
            name: '测试名称',
            avatar: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
          },
        ]}
        columns={sharedColumns}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('测试名称')
  })

  it('🚏 columns API: rowSelection works', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '项目一' }, { name: '项目二' }]}
        rowSelection={{}}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
      />,
    )
    expect(container.querySelectorAll('.ant-checkbox-input')!.length).toEqual(2)
    const first = container.querySelectorAll<HTMLInputElement>('.ant-checkbox-input')[0]!
    first.checked = true
    fireEvent.change(first, { target: { checked: true } })
    expect(first.checked).toBe(true)
    expect(container.querySelectorAll<HTMLInputElement>('.ant-checkbox-input')[1]!.checked).toBe(false)
  })

  it('🚏 columns API: columns without listSlot are ignored in list rendering', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '名称', status: 'open' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
              open: { text: '未解决' },
              closed: { text: '已解决' },
            },
          },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('名称')
  })

  it('🚏 columns API: onRow works', async () => {
    const onClick = vi.fn()
    const onMouseEnter = vi.fn()
    const { container } = render(
      <ProList
        dataSource={[{ name: '测试名称', desc: '测试描述' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'desc', listSlot: 'description' },
        ]}
        onRow={(record: any) => ({
          onMouseEnter: () => onMouseEnter(record.name),
          onClick: () => onClick(record.name),
        })}
      />,
    )
    fireEvent.click(container.querySelector('.ant-pro-list-item')!)
    expect(onClick).toHaveBeenCalledWith('测试名称')
    fireEvent.mouseEnter(container.querySelector('.ant-pro-list-item')!)
    expect(onMouseEnter).toHaveBeenCalledWith('测试名称')
  })

  it('🚏 columns API: onItem works with grid/card mode', async () => {
    const onClick = vi.fn()
    const html = render(
      <ProList
        grid={{ gutter: 16, column: 2 }}
        onItem={(record: any) => ({ onClick: () => onClick(record.name) })}
        dataSource={[{ name: '卡片名称' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { listSlot: 'actions', render: () => [<a key="a">操作</a>] },
        ]}
      />,
    )
    await waitForWaitTime(1000)
    act(() => {
      fireEvent.click(html.baseElement.querySelector('.ant-pro-list-row-card')!)
    })
    await waitFor(() => {
      expect(onClick).toHaveBeenCalledWith('卡片名称')
    })
  })

  it('🚏 columns API: rowClassName as string', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '名称' }]}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
        rowClassName="custom-row-class"
      />,
    )
    expect(container.querySelector('.ant-pro-list-row')!).toHaveClass('custom-row-class')
  })

  it('🚏 columns API: rowClassName as function', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: 'A' }, { name: 'B' }]}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
        rowClassName={(_: any, index: number) => index === 0 ? 'first' : 'rest'}
      />,
    )
    expect(container.querySelectorAll('.ant-pro-list-row')[0]).toHaveClass('first')
    expect(container.querySelectorAll('.ant-pro-list-row')[1]).toHaveClass('rest')
  })

  it('🚏 columns API: itemRender works', async () => {
    render(
      <ProList
        dataSource={[{ name: '自定义项' }]}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
        itemRender={(item: any, index: number) => (
          <div data-testid="custom-item">
            {index}
            -
            {item.name}
          </div>
        )}
        rowKey="name"
      />,
    )
    expect(screen.getByTestId('custom-item').textContent).toContain('0-自定义项')
  })

  it('🚏 columns API: itemHeaderRender works', async () => {
    const html = render(
      <ProList
        dataSource={[{ name: '名称' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'name', listSlot: 'description' },
        ]}
        itemHeaderRender={(item: any) => (
          <>
            自定义头:
            {item.name}
          </>
        )}
      />,
    )
    await waitForWaitTime(1200)
    expect(html.baseElement.textContent?.includes('自定义头:名称')).toBeTruthy()
  })

  it('🚏 columns API: itemTitleRender works', async () => {
    const html = render(
      <ProList
        dataSource={[{ name: '标题名称' }]}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
        itemTitleRender={(item: any) => (
          <>
            渲染标题:
            {item.name}
          </>
        )}
      />,
    )
    await waitForWaitTime(1200)
    expect(html.baseElement.textContent?.includes('渲染标题:标题名称')).toBeTruthy()
  })

  it('🚏 columns API: BaseProList works', async () => {
    const { container } = render(
      <BaseProList
        dataSource={[{ name: '基础列表', desc: '描述文本' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'desc', listSlot: 'description' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('基础列表')
    expect(container.querySelector('.ant-pro-list-row-description')!.innerHTML).toEqual('描述文本')
    expect(container.querySelectorAll('.ant-pro-card')!.length).toBe(0)
  })

  it('🚏 columns API: empty state', async () => {
    const { container } = render(<ProList columns={[{ dataIndex: 'name', listSlot: 'title' }]} />)
    expect(container.querySelector('.ant-empty-description')!.innerHTML).toEqual('暂无数据')
  })

  it('🚏 columns API: request and search with light filter', async () => {
    const onRequest = vi.fn()
    const { container } = render(
      <ProList
        columns={[{ title: '标题', dataIndex: 'title', listSlot: 'title' }]}
        request={(params: any, sort: any, filter: any) => {
          onRequest(params, sort, filter)
          return Promise.resolve({ success: true, data: [{ title: '标题1' }, { title: '标题2' }] })
        }}
        pagination={{ pageSize: 5, onShowSizeChange: () => {} }}
        search={{ filterType: 'light' }}
      />,
    )
    await waitFor(() => {
      expect(container.querySelectorAll('.ant-pro-list-row-title').length).toEqual(2)
    })
    await userEvent.click(container.querySelector('.ant-pro-core-field-label')!)
    const overlayInput = await waitFor(
      () => document.querySelector('.ant-pro-core-field-dropdown-overlay input.ant-input') as HTMLInputElement,
      { timeout: 5000 },
    )
    await clearAndType(overlayInput, 'test')
    await userEvent.click(document.querySelector('.ant-pro-core-field-dropdown-footer .ant-btn-primary')!)
    await waitFor(() => {
      expect(document.querySelector('[title="test"]')).toBeTruthy()
    })
  })

  it('🚏 columns API: expandRowByClick works', async () => {
    const onExpand = vi.fn()
    const Wrapper = controlledExpandWrapper({
      dataSource: [{ name: '点击展开', content: <div>展开的内容</div> }],
      columns: [
        { dataIndex: 'name', listSlot: 'title' },
        { dataIndex: 'content', listSlot: 'content' },
      ],
      expandable: { onExpand, expandRowByClick: true },
    })
    const { container } = render(<Wrapper />)
    await fireEvent.click(container.querySelector('.ant-pro-list-item')!)
    expect(container.querySelector('.ant-pro-list-row-content')!.innerHTML).toEqual('<div>展开的内容</div>')
    expect(onExpand).toHaveBeenCalledWith(true, expect.objectContaining({ name: '点击展开' }))
  })

  it('🚏 columns API: expandedRowRender works', async () => {
    const Wrapper = controlledExpandWrapper({
      dataSource: [{ name: '行展开' }],
      columns: [
        { dataIndex: 'name', listSlot: 'title' },
        { dataIndex: 'name', listSlot: 'content' },
      ],
      expandable: {
        expandedRowClassName: () => 'expanded-custom',
        expandedRowRender: (_: any, index: number) => (
          <div>
            展开行:
            {index}
          </div>
        ),
      },
      rowKey: 'name',
    })
    const { container } = render(<Wrapper />)
    await fireEvent.click(container.querySelector('.ant-pro-list-row-expand-icon')!)
    expect(container.querySelector('.ant-pro-list-row-content .expanded-custom')!.innerHTML).toEqual('<div>展开行:0</div>')
  })

  it('🚏 columns API: radio selection works', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: 'Item 1' }, { name: 'Item 2' }]}
        rowSelection={{ type: 'radio' }}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
      />,
    )
    expect(container.querySelectorAll('.ant-radio-input').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.ant-checkbox-input').length).toBe(0)
  })

  it('🚏 columns API: all slots render correctly', async () => {
    const { container } = render(
      <ProList
        dataSource={[
          {
            name: '完整标题',
            sub: '副标题内容',
            avatar: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
            desc: '描述文本',
          },
        ]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'sub', listSlot: 'subTitle' },
          { dataIndex: 'avatar', listSlot: 'avatar' },
          { dataIndex: 'desc', listSlot: 'description' },
          { listSlot: 'content', render: () => <div class="test-content">内容区域</div> },
          { listSlot: 'actions', render: () => [<a key="act">操作</a>] },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.textContent).toEqual('完整标题')
    expect(container.querySelector('.ant-pro-list-row-sub-title')!.textContent).toEqual('副标题内容')
    expect(container.querySelector('.ant-pro-list-item-meta-avatar')).toBeTruthy()
    expect(container.querySelector('.ant-pro-list-row-description')!.textContent).toEqual('描述文本')
    expect(container.querySelector('.test-content')!.textContent).toEqual('内容区域')
    expect(container.textContent?.includes('操作')).toBeTruthy()
  })

  it('🚏 columns API: actions default to extra in card mode', async () => {
    const html = render(
      <ProList
        grid={{ gutter: 16, column: 2 }}
        dataSource={[{ name: '名称' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { listSlot: 'actions', render: () => [<a key="act">默认操作</a>] },
        ]}
      />,
    )
    await waitForWaitTime(1000)
    expect(html.baseElement.textContent?.includes('默认操作')).toBeTruthy()
    expect(!!html.baseElement.querySelector('.ant-pro-card-actions')).toBeFalsy()
  })

  it('🚏 columns API: defaultExpandedRowKeys works', async () => {
    const { container } = render(
      <ProList
        dataSource={[
          { name: '项目A', content: <div>内容A</div>, key: 'a' },
          { name: '项目B', content: <div>内容B</div>, key: 'b' },
        ]}
        rowKey="key"
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'content', listSlot: 'content' },
        ]}
        expandable={{ defaultExpandedRowKeys: ['b'] }}
      />,
    )
    const contents = container.querySelectorAll('.ant-pro-list-row-content')
    expect(contents.length).toEqual(1)
    expect(contents[0]!.innerHTML).toEqual('<div>内容B</div>')
  })

  it('🚏 columns API: aside slot renders to extra area', async () => {
    const { container } = render(
      <ProList
        itemLayout="vertical"
        dataSource={[{ name: '标题', sideImg: 'https://example.com/img.png' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          {
            listSlot: 'content',
            render: () => <img width={272} alt="side" src="https://example.com/img.png" data-testid="aside-img" />,
          },
        ]}
      />,
    )
    expect(container.querySelector('[data-testid="aside-img"]')).toBeTruthy()
  })

  it('🚏 columns API: aside and actions coexist without conflict', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '名称' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { listSlot: 'content', render: () => <div data-testid="aside-content">附属内容</div> },
          { listSlot: 'actions', render: () => [<a key="edit">编辑</a>] },
        ]}
      />,
    )
    expect(container.querySelector('[data-testid="aside-content"]')).toBeTruthy()
    expect(container.textContent?.includes('编辑')).toBeTruthy()
  })

  it('🚏 columns API: nested dataIndex works', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ user: { info: { nickname: '嵌套名称' } }, meta: { brief: '嵌套描述' } }]}
        columns={[
          { dataIndex: ['user', 'info', 'nickname'], listSlot: 'title' },
          { dataIndex: ['meta', 'brief'], listSlot: 'description' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('嵌套名称')
    expect(container.querySelector('.ant-pro-list-row-description')!.innerHTML).toEqual('嵌套描述')
  })

  it('🚏 edge: empty columns array renders empty list', async () => {
    const { container } = render(<ProList dataSource={[{ name: 'a' }]} columns={[]} />)
    expect(container.querySelector('.ant-pro-list')).toBeTruthy()
  })

  it('🚏 edge: columns with no listSlot renders items without slots', async () => {
    const { container } = render(
      <ProList dataSource={[{ name: 'a', status: 'open' }]} columns={[{ title: '状态', dataIndex: 'status', valueType: 'select' }]} />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')).toBeFalsy()
    expect(container.querySelector('.ant-pro-list-row-description')).toBeFalsy()
  })

  it('🚏 edge: undefined columns falls back to metas', async () => {
    const { container } = render(
      <ProList dataSource={[{ name: '回退名称' }]} columns={undefined} metas={{ title: { dataIndex: 'name' } }} />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('回退名称')
  })

  it('🚏 edge: null dataSource does not crash', async () => {
    const { container } = render(<ProList dataSource={null as any} columns={[{ dataIndex: 'name', listSlot: 'title' }]} />)
    expect(container.querySelector('.ant-pro-list')).toBeTruthy()
  })

  it('🚏 edge: empty dataSource array shows empty state', async () => {
    const { container } = render(<ProList dataSource={[]} columns={[{ dataIndex: 'name', listSlot: 'title' }]} />)
    expect(container.querySelector('.ant-empty-description')!.innerHTML).toEqual('暂无数据')
  })

  it('🚏 edge: duplicate listSlot uses last column value', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ first: '第一个', second: '第二个' }]}
        columns={[
          { dataIndex: 'first', listSlot: 'title' },
          { dataIndex: 'second', listSlot: 'title' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('第二个')
  })

  it('🚏 edge: render returns "-" is skipped', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '名称' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { listSlot: 'description', render: () => '-' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('名称')
    expect(container.querySelector('.ant-pro-list-row-description')).toBeFalsy()
  })

  it('🚏 edge: dataIndex points to non-existent field renders nothing', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '存在' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'nonExistent', listSlot: 'description' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('存在')
    expect(container.querySelector('.ant-pro-list-row-description')).toBeFalsy()
  })

  it('🚏 edge: rowKey as function works with columns', async () => {
    const { container } = render(
      <ProList
        dataSource={[
          { uid: 'u1', name: '项目一' },
          { uid: 'u2', name: '项目二' },
        ]}
        rowKey={(item: any) => item.uid}
        columns={[{ dataIndex: 'name', listSlot: 'title' }]}
        rowSelection={{}}
      />,
    )
    expect(container.querySelectorAll('.ant-checkbox-input').length).toEqual(2)
  })

  it('🚏 edge: only actions column with no title/avatar/description', async () => {
    const { container } = render(
      <ProList dataSource={[{ id: '1' }]} columns={[{ listSlot: 'actions', render: () => [<a key="act">唯一操作</a>] }]} />,
    )
    expect(container.querySelector('.ant-pro-list-row-title')).toBeFalsy()
    expect(container.textContent?.includes('唯一操作')).toBeTruthy()
  })

  it('🚏 edge: type slot renders correctly', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: 'Top项', itemType: 'top' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { dataIndex: 'itemType', listSlot: 'type' },
        ]}
      />,
    )
    expect(container.querySelector('.ant-pro-list-row-type-top')).toBeTruthy()
  })

  it('🚏 edge: columns dynamically change', async () => {
    const Wrapper = defineComponent({
      name: 'DynamicColumnsList',
      setup() {
        const showDesc = ref(false)
        return () => {
          const cols = [
            { dataIndex: 'name', listSlot: 'title' as const },
            ...(showDesc.value ? [{ dataIndex: 'desc', listSlot: 'description' as const }] : []),
          ]
          return (
            <>
              <button data-testid="toggle" onClick={() => { showDesc.value = true }}>
                切换
              </button>
              <ProList dataSource={[{ name: '名称', desc: '描述' }]} columns={cols} />
            </>
          )
        }
      },
    })
    const { container } = render(<Wrapper />)
    expect(container.querySelector('.ant-pro-list-row-description')).toBeFalsy()
    act(() => {
      fireEvent.click(screen.getByTestId('toggle'))
    })
    await waitFor(() => {
      expect(container.querySelector('.ant-pro-list-row-description')).toBeTruthy()
    })
  })

  it('🚏 edge: columns with key fallback when no dataIndex', async () => {
    const { container } = render(<ProList dataSource={[{ title: '通过key取值' }]} columns={[{ key: 'title', listSlot: 'title' }]} />)
    expect(container.querySelector('.ant-pro-list-row-title')!.textContent).toEqual('通过key取值')
  })

  it('🚏 edge: both metas and empty columns array uses metas', async () => {
    const { container } = render(<ProList dataSource={[{ name: 'metas生效' }]} columns={[]} metas={{ title: { dataIndex: 'name' } }} />)
    expect(container.querySelector('.ant-pro-list-row-title')!.innerHTML).toEqual('metas生效')
  })

  it('🚏 edge: columns with render returning ReactNode array for actions', async () => {
    const { container } = render(
      <ProList
        dataSource={[{ name: '名称' }]}
        columns={[
          { dataIndex: 'name', listSlot: 'title' },
          { listSlot: 'actions', render: () => [<a key="a">操作一</a>, <a key="b">操作二</a>, <a key="c">操作三</a>] },
        ]}
      />,
    )
    expect(container.textContent?.includes('操作一')).toBeTruthy()
    expect(container.textContent?.includes('操作二')).toBeTruthy()
    expect(container.textContent?.includes('操作三')).toBeTruthy()
  })

  it('🚏 edge: loading state with columns does not crash', async () => {
    const { container } = render(<ProList dataSource={[{ name: '名称' }]} columns={[{ dataIndex: 'name', listSlot: 'title' }]} loading />)
    expect(container.querySelector('.ant-pro-list')).toBeTruthy()
  })

  it('🚏 edge: split=false with columns', async () => {
    const { container } = render(
      <ProList dataSource={[{ name: 'a' }, { name: 'b' }]} columns={[{ dataIndex: 'name', listSlot: 'title' }]} split={false} />,
    )
    expect(container.querySelector('.ant-pro-list-no-split')).toBeTruthy()
  })
})
