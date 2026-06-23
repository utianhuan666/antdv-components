import type { ProColumns } from '../../index'
import { afterEach, describe, expect, it } from 'vitest'
import { ProTable } from '../../index'
import { cleanup, render, waitForWaitTime } from '../testUtils'
import { request } from './fixtures'
import './tableTestSetup'

afterEach(() => {
  cleanup()
})

describe('proTable Complex Columns', () => {
  it('🎏 should render nested columns', async () => {
    const columns: ProColumns[] = [
      {
        title: '基本信息',
        children: [
          { title: '姓名', dataIndex: 'name' },
          { title: '年龄', dataIndex: 'age' },
        ],
      },
    ]

    const html = render(
      <ProTable columns={columns} request={request} rowKey="key" />,
    )

    await waitForWaitTime(500)

    expect(await html.findByText('基本信息')).toBeTruthy()
    expect(await html.findByText('姓名')).toBeTruthy()
  })

  it('🎏 should handle column with hideInTable', async () => {
    const columns: ProColumns[] = [
      { title: '姓名', dataIndex: 'name' },
      { title: '隐藏列', dataIndex: 'hidden', hideInTable: true },
    ]

    const html = render(
      <ProTable columns={columns} request={request} rowKey="key" />,
    )

    await waitForWaitTime(1000)

    expect(await html.findByText('姓名')).toBeTruthy()
    expect(html.queryByText('隐藏列')).toBeFalsy()
  })

  it('🎏 should render fixed columns', async () => {
    const columns: ProColumns[] = [
      { title: '固定左', dataIndex: 'left', fixed: 'left', width: 100 },
      { title: '中间', dataIndex: 'middle' },
      { title: '固定右', dataIndex: 'right', fixed: 'right', width: 100 },
    ]

    const html = render(
      <ProTable columns={columns} request={request} rowKey="key" scroll={{ x: 1000 }} />,
    )

    await waitForWaitTime(500)

    expect(await html.findByText('固定左')).toBeTruthy()
    expect(await html.findByText('固定右')).toBeTruthy()
  })

  it('🎏 should handle column with tooltip', async () => {
    const columns: ProColumns[] = [
      {
        title: '姓名',
        dataIndex: 'name',
        tooltip: '这是姓名提示',
      },
    ]

    const html = render(
      <ProTable columns={columns} request={request} rowKey="key" />,
    )

    await waitForWaitTime(500)

    const questionIcon = html.container.querySelector('.anticon-question-circle')
    expect(questionIcon).toBeTruthy()
  })
})
