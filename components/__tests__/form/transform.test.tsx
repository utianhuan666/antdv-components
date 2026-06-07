import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { ProForm, ProFormText } from '../../form'
import { mountAttached, waitFor } from '../testUtils'

describe('proForm transform (docs + regression tests)', () => {
  it('supports the "simple" pattern: transform={(v) => fn(v)} (return primitive)', async () => {
    const fn = vi.fn()
    const formRef = shallowRef<any>()

    mountAttached({
      setup() {
        return () => (
          <ProForm
            formRef={formRef}
            onFinish={async (values: any) => {
              fn(values)
            }}
          >
            <ProFormText name="name" transform={(value: string) => `${value}:suffix`} />
          </ProForm>
        )
      },
    })

    await nextTick()
    formRef.value?.setFieldsValue?.({ name: 'foo' })
    await formRef.value?.submit?.()

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith({ name: 'foo:suffix' })
    })
  })

  it('regression: namePath should be a string[] (nested name)', async () => {
    const fn = vi.fn()
    const formRef = shallowRef<any>()

    mountAttached({
      setup() {
        return () => (
          <ProForm
            formRef={formRef}
            initialValues={{ company: { name: 'Acme' } }}
            onFinish={async (values: any) => {
              fn(values)
            }}
          >
            <ProFormText
              name={['company', 'name']}
              transform={(value: string, namePath: any) => {
                if (!Array.isArray(namePath)) {
                  return {
                    __transform_namePath_type: typeof namePath,
                    __transform_namePath_value: String(namePath),
                    __transform_value: value,
                  }
                }
                return { company: { name: `${value}:x` } }
              }}
            />
          </ProForm>
        )
      },
    })

    await nextTick()
    await formRef.value?.submit?.()

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith({
        company: { name: 'Acme:x' },
      })
    })
  })

  it('expectation: transform should run on every submit even with initialValue (regression)', async () => {
    const calls: any[] = []
    const formRef = shallowRef<any>()

    mountAttached({
      setup() {
        return () => (
          <ProForm
            formRef={formRef}
            onFinish={async (values: any) => {
              calls.push(values)
            }}
          >
            <ProFormText
              name="name111"
              initialValue="foo"
              transform={(value: string) => `${value}:1111`}
            />
          </ProForm>
        )
      },
    })

    await nextTick()
    await formRef.value?.submit?.()
    await waitFor(() => {
      expect(calls.length).toBe(1)
    })

    await formRef.value?.submit?.()

    await waitFor(() => {
      expect(calls.length).toBe(2)
      expect(calls[0]).toEqual({ name111: 'foo:1111' })
      expect(calls[1]).toEqual({ name111: 'foo:1111' })
    })
  })
})
