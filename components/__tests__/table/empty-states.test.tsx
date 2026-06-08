import { afterEach, describe, expect, it } from 'vitest'
import { ProTable } from '../../index'
import { cleanup, render, waitForWaitTime } from '../testUtils'
import { columns } from './fixtures'
import './tableTestSetup'

afterEach(() => {
  cleanup()
})

describe('proTable Empty States', () => {
  it('🎏 should render empty state when data is empty array', async () => {
    const html = render(
      <ProTable
        columns={columns}
        request={async () => ({
          data: [],
          success: true,
          total: 0,
        })}
        rowKey="key"
      />,
    )

    await waitForWaitTime(1000)

    expect(html.container.querySelector('.ant-empty')).toBeTruthy()
  })

  it('🎏 should render custom empty text', async () => {
    const html = render(
      <ProTable
        columns={columns}
        request={async () => ({
          data: [],
          success: true,
        })}
        locale={{ emptyText: '暂无数据' }}
        rowKey="key"
      />,
    )

    await waitForWaitTime(500)

    expect(html.container.textContent).toContain('暂无数据')
  })

  it('🎏 should handle undefined data in response', async () => {
    const html = render(
      <ProTable
        columns={columns}
        request={async () => ({
          success: true,
        } as any)}
        rowKey="key"
      />,
    )

    await waitForWaitTime(500)

    // Should not crash
    expect(html.container.querySelector('.ant-table')).toBeTruthy()
  })

  it('🎏 should show loading state before data loads', async () => {
    const html = render(
      <ProTable
        columns={columns}
        request={async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return {
            data: [],
            success: true,
          }
        }}
        rowKey="key"
      />,
    )

    // Should show loading initially
    expect(html.container.querySelector('.ant-spin')).toBeTruthy()

    await waitForWaitTime(500)

    // Loading should be gone
    expect(html.container.querySelector('.ant-spin-spinning')).toBeFalsy()
  })

  it('🎏 should render with no request prop and dataSource', async () => {
    const html = render(
      <ProTable
        columns={columns}
        dataSource={[
          { key: 1, name: 'Test 1' },
          { key: 2, name: 'Test 2' },
        ]}
        rowKey="key"
      />,
    )

    await waitForWaitTime(200)

    expect(html.container.querySelectorAll('.ant-table-row').length).toBe(2)
  })
})
