import { Button } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProTable } from '../../index'
import { cleanup, fireEvent, render, waitForWaitTime } from '../testUtils'
import { columns, request } from './fixtures'
import './tableTestSetup'

afterEach(() => {
  cleanup()
})

describe('proTable Toolbar Customization', () => {
  it('🎏 should render custom toolbar buttons', async () => {
    const customAction = vi.fn()
    const html = render(
      <ProTable
        columns={columns}
        request={request}
        toolBarRender={() => [
          <Button key="custom" onClick={customAction}>
            自定义按钮
          </Button>,
        ]}
        rowKey="key"
      />,
    )

    await waitForWaitTime(1000)

    const customBtn = await html.findByText('自定义按钮')
    expect(customBtn).toBeTruthy()

    await fireEvent.click(customBtn)
    await waitForWaitTime(200)
    expect(customAction).toHaveBeenCalled()
  })

  it('🎏 should hide toolbar when options=false and no toolBarRender', async () => {
    const html = render(
      <ProTable
        columns={columns}
        request={request}
        options={false}
        search={false}
        rowKey="key"
      />,
    )

    await waitForWaitTime(1000)

    expect(html.container.querySelector('.ant-pro-table-list-toolbar')).toBeFalsy()
  })

  it('🎏 should render toolbar with only custom actions when options=false', async () => {
    const html = render(
      <ProTable
        columns={columns}
        request={request}
        options={false}
        toolBarRender={() => [<Button key="export">导出</Button>]}
        rowKey="key"
      />,
    )

    await waitForWaitTime(1000)

    expect(html.container.querySelector('.ant-pro-table-list-toolbar')).toBeTruthy()
    expect(await html.findByText('导出')).toBeTruthy()
  })

  it('🎏 should render headerTitle as function', async () => {
    const html = render(
      <ProTable
        columns={columns}
        request={request}
        headerTitle={() => <span>动态标题</span>}
        rowKey="key"
      />,
    )

    await waitForWaitTime(1000)

    expect(await html.findByText('动态标题')).toBeTruthy()
  })
})
