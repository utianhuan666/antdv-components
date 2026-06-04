import { BetaSchemaForm } from '@antdv/components'
// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountAttached, waitFor } from '../testUtils'

describe('schemaForm', () => {
  it('supports columns and ignores table-only valueTypes', async () => {
    const wrapper = mountAttached({
      render: () => (
        <BetaSchemaForm
          columns={[
            { title: '序号', dataIndex: 'index', valueType: 'indexBorder' },
            { title: '标题', dataIndex: 'title', fieldProps: { id: 'title' } },
            {
              title: '状态',
              dataIndex: 'state',
              valueType: 'select',
              valueEnum: {
                open: { text: '未解决' },
                closed: { text: '已解决' },
              },
            },
            { title: '创建时间', dataIndex: 'created_at', valueType: 'dateTime' },
            { title: 'option', dataIndex: 'id', valueType: 'option' },
          ]}
        />
      ),
    })

    await nextTick()

    expect(wrapper.find('form.ant-form').exists()).toBe(true)
    expect(wrapper.findAll('.ant-form-item')).toHaveLength(3)
    expect(wrapper.find('.ant-select').exists()).toBe(true)
    expect(wrapper.find('.ant-picker').exists()).toBe(true)
  })

  it('supports render, formItemRender defaultRender, and hideInForm', async () => {
    const wrapper = mountAttached({
      render: () => (
        <BetaSchemaForm
          columns={[
            {
              title: '自定义',
              dataIndex: 'custom',
              readonly: true,
              render: () => <input data-test="rendered" />,
            },
            {
              title: '默认渲染',
              dataIndex: 'title',
              formItemRender: (_, { defaultRender }) => <div class="custom-render">{defaultRender()}</div>,
            },
            {
              title: '隐藏',
              dataIndex: 'hidden',
              hideInForm: true,
              formItemRender: () => <input id="hidden" />,
            },
          ]}
        />
      ),
    })

    await nextTick()

    expect(wrapper.find('[data-test="rendered"]').exists()).toBe(true)
    expect(wrapper.find('.custom-render input').exists()).toBe(true)
    expect(wrapper.find('#hidden').exists()).toBe(false)
  })

  it('updates dependency columns when dependent values change', async () => {
    const wrapper = mountAttached({
      render: () => (
        <BetaSchemaForm
          initialValues={{ name: 'antdv' }}
          columns={[
            { title: '名称', dataIndex: 'name', fieldProps: { id: 'name' } },
            {
              valueType: 'dependency',
              name: ['name'],
              columns: values => [
                {
                  dataIndex: 'mode',
                  title: () => (
                    <span id="dep-label">
                      当前：
                      {values.name}
                    </span>
                  ),
                },
              ],
            },
          ]}
        />
      ),
    })

    await waitFor(() => {
      expect(wrapper.find('#dep-label').text()).toBe('当前：antdv')
    })

    await wrapper.find('input#name').setValue('schema')

    await waitFor(() => {
      expect(wrapper.find('#dep-label').text()).toBe('当前：schema')
    })
  })

  it('passes fieldProps/formItemProps functions through dependencies and shouldUpdate', async () => {
    const fieldProps = vi.fn(() => ({ id: 'state' }))
    const formItemProps = vi.fn(() => ({}))

    const wrapper = mountAttached({
      render: () => (
        <BetaSchemaForm
          shouldUpdate={false}
          initialValues={{ title: 'name' }}
          columns={[
            { title: '标题', dataIndex: 'title', fieldProps: { id: 'title' } },
            {
              title: '状态',
              dataIndex: 'state',
              dependencies: ['title'],
              fieldProps,
              formItemProps,
            },
          ]}
        />
      ),
    })

    await waitFor(() => {
      expect(fieldProps).toHaveBeenCalled()
      expect(formItemProps).toHaveBeenCalled()
    })

    const before = fieldProps.mock.calls.length
    await wrapper.find('input#title').setValue('changed')

    await waitFor(() => {
      expect(fieldProps.mock.calls.length).toBeGreaterThan(before)
    })
  })
})
