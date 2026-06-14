import type {
  ProFormColumnsType,
  ProFormLayoutType,
} from '../../form'
import { BetaSchemaForm } from '../../form'
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '../testUtils'
import { afterEach, describe, expect, it, vi } from 'vitest'

const columns: ProFormColumnsType<any>[] = [
  {
    title: '序号',
    dataIndex: 'index',
    valueType: 'indexBorder',
  },
  {
    title: '标题',
    dataIndex: 'title',
    width: 200,
  },
  {
    title: (_: any, type: any) => (type === 'table' ? '状态' : '列表状态'),
    dataIndex: 'state',
    initialValue: 'all',
    valueType: 'select',
    valueEnum: {
      all: { text: '全部', status: 'Default' },
      open: {
        text: '未解决',
        status: 'Error',
      },
      closed: {
        text: '已解决',
        status: 'Success',
      },
    },
  },
  {
    title: '创建时间',
    key: 'since',
    dataIndex: 'created_at',
    valueType: 'dateTime',
  },
]

afterEach(() => {
  cleanup()
})

describe('SchemaForm', () => {
  it('😊 SchemaForm support columns', () => {
    const { container } = render(<BetaSchemaForm columns={columns} />)

    expect(container.querySelector('form.ant-form')).toBeTruthy()
    const formItems = container.querySelectorAll('.ant-form-item')
    expect(formItems.length).toBeGreaterThan(0)
    expect(container.querySelector('.ant-select')).toBeTruthy()
    expect(container.querySelector('.ant-picker')).toBeTruthy()
  })

  it('😊 SchemaForm support dependencies', async () => {
    const requestFn = vi.fn()
    const { container } = render(
      <BetaSchemaForm
        columns={[
          {
            title: '标题',
            dataIndex: 'title',
            width: 200,
            initialValue: 'name',
            fieldProps: {
              id: 'title',
            },
          },
          {
            title: '选择器',
            dataIndex: 'state',
            valueType: 'select',
            dependencies: ['title'],
            request: async ({ title }: any) => {
              requestFn(title)
              return [
                {
                  label: title,
                  value: 'title',
                },
              ]
            },
          },
        ]}
      />,
    )

    await waitFor(() => {
      expect(requestFn).toHaveBeenCalledWith('name')
    })

    fireEvent.change(container.querySelector('input#title')!, {
      target: {
        value: 'qixian',
      },
    })

    await waitFor(() => {
      expect(requestFn).toHaveBeenCalledWith('qixian')
    })
  })

  it('😊 SchemaForm support shouldUpdate as true', async () => {
    const onValuesChangeFn = vi.fn()
    const { container } = render(
      <BetaSchemaForm
        columns={[
          {
            title: '标题',
            dataIndex: 'title',
            width: 200,
            initialValue: 'name',
            fieldProps: {
              id: 'title',
            },
          },
          {
            title: '选择器',
            dataIndex: 'state',
            valueType: 'select',
            valueEnum: {},
          },
        ]}
        onValuesChange={onValuesChangeFn}
      />,
    )

    fireEvent.change(container.querySelector('input#title')!, {
      target: {
        value: 'qixian',
      },
    })

    await waitFor(() => {
      expect(onValuesChangeFn).toHaveBeenCalled()
    })
  })

  it('😊 SchemaForm support basic layoutType loop', () => {
    ;(['Form', 'QueryFilter'] as ProFormLayoutType[]).forEach((layoutType) => {
      const { container, unmount } = render(
        <BetaSchemaForm layoutType={layoutType} columns={columns.slice(0, 2)} />,
      )
      expect(container.querySelector('form.ant-form')).toBeTruthy()
      unmount()
    })
  })
})
