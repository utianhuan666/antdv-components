import type { ProDescriptionsActionType, ProDescriptionsItemProps } from '../../descriptions'
import type { RowEditableConfig } from '../../descriptions/typing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref, watch } from 'vue'
import { ProDescriptions } from '../../descriptions'
import { mountAttached, waitFor } from '../testUtils'

interface DataSourceType {
  id: number
  title?: string
  labels?: {
    name: string
    color: string
  }[]
  state?: string
  time?: {
    created_at?: number | string
  }
  children?: DataSourceType
}

const defaultData: DataSourceType = {
  id: 624748504,
  title: '🐛 [BUG]yarn install命令 antd2.4.5会报错',
  labels: [{ name: 'bug', color: 'error' }],
  time: {
    created_at: 1590486176000,
  },
  state: 'processing',
}

function createDefaultData(): DataSourceType {
  return {
    ...defaultData,
    labels: defaultData.labels?.map(item => ({ ...item })),
    time: { ...defaultData.time },
  }
}

const columns: ProDescriptionsItemProps<DataSourceType>[] = [
  {
    dataIndex: 'index',
    valueType: 'indexBorder',
  },
  {
    title: '标题',
    dataIndex: 'title',
    copyable: true,
    ellipsis: true,
    tooltip: '标题过长会自动收缩',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
  },
  {
    title: '状态',
    dataIndex: 'state',
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
      processing: {
        text: '解决中',
        status: 'Processing',
      },
    },
  },
  {
    title: '创建时间',
    dataIndex: ['time', 'created_at'],
  },
]

const DescriptionsDemo = defineComponent({
  name: 'DescriptionsDemo',
  props: [
    'type',
    'defaultKeys',
    'editorRowKeys',
    'onEditorChange',
    'dataSource',
    'onDataSourceChange',
    'onSave',
    'onCancel',
  ],
  setup(props) {
    const actionRef = ref<ProDescriptionsActionType<DataSourceType>>()
    const editableKeys = ref<any[]>(props.editorRowKeys || props.defaultKeys || [])
    const dataSource = ref<DataSourceType | undefined>(props.dataSource)

    watch(() => props.editorRowKeys, (value) => {
      if (value)
        editableKeys.value = value
    })
    watch(() => props.dataSource, (value) => {
      if (value)
        dataSource.value = value
    })

    function setEditorRowKeys(keys: any[]) {
      editableKeys.value = keys
      props.onEditorChange?.(keys)
    }

    function handleDataSourceChange(value: DataSourceType | undefined) {
      if (value !== undefined) {
        dataSource.value = value
        props.onDataSourceChange?.(value)
      }
    }

    function resetFields() {
      actionRef.value?.setDataSource(createDefaultData())
    }

    return () => (
      <ProDescriptions
        columns={columns}
        actionRef={actionRef}
        request={async () => ({
          data: createDefaultData(),
          total: 3,
          success: true,
        })}
        title={<a id="reset_test" onClick={resetFields}>重置</a>}
        dataSource={dataSource.value}
        onDataSourceChange={handleDataSourceChange}
        editable={{
          ...(props as any),
          type: props.type,
          editableKeys: editableKeys.value,
          onSave: props.onSave,
          onCancel: props.onCancel,
          onChange: keys => setEditorRowKeys(keys as any[]),
        } as RowEditableConfig<DataSourceType>}
      />
    )
  },
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('descriptions', () => {
  it('📝 Descriptions close editable', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          title="基本使用"
          columns={columns}
          dataSource={defaultData}
        />
      ),
    })

    await waitFor(() => {
      expect(wrapper.text()).toContain('基本使用')
    })
    expect(wrapper.find('.anticon-edit').exists()).toBeFalsy()
  })

  it('📝 Descriptions support editable', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          title="基本使用"
          columns={columns}
          dataSource={defaultData}
          editable={{}}
        />
      ),
    })
    await waitFor(() => {
      expect(wrapper.text()).toContain('基本使用')
    })
    expect(wrapper.find('.anticon-edit').exists()).toBeTruthy()
  })

  it('📝 support onEditorChange', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo onEditorChange={(keys: any[]) => fn(keys)} />)
    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })

    await wrapper.findAll('span.anticon-edit')[0].trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(['title'])
    })
  })

  it('📝 support set Form', async () => {
    const wrapper = mountAttached(<DescriptionsDemo editorRowKeys={['title']} />)

    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })

    const input = wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].find('.ant-input')
    await input.setValue('test')
    await waitFor(() => {
      expect((input.element as HTMLInputElement).value).toBe('test')
    })

    await wrapper.find('#reset_test').trigger('click')
    await waitFor(() => {
      expect((wrapper.find('.ant-input').element as HTMLInputElement).value).toBe('🐛 [BUG]yarn install命令 antd2.4.5会报错')
    })
  })

  it('📝 formItemRender run defaultRender', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          editable={{
            editableKeys: ['title'],
          }}
          columns={[
            {
              dataIndex: 'title',
              formItemRender: (_item: any, config: any) => {
                return config.defaultRender()
              },
            },
          ]}
          dataSource={createDefaultData()}
        />
      ),
    })

    expect(wrapper.find('input.ant-input').exists()).toBeTruthy()
    expect(wrapper.find('.ant-form-item').exists()).toBeTruthy()
  })

  it('📝 formItemRender receives editable form as third argument', async () => {
    const formSpy = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          editable={{
            editableKeys: ['title'],
          }}
          columns={[
            {
              dataIndex: 'title',
              formItemRender: (_item: any, config: any, form: any) => {
                formSpy(form)
                return config.defaultRender()
              },
            },
          ]}
          dataSource={createDefaultData()}
        />
      ),
    })

    await waitFor(() => {
      expect(wrapper.find('input.ant-input').exists()).toBeTruthy()
      expect(formSpy).toHaveBeenCalled()
      const lastForm = formSpy.mock.calls[formSpy.mock.calls.length - 1]?.[0]
      expect(lastForm?.resetFields).toEqual(expect.any(Function))
      expect(lastForm?.validateFields).toEqual(expect.any(Function))
    })
  })

  it('📝 formItemRender form.resetFields resets editable value', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          editable={{
            editableKeys: ['title'],
          }}
          columns={[
            {
              dataIndex: 'title',
              formItemRender: (_item: any, config: any, form: any) => (
                <span>
                  {config.defaultRender()}
                  <button id="reset_form" onClick={() => form.resetFields()}>
                    reset
                  </button>
                </span>
              ),
            },
          ]}
          dataSource={defaultData}
        />
      ),
    })

    await waitFor(() => {
      expect((wrapper.find('input.ant-input').element as HTMLInputElement).value).toBe(defaultData.title)
    })

    await wrapper.find('input.ant-input').setValue('changed title')
    await waitFor(() => {
      expect((wrapper.find('input.ant-input').element as HTMLInputElement).value).toBe('changed title')
    })

    await wrapper.find('#reset_form').trigger('click')

    await waitFor(() => {
      expect((wrapper.find('input.ant-input').element as HTMLInputElement).value).toBe(defaultData.title)
    })
  })

  it('📝 columns support editable test', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          editable={{
            editableKeys: ['title'],
          }}
          columns={[
            {
              dataIndex: 'title',
              editable: (_text: any, _record: any, index: number) => {
                return index === 0
              },
            },
            {
              dataIndex: 'title2',
              editable: false,
            },
          ]}
          dataSource={defaultData}
        />
      ),
    })

    expect(wrapper.find('input.ant-input').exists()).toBeTruthy()
    expect(wrapper.findAll('input.ant-input').length).toBe(1)
    expect(wrapper.find('.ant-descriptions').exists()).toBeTruthy()
  })

  it('📝 support actionRender', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProDescriptions
          editable={{
            editableKeys: ['title'],
            actionRender: () => [
              <div key="test" id="test">
                xx
              </div>,
            ],
          }}
          columns={[
            {
              dataIndex: 'title',
              editable: (_text: any, _record: any, index: number) => {
                return index === 0
              },
            },
            {
              dataIndex: 'title2',
              editable: false,
            },
          ]}
          dataSource={defaultData}
        />
      ),
    })
    expect(wrapper.text()).toContain('xx')
  })

  it('📝 support editorRowKeys', async () => {
    const wrapper = mountAttached(<DescriptionsDemo editorRowKeys={['title']} />)

    await waitFor(() => {
      expect((wrapper.find('input.ant-input').element as HTMLInputElement).value).toBe('🐛 [BUG]yarn install命令 antd2.4.5会报错')
    })

    expect(
      wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].findAll('input').length > 0,
    ).toBeTruthy()
    expect(
      wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[1].findAll('input').length > 0,
    ).toBeFalsy()
  })

  it('📝 support cancel click', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo onEditorChange={(keys: any[]) => fn(keys)} />)
    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })
    await wrapper.find('span.anticon-edit').trigger('click')
    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].findAll('input').length > 0).toBeTruthy()
    })

    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].find('span.anticon-close').trigger('click')
    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].findAll('input').length > 0).toBeFalsy()
    })
  })

  it('📝 support cancel click render false', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo onEditorChange={(keys: any[]) => fn(keys)} onCancel={async () => false} />)
    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })
    await wrapper.find('span.anticon-edit').trigger('click')
    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].findAll('input').length > 0).toBeTruthy()
    })

    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].find('span.anticon-close').trigger('click')
    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].findAll('input').length > 0).toBeFalsy()
    })
  })

  it('📝 type=single, only edit one rows', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo defaultKeys={['state']} onEditorChange={(keys: any[]) => fn(keys)} />)
    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })
    await wrapper.find('span.anticon-edit').trigger('click')

    await nextTick()
    expect(fn).not.toHaveBeenCalled()
  })

  it('📝 type=multiple, edit multiple rows', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo type="multiple" defaultKeys={['state']} onEditorChange={(keys: any[]) => fn(keys)} />)
    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })
    await wrapper.find('span.anticon-edit').trigger('click')
    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(['state', 'title'])
    })
  })

  it('📝 support onSave', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo onSave={(key: any) => fn(key)} />)
    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })
    await wrapper.findAll('span.anticon-edit')[1].trigger('click')

    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[1].findAll('input').length > 0).toBeTruthy()
    })

    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[1].find('span.anticon-check').trigger('click')
    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('state')
    })
  })

  it('📝 support onSave support false', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(
      <DescriptionsDemo
        onSave={async (key: any) => {
          fn(key)
          return false
        }}
      />,
    )

    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })

    await wrapper.findAll('span.anticon-edit')[1].trigger('click')
    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[1].findAll('input').length > 0).toBeTruthy()
    })

    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[1].find('span.anticon-check').trigger('click')

    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[1].findAll('input').length > 0).toBeTruthy()
    })
    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('state')
    })
  })

  it('📝 support onCancel', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo onCancel={(key: any) => fn(key)} />)

    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })

    await wrapper.findAll('span.anticon-edit')[1].trigger('click')
    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[1].findAll('input').length > 0).toBeTruthy()
    })
    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[1].find('span.anticon-close').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('state')
    })
  })

  it('📝 support form rules', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo onSave={(_key: any, row: any) => fn(row.title)} />)

    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })

    await wrapper.findAll('span.anticon-edit')[0].trigger('click')
    await waitFor(() => {
      expect(wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].findAll('input').length > 0).toBeTruthy()
    })

    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].find('input').setValue('')
    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].find('span.anticon-check').trigger('click')

    await nextTick()
    expect(fn).not.toHaveBeenCalled()

    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].find('input').setValue('qixian')
    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[0].find('span.anticon-check').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('qixian')
    })
  })

  it('📝 when dataIndex is array', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached(<DescriptionsDemo onSave={(_key: any, row: any) => fn(row?.time?.created_at)} />)
    await waitFor(() => {
      expect(wrapper.text()).toContain('重置')
    })

    await wrapper.findAll('span.anticon-edit')[2].trigger('click')
    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[2].find('input.ant-input').setValue('2021-05-26 09:42:56')
    await wrapper.findAll('td.ant-descriptions-item .ant-descriptions-item-content')[2].find('span.anticon-check').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('2021-05-26 09:42:56')
    })
  })
})
