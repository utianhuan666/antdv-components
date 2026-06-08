import { Input } from 'antdv-next'
import { afterEach, describe, expect, it } from 'vitest'
import { ProProvider } from '../../provider'
import ProTable from '../../table'
import { act, cleanup, fireEvent, render, waitForWaitTime } from '../testUtils'
import './tableTestSetup'

const cascaderOptions = [
  {
    field: 'front end',
    value: 'fe',
    language: [
      {
        field: 'Javascript',
        value: 'js',
      },
      {
        field: 'Typescript',
        value: 'ts',
      },
    ],
  },
  {
    field: 'back end',
    value: 'be',
    language: [
      {
        field: 'Java',
        value: 'java',
      },
      {
        field: 'Go',
        value: 'go',
      },
    ],
  },
]

const defaultProps = {
  columns: [
    {
      title: '标签',
      dataIndex: 'name',
      key: 'name',
      valueType: 'link',
      fieldProps: {
        color: 'red',
      },
    },
    {
      title: '树形下拉框',
      key: 'treeSelect',
      dataIndex: 'treeSelect',
      width: 100,
      fieldProps: {
        options: cascaderOptions,
        fieldNames: {
          children: 'language',
          label: 'field',
        },
        showSearch: true,
        filterTreeNode: true,
        multiple: true,
        treeNodeFilterProp: 'field',
      },
      valueType: 'treeSelect',
    },
  ],
  rowKey: 'key',
  request: () => {
    return Promise.resolve({
      total: 200,
      data: [
        {
          key: 0,
          name: 'TradeCode 0',
        },
      ],
      success: true,
    })
  },
}

afterEach(() => {
  cleanup()
})

describe('basicTable valueType', () => {
  it('🎏 table support user valueType', async () => {
    const html = render(
      <ProProvider.Provider
        value={
          {
            valueTypeMap: {
              link: {
                render: (text: any) => <a id="link">{text}</a>,
                formItemRender: (_: any, props: any) => (
                  <Input
                    placeholder="请输入链接"
                    id="name"
                    {...props?.fieldProps}
                  />
                ),
              },
            },
          } as any
        }
      >
        <ProTable
          form={{
            initialValues: { name: 'TradeCode' },
          }}
          {...defaultProps}
        />
      </ProProvider.Provider>,
    )
    await waitForWaitTime(1200)

    expect((await html.findAllByText('TradeCode 0')).length).toBe(1)

    expect(!!html.asFragment().querySelector('input#name')).toBeTruthy()

    expect(
      (html.asFragment().querySelector('input#name') as HTMLInputElement).value,
    ).toBe('TradeCode')

    html.unmount()
  })

  it('🎏 table valueType render support fieldProps', async () => {
    const html = render(
      <ProProvider.Provider
        value={
          {
            valueTypeMap: {
              link: {
                render: (text: any, { fieldProps }: any) => (
                  <a id="link">
                    {text}
                    {fieldProps.color}
                  </a>
                ),
                formItemRender: (_: any, props: any) => (
                  <Input
                    placeholder="请输入链接"
                    id="name"
                    {...props?.fieldProps}
                  />
                ),
              },
            },
          } as any
        }
      >
        <ProTable
          form={{
            initialValues: { name: 'TradeCode' },
          }}
          {...defaultProps}
        />
      </ProProvider.Provider>,
    )
    await waitForWaitTime(1200)

    expect((await html.findAllByText('TradeCode 0red')).length).toBe(1)

    expect(!!html.asFragment().querySelector('input#name')).toBeTruthy()

    expect(
      (html.asFragment().querySelector('input#name') as HTMLInputElement).value,
    ).toBe('TradeCode')

    html.unmount()
  })

  it('🎏 table support filter when valueType is treeSelect', async () => {
    const html = render(<ProTable {...defaultProps} />)
    await waitForWaitTime(1200)

    await act(() => {
      fireEvent.change(html.baseElement.querySelector('input#treeSelect')!, {
        target: {
          value: 'Ja',
        },
      })
    })
    await waitForWaitTime(300)
    expect(
      html.baseElement.querySelectorAll('span[title="Javascript"]').length,
    ).toBe(1)
    expect(html.baseElement.querySelectorAll('span[title="Java"]').length).toBe(
      1,
    )
    expect(
      html.baseElement.querySelectorAll('span[title="Typescript"]').length,
    ).toBe(0)
    expect(html.baseElement.querySelectorAll('span[title="Go"]').length).toBe(
      0,
    )

    await act(() => {
      fireEvent.change(html.baseElement.querySelector('input#treeSelect')!, {
        target: {
          value: 'Javasc',
        },
      })
    })
    await waitForWaitTime(300)
    expect(
      html.baseElement.querySelectorAll('span[title="Javascript"]').length,
    ).toBe(1)
    expect(html.baseElement.querySelectorAll('span[title="Java"]').length).toBe(
      0,
    )
    expect(
      html.baseElement.querySelectorAll('span[title="Typescript"]').length,
    ).toBe(0)
    expect(html.baseElement.querySelectorAll('span[title="Go"]').length).toBe(
      0,
    )
    expect(html.baseElement.querySelector('input#treeSelect')).toBeTruthy()
    expect(html.baseElement.querySelector('.ant-table')).toBeTruthy()

    html.unmount()
  })
})
