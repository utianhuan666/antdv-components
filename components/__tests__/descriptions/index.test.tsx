import type { ProCoreActionType } from '../../utils'
import { Badge, Button } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { ProDescriptions } from '../../descriptions'
import { mountAttached, waitFor } from '../testUtils'

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('descriptions', () => {
  it('🥩 descriptions render valueEnum when data = 0', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          columns={[
            {
              dataIndex: 'status',
              title: '状态',
              valueEnum: {
                0: { text: '关闭', status: 'Default' },
                1: { text: '运行中', status: 'Processing' },
                2: { text: '已上线', status: 'Success' },
                3: { text: '异常', status: 'Error' },
              },
            },
          ]}
          request={async () => ({
            data: {
              status: 0,
            },
          })}
        />
      ),
    })

    await waitFor(() => {
      expect(wrapper.find('span.ant-badge-status-text').text()).toBe('关闭')
    })
  })

  it('🎏 onLoadingChange test', async () => {
    const fn = vi.fn()
    mountAttached({
      render: () => (
        <ProDescriptions
          size="small"
          onLoadingChange={fn}
          columns={[
            {
              dataIndex: 'money',
              valueType: 'money',
            },
          ]}
          request={async () => {
            return {
              data: {},
            }
          }}
        />
      ),
    })

    await waitFor(() => {
      expect(fn).toHaveBeenCalled()
    })
  })

  it('🎏 loading test', async () => {
    const loading = ref<boolean | undefined>()
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          columns={[
            {
              title: 'money',
              dataIndex: 'money',
              valueType: 'money',
            },
          ]}
          loading={loading.value}
          request={async () => {
            return new Promise<{ data: Record<string, unknown> }>(() => {})
          }}
        />
      ),
    })

    await waitFor(() => {
      expect(wrapper.find('.ant-skeleton').exists()).toBeTruthy()
    })

    loading.value = false
    await nextTick()

    await waitFor(() => {
      expect(wrapper.find('.ant-skeleton').exists()).toBeFalsy()
    })
  })

  it('🥩 test reload', async () => {
    const fn = vi.fn()
    const actionRef = ref<ProCoreActionType>()
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          actionRef={actionRef}
          title="高级定义列表 request"
          request={async () => {
            fn()
            return new Promise<{
              success: boolean
              data: { id: string, date: string, money: string }
            }>((resolve) => {
              setTimeout(() => {
                resolve({
                  success: true,
                  data: {
                    id: '这是一段文本',
                    date: '20200730',
                    money: '12121',
                  },
                })
              }, 50)
            })
          }}
          extra={(
            <Button
              type="link"
              {...({ id: 'reload' } as any)}
              onClick={() => {
                actionRef.value?.reload()
              }}
            >
              刷新
            </Button>
          )}
          columns={[
            { label: '文本', dataIndex: 'id' },
            { dataIndex: 'date', label: '日期', valueType: 'date' },
            {
              label: 'money',
              dataIndex: 'money',
              valueType: 'money',
            },
          ]}
        />
      ),
    })

    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(wrapper.text()).toContain('这是一段文本')
    })

    await wrapper.find('#reload').trigger('click')
    actionRef.value?.reload()
    actionRef.value?.reload()

    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  it('🥩 test reload by params', async () => {
    const fn = vi.fn()
    const params = ref<Record<string, unknown> | undefined>()
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          title="高级定义列表 request"
          request={async () => {
            fn()
            return Promise.resolve({
              success: true,
              data: { id: '这是一段文本', date: '20200730', money: '12121' },
            })
          }}
          extra={<Button type="link" {...({ id: 'reload' } as any)}>修改</Button>}
          params={params.value}
          columns={[
            { label: '文本', dataIndex: 'id' },
            { dataIndex: 'date', label: '日期', valueType: 'date' },
            { label: 'money', dataIndex: 'money', valueType: 'money' },
          ]}
        />
      ),
    })

    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(wrapper.text()).toContain('这是一段文本')
    })

    params.value = { name: 'qixian' }
    await nextTick()

    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  it('🥩 test request error', async () => {
    const fn = vi.fn()

    mountAttached({
      render: () => (
        <ProDescriptions
          title="高级定义列表 request"
          request={async () => {
            throw new Error('load error')
          }}
          onRequestError={fn}
          extra={<Button type="link" {...({ id: 'reload' } as any)}>修改</Button>}
          columns={[
            { label: '文本', dataIndex: 'id' },
            { dataIndex: 'date', label: '日期', valueType: 'date' },
            { label: 'money', dataIndex: 'money', valueType: 'money' },
          ]}
        />
      ),
    })

    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  it('🏊 Progress', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          columns={[
            { label: '进度条1', valueType: 'progress', children: 40 },
            { label: '进度条2', valueType: 'progress', children: -1 },
            { label: '进度条3', valueType: 'progress', children: 100 },
          ]}
        />
      ),
    })

    await waitFor(() => {
      expect(wrapper.find('.ant-progress-indicator').text()).toContain('40%')
    })
    await waitFor(() => {
      expect(wrapper.findAll('.ant-progress-indicator')[1].find('.anticon-close-circle').exists()).toBeTruthy()
      expect(wrapper.findAll('.ant-progress-indicator')[2].find('.anticon-check-circle').exists()).toBeTruthy()
    })
  })

  it('🏊 ProDescriptions support order', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          dataSource={{
            title: 'test',
          }}
          columns={[
            {
              title: '标题',
              dataIndex: 'title',
              valueType: 'text',
              order: 100,
            },
            { order: 9, label: '进度条1', valueType: 'progress', children: 40 },
            { label: '进度条2', valueType: 'progress', children: -1 },
            { order: 8, label: '进度条3', valueType: 'progress', children: 100 },
          ]}
        />
      ),
    })

    const labels = wrapper.findAll('.ant-descriptions-item-label')
    expect(labels.length).toBe(4)
    expect(labels[0].text()).toBe('标题')
    expect(labels[1].text()).toBe('进度条1')
    expect(labels[2].text()).toBe('进度条3')
    expect(labels[3].text()).toBe('进度条2')
  })

  it('📝 typography support and copy', async () => {
    const showCopy = ref(true)
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          title="dataSource and columns"
          dataSource={{
            id: '这是一段文本columns',
            date: '20200809',
            money: '1212100',
            state: 'all',
            state2: 'open',
          }}
          columns={[
            showCopy.value
              ? {
                  title: '文本',
                  key: 'text',
                  dataIndex: 'id',
                  ellipsis: true,
                  copyable: true,
                }
              : {
                  title: '文本',
                  key: 'text',
                  dataIndex: 'id',
                },
          ]}
        />
      ),
    })

    await waitFor(() => {
      expect(wrapper.find('span.ant-descriptions-item-content button.ant-typography-copy').exists()).toBeTruthy()
    })

    showCopy.value = false
    await nextTick()

    await waitFor(() => {
      expect(wrapper.findAll('.ant-descriptions-item-content .ant-typography-copy').length).toBe(0)
    })
  })

  it('🐛 copyable 复制 renderText 返回 JSX 时应使用原始值而非 [object Object]', async () => {
    const RAW_VALUE = '13800138000'
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard

    try {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      })

      const wrapper = mountAttached({
        render: () => (
          <ProDescriptions
            dataSource={{
              phone: RAW_VALUE,
              phoneVerified: true,
            }}
            columns={[
              {
                title: '手机号',
                dataIndex: 'phone',
                copyable: true,
                renderText: (text: string, row: any) =>
                  text
                    ? (
                        <span>
                          {row.phoneVerified ? <Badge status="success" /> : <Badge status="error" />}
                          &nbsp;
                          {text}
                        </span>
                      )
                    : text,
              },
            ]}
          />
        ),
      })

      await waitFor(() => {
        expect(wrapper.find('button.ant-typography-copy').exists()).toBeTruthy()
      })

      await wrapper.find('button.ant-typography-copy').trigger('click')

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(RAW_VALUE)
        expect(writeTextMock).not.toHaveBeenCalledWith('[object Object]')
      })
    }
    finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      })
    }
  })
})
