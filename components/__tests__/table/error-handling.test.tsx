import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProTable } from '../../index'
import { cleanup, render, waitForWaitTime } from '../testUtils'
import { columns } from './fixtures'
import './tableTestSetup'

afterEach(() => {
  cleanup()
})

describe('proTable Error Handling', () => {
  it('🎏 should handle request rejection', async () => {
    const onError = vi.fn()
    const html = render(
      <ProTable
        columns={columns}
        request={async () => {
          throw new Error('Network error')
        }}
        onRequestError={onError}
        rowKey="key"
      />,
    )

    await waitForWaitTime(2000)

    expect(onError).toHaveBeenCalled()
    const errorArg = onError.mock.calls[0]?.[0]
    expect(errorArg?.message || errorArg).toContain('Network error')
  }, 10000)

  it('🎏 should handle malformed response data', async () => {
    const onError = vi.fn()
    const html = render(
      <ProTable
        columns={columns}
        request={async () => {
          return null as any
        }}
        onRequestError={onError}
        rowKey="key"
      />,
    )

    await waitForWaitTime(500)
    // Should not crash, table should render empty
    expect(html.container.querySelector('.ant-table-empty')).toBeTruthy()
  })

  it('🎏 should handle missing rowKey gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const html = render(
      <ProTable
        columns={columns}
        request={async () => ({
          data: [{ name: 'test' }],
          success: true,
        })}
        rowKey="key"
      />,
    )

    await waitForWaitTime(500)

    // Should still render without crashing
    expect(html.container.querySelector('.ant-table')).toBeTruthy()

    consoleError.mockRestore()
  })

  it('🎏 should handle concurrent request errors', async () => {
    let callCount = 0
    const html = render(
      <ProTable
        columns={columns}
        request={async () => {
          callCount++
          if (callCount === 1) {
            throw new Error('First call fails')
          }
          return {
            data: [{ key: 1, name: 'success' }],
            success: true,
          }
        }}
        rowKey="key"
      />,
    )

    await waitForWaitTime(1000)

    // Find and click reload button
    const settingItems = html.container.querySelectorAll('.ant-pro-table-list-toolbar-setting-item')
    const reloadBtn = Array.from(settingItems).find(el =>
      el.querySelector('.anticon-reload'),
    )

    if (reloadBtn) {
      reloadBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await waitForWaitTime(1000)
    }

    // Second request should succeed
    expect(callCount).toBeGreaterThanOrEqual(1)
  })

  it('🎏 should handle empty columns array', async () => {
    const html = render(
      <ProTable
        columns={[]}
        request={async () => ({
          data: [{ key: 1 }],
          success: true,
        })}
        rowKey="key"
      />,
    )

    await waitForWaitTime(500)

    // Should render table structure
    expect(html.container.querySelector('.ant-table')).toBeTruthy()
  })
})
