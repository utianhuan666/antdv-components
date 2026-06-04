// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { ProForm, ProFormText } from '@antdv/components'
import { mountAttached, waitFor } from '../testUtils'

describe('ProForm transform (docs + regression tests)', () => {
  it('supports the "simple" pattern: transform={(v) => fn(v)} (return primitive)', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={fn}>
          <ProFormText name="name" initialValue="antdv" transform={(value: string) => ({ name: `${value}-next` })} />
        </ProForm>
      ),
    })

    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith({ name: 'antdv-next' })
    })
  })

  it('regression: namePath should be a string[] (nested name)', async () => {
    const transform = vi.fn((value, namePath) => ({ joined: `${namePath.join('.')}:${value}` }))
    const fn = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={fn}>
          <ProFormText name={['user', 'name']} initialValue="qixian" transform={transform} />
        </ProForm>
      ),
    })

    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(transform).toHaveBeenCalledWith('qixian', ['user', 'name'])
      expect(fn).toHaveBeenCalledWith({ joined: 'user.name:qixian' })
    })
  })

  it('expectation: transform should run on every submit even with initialValue (regression)', async () => {
    const transform = vi.fn(value => ({ name: value }))
    const fn = vi.fn()
    const formRef = shallowRef<any>()
    mountAttached({
      setup() {
        return () => (
          <ProForm ref={formRef} onFinish={fn}>
            <ProFormText name="name" initialValue="antdv" transform={transform} />
          </ProForm>
        )
      },
    })

    await nextTick()
    await formRef.value?.submit?.()
    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(1)
    })
    await formRef.value?.submit?.()

    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn).toHaveBeenNthCalledWith(1, { name: 'antdv' })
      expect(fn).toHaveBeenNthCalledWith(2, { name: 'antdv' })
      expect(transform).toHaveBeenCalledWith('antdv', ['name'])
    })
  })
})
