// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { ProForm, ProFormFieldSet, ProFormText } from '@antdv/components'
import { mountAttached, waitFor } from '../testUtils'

describe('ProFormFieldSet', () => {
  it('😊 ProFormFieldSet should render', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormFieldSet name="list" label="组合">
            <ProFormText />
            <ProFormText />
          </ProFormFieldSet>
        </ProForm>
      ),
    })

    expect(wrapper.text()).toContain('组合')
    expect(wrapper.findAll('.ant-input')).toHaveLength(2)
  })

  it('😊 ProFormFieldSet input changes', async () => {
    const onChange = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormFieldSet name="list" fieldProps={{ onChange }}>
            <ProFormText />
            <ProFormText />
          </ProFormFieldSet>
        </ProForm>
      ),
    })

    await wrapper.findAll('input')[0]!.setValue('first')

    expect(onChange).toHaveBeenCalledWith(['first'])
  })

  it('😊 ProFormFieldSet transform', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={fn}>
          <ProFormFieldSet
            name="list"
            initialValue={['a', 'b']}
            transform={(value: string[]) => ({ joined: value.join('-') })}
          >
            <ProFormText />
            <ProFormText />
          </ProFormFieldSet>
        </ProForm>
      ),
    })

    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith({ joined: 'a-b' })
    })
  })
})
