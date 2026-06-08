import { Input } from 'antdv-next'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProTable from '../../table'
import { ProProvider, useProProviderContext } from '../../provider'
import { act, cleanup, render, waitFor, waitForWaitTime } from '../testUtils'
import './tableTestSetup'

const Demo = defineComponent({
  setup() {
    const values = useProProviderContext()
    return () => (
      <ProProvider.Provider
        value={{
          ...values,
          valueTypeMap: {
            link: {
              render: (text: any) => <a>{text}</a>,
              formItemRender: (text: any, props: any) => (
                <Input placeholder="请输入链接" {...props?.fieldProps} />
              ),
            },
          },
        } as any}
      >
        <ProTable
          columns={[
            {
              title: '链接',
              dataIndex: 'name',
              valueType: 'link',
            },
          ]}
          request={() => {
            return Promise.resolve({
              total: 200,
              data: [
                {
                  key: 1,
                  name: 'test',
                },
              ],
              success: true,
            })
          }}
          rowKey="key"
        />
      </ProProvider.Provider>
    )
  },
})

afterEach(() => {
  cleanup()
})

describe('table valueEnum', () => {
  it('🎏 dynamic enum test', async () => {
    const html = render(
      <ProTable
        size="small"
        columns={[
          {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {},
            fieldProps: {
              open: true,
            },
          },
        ]}
        request={async () => ({
          data: [
            {
              status: 2,
              key: '1',
            },
          ],
        })}
        rowKey="key"
      />,
    )

    // 等待组件完全渲染
    await waitForWaitTime(1000)

    // 重新渲染组件，添加 valueEnum
    await act(() => {
      html.rerender(
        <ProTable
          size="small"
          request={async () => ({
            data: [
              {
                status: 2,
                key: '1',
              },
            ],
          })}
          rowKey="key"
          columns={[
            {
              title: '状态',
              valueType: 'select',
              dataIndex: 'status',
              valueEnum: {
                0: { text: '关闭', status: 'Default' },
                1: { text: '运行中', status: 'Processing', disabled: true },
                2: { text: '已上线', status: 'Success' },
                3: { text: '异常', status: 'Error' },
              },
              fieldProps: {
                open: true,
              },
            },
          ]}
        />,
      )
    })

    // 等待重新渲染完成
    await waitForWaitTime(1000)

    await waitFor(() => {
      return html.findAllByText('已上线')
    })

    await act(() => {
      html.baseElement
        .querySelector<HTMLDivElement>('form.ant-form div.ant-select')
        ?.click()
    })

    await waitForWaitTime(500)

    await act(() => {
      expect(
        html.baseElement.querySelector<HTMLDivElement>(
          'div.ant-select-dropdown',
        )?.textContent,
      ).toBe('01关闭运行中已上线异常')
    })

    expect(
      html.baseElement.querySelector<HTMLDivElement>('td.ant-table-cell')
        ?.textContent,
    ).toBe('已上线')
  })

  it('🎏 customization valueType', async () => {
    const html = render(<Demo />)
    await waitForWaitTime(1200)
    // 自定义 valueType 'link' 通过 ProProvider.valueTypeMap 注册
    const cellLink = html.baseElement.querySelector('td.ant-table-cell a')
    expect(cellLink).toBeTruthy()
    expect(cellLink?.textContent).toBe('test')
  })

  it('🎏 dynamic request', async () => {
    const request = vi.fn()
    render(
      <ProTable
        size="small"
        columns={[
          {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {},
            fieldProps: {
              open: true,
            },
            request: async (_: any, config: any) => {
              request(config.record)
              return []
            },
          },
        ]}
        rowKey="key"
        request={async () => {
          return {
            data: [
              {
                status: 2,
                key: '1',
              },
            ],
          }
        }}
      />,
    )

    // 等待组件完全渲染和异步操作完成
    await waitForWaitTime(1000)

    await waitFor(
      () => {
        expect(request).toHaveBeenCalledTimes(1)
      },
      { timeout: 5000 },
    )
  })
})
