import { FieldSelect, FieldText, FieldTextArea, ProField } from '@antdv/components'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, shallowRef } from 'vue'
import { ProConfigProvider } from '../../provider'
import { waitFor } from '../testUtils'

async function settle() {
  await flushPromises()
  await nextTick()
}

describe('proField ref expose', () => {
  it('proxies inner input methods from FieldText ref', async () => {
    const fieldRef = shallowRef<any>()
    const wrapper = mount({
      render: () => (
        <FieldText
          ref={fieldRef}
          text="hello"
          mode="edit"
        />
      ),
    }, {
      attachTo: document.body,
    })

    await settle()
    expect(typeof fieldRef.value?.focus).toBe('function')

    fieldRef.value?.focus?.()
    await settle()

    expect(document.activeElement).toBe(wrapper.find('input').element)
    wrapper.unmount()
  })

  it('keeps fetchData and inner methods on FieldSelect ref', async () => {
    const fieldRef = shallowRef<any>()
    const request = vi.fn(async () => [{ label: 'Open', value: 'open' }])

    mount({
      render: () => (
        <FieldSelect
          ref={fieldRef}
          text="open"
          mode="edit"
          request={request}
        />
      ),
    })

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1)
    })
    expect(typeof fieldRef.value?.fetchData).toBe('function')

    fieldRef.value?.fetchData?.('closed')
    await settle()

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(2)
    })
  })

  it('keeps DOM expose on FieldTextArea readonly ref', async () => {
    const fieldRef = shallowRef<any>()

    mount({
      render: () => (
        <FieldTextArea
          ref={fieldRef}
          text="hello"
          mode="read"
        />
      ),
    })

    await settle()
    expect(fieldRef.value?.$el).toBeInstanceOf(HTMLElement)
  })

  it('keeps custom valueTypeMap refs on exposed instance', async () => {
    const focus = vi.fn()
    const fieldRef = shallowRef<any>()
    const CustomField = defineComponent({
      name: 'CustomValueTypeField',
      setup(_, { expose }) {
        expose({ focus })
        return () => <input id="custom-ref-input" />
      },
    })

    const wrapper = mount({
      render: () => (
        <ProConfigProvider
          valueTypeMap={{
            customRef: {
              render: (_text, currentProps) => <CustomField ref={(currentProps as any).ref} />,
              formItemRender: (_text, currentProps) => <CustomField ref={(currentProps as any).ref} />,
            },
          }}
        >
          <ProField ref={fieldRef} text="test" valueType="customRef" mode="edit" />
        </ProConfigProvider>
      ),
    })

    await settle()
    expect(typeof fieldRef.value?.focus).toBe('function')

    fieldRef.value?.focus?.()

    expect(focus).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
