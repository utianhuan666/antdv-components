import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, onMounted, ref } from 'vue'
import { ProTable } from '../../table'
import { cleanup, render, waitFor, waitForWaitTime } from '../testUtils'
import { getFetchData } from './fixtures'
import './tableTestSetup'

afterEach(() => {
  cleanup()
})

describe('basicTable Search', () => {
  const LINE_STR_COUNT = 20
  // Mock offsetHeight
  // @ts-expect-error mock offsetHeight getter
  const originOffsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight',
  ).get
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    get() {
      let html = this.innerHTML
      html = html.replace(/<[^>]*>/g, '')
      const lines = Math.ceil(html.length / LINE_STR_COUNT)
      return lines * 16
    },
  })

  // Mock getComputedStyle
  const originGetComputedStyle = window.getComputedStyle
  window.getComputedStyle = (ele) => {
    const style = originGetComputedStyle(ele)
    return style
  }

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get: originOffsetHeight,
    })
    window.getComputedStyle = originGetComputedStyle
  })

  it('🎏 filter test', async () => {
    const fn = vi.fn()
    const html = render(
      <ProTable
        size="small"
        columns={[
          {
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
          },
          {
            title: '状态',
            dataIndex: 'status',
            hideInForm: true,
            filters: true,
            valueEnum: {
              0: { text: '关闭', status: 'Default' },
              1: { text: '运行中', status: 'Processing' },
              2: { text: '已上线', status: 'Success' },
              3: { text: '异常', status: 'Error' },
            },
          },
        ]}
        rowSelection={{
          onChange: fn,
        }}
        dataSource={getFetchData(60)}
        rowKey="key"
      />,
    )
    await waitForWaitTime(200)
    html.baseElement
      .querySelectorAll<HTMLInputElement>(
        '.ant-table-cell label.ant-checkbox-wrapper input',
      )[1]
      ?.click()
    await waitForWaitTime(200)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('✔️ selected rows support row is function', async () => {
    const fn = vi.fn()
    const DemoTable = defineComponent({
      setup() {
        const columns = [
          {
            title: '名字',
            dataIndex: 'name',
          },
          {
            title: '年龄',
            dataIndex: 'age',
          },
          {
            title: '编号',
            dataIndex: 'id',
          },
        ]
        const dataSource = [
          {
            name: '张三',
            age: 18,
            id: '001',
          },
          {
            name: '李四',
            age: 19,
            id: '002',
          },
        ]
        // ProTable 在 onMounted 里写入 preserveRecordsRef；若首帧就用初始 selectedRowKeys，
        // selectedRows 会从尚未填充的 Map 取值得到 undefined。延后在此设置选中 key，
        // 确保二次渲染时能解析出行数据。
        const selectedRowKeys = ref<(string | number)[]>([])
        onMounted(() => {
          selectedRowKeys.value = ['001', '002']
        })
        return () => (
          <ProTable
            columns={columns}
            dataSource={dataSource}
            rowKey={(record: any) => record.id}
            rowSelection={{
              selectedRowKeys: selectedRowKeys.value,
              onChange: (newSelectedRowKeys: any) => {
                selectedRowKeys.value = newSelectedRowKeys
              },
            }}
            tableAlertOptionRender={false}
            tableAlertRender={({ selectedRows }: any) => {
              const text = selectedRows
                .filter((row: any) => row != null)
                .map((row: any) => row.name)
                .join(',')
              if (text) {
                fn(text)
              }
              return <div>{text}</div>
            }}
          />
        )
      },
    })

    render(<DemoTable />)

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('张三,李四')
    })
  })
})
