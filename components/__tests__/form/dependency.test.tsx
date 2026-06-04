// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { ProForm, ProFormDependency, ProFormText } from '@antdv/components'
import { mountAttached, waitFor } from '../testUtils'

describe('ProForm Dependency component', () => {
  it('⛲ shouldUpdate of ProFormDependency is Boolean', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm initialValues={{ name: 'antdv' }}>
          <ProFormText name="name" />
          <ProFormDependency name={['name']}>
            {(values: any) => <span class="dependency-value">{values.name}</span>}
          </ProFormDependency>
        </ProForm>
      ),
    })

    await nextTick()

    expect(wrapper.find('.dependency-value').text()).toBe('antdv')
  })

  it('⛲ ProFormDependency support transform', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={fn} initialValues={{ name: 'antdv' }}>
          <ProFormText name="name" transform={(value: string) => ({ transformedName: value })} />
          <ProFormDependency name={['name']}>
            {(values: any) => <span>{values.name}</span>}
          </ProFormDependency>
        </ProForm>
      ),
    })

    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith({ transformedName: 'antdv' })
    })
  })
})
