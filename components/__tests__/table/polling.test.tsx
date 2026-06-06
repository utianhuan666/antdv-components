import { mount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import ProTable from '../../table'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
]

function renderTable(props: Record<string, any>) {
  return mount(() => <ProTable rowKey="key" {...props} />, {
    attachTo: document.body,
  })
}

async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms)
  await Promise.resolve()
}

beforeAll(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  document.body.innerHTML = ''
})

afterAll(() => {
  vi.useRealTimers()
})

describe('polling', () => {
  it('polling should clearTime', async () => {
    const fn = vi.fn()

    renderTable({
      size: 'small',
      cardBordered: true,
      search: false,
      pagination: false,
      toolBarRender: false,
      columns,
      polling: 1500,
      request: async (params: any) => {
        fn(params)
        return {
          data: [{ key: '1', name: 'John Brown' }],
          success: true,
        }
      },
    })

    await advance(30)
    expect(fn).toHaveBeenCalledTimes(1)

    await advance(2000)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('polling min time is 2000', async () => {
    const fn = vi.fn()

    renderTable({
      size: 'small',
      cardBordered: true,
      search: false,
      pagination: false,
      columns,
      polling: 1000,
      request: async () => {
        fn()
        return {
          data: [],
          success: true,
        }
      },
    })

    await advance(30)
    expect(fn).toHaveBeenCalledTimes(1)

    await advance(1969)
    expect(fn).toHaveBeenCalledTimes(1)

    await advance(31)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('polling time=3000', async () => {
    const fn = vi.fn()

    renderTable({
      polling: 3000,
      size: 'small',
      cardBordered: true,
      search: false,
      pagination: false,
      toolBarRender: false,
      columns,
      request: async (params: any) => {
        fn(params)
        return {
          data: [{ key: '1', name: 'John Brown' }],
          success: true,
        }
      },
    })

    await advance(30)
    expect(fn).toHaveBeenCalledTimes(1)

    await advance(2969)
    expect(fn).toHaveBeenCalledTimes(1)

    await advance(31)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('polling support function', async () => {
    const fn = vi.fn()

    renderTable({
      polling: () => 2000,
      size: 'small',
      cardBordered: true,
      search: false,
      pagination: false,
      toolBarRender: false,
      columns,
      request: async (params: any) => {
        fn(params)
        return {
          data: [{ key: '1', name: 'John Brown' }],
          success: true,
        }
      },
    })

    await advance(30)
    expect(fn).toHaveBeenCalledTimes(1)

    await advance(2000)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
