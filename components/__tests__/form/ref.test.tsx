import { afterEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import { ProForm, ProFormCascader, ProFormCheckbox, ProFormField, ProFormSelect } from '../../form'
import { act, cleanup, render, waitFor } from '../testUtils'

afterEach(() => {
  cleanup()
})

describe('ProForm ref expose', () => {
  it('exposes inner input methods from ProFormField', async () => {
    const fieldRef = shallowRef<any>()
    const html = render(
      <ProForm>
        <ProFormField ref={fieldRef} name="name" valueType="text" />
      </ProForm>,
    )

    await html.findByText('提 交')
    expect(typeof fieldRef.value?.focus).toBe('function')

    await act(async () => {
      fieldRef.value?.focus?.()
    })

    await waitFor(() => {
      expect((document.activeElement as HTMLInputElement | null)?.id).toBe('name')
    })
  })

  it('exposes fetchData from ProFormSelect ref', async () => {
    const selectRef = shallowRef<any>()
    const request = vi.fn(async () => [{ label: 'Open', value: 'open' }])
    render(
      <ProForm>
        <ProFormSelect ref={selectRef} name="status" request={request} />
      </ProForm>,
    )

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1)
    })
    expect(typeof selectRef.value?.fetchData).toBe('function')

    await act(async () => {
      selectRef.value?.fetchData?.('closed')
    })

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(2)
    })
  })

  it('exposes fetchData from ProFormCascader ref', async () => {
    const cascaderRef = shallowRef<any>()
    const request = vi.fn(async () => [{
      label: 'Parent',
      value: 'parent',
      children: [{ label: 'Child', value: 'child' }],
    }])

    render(
      <ProForm>
        <ProFormCascader ref={cascaderRef} name="region" request={request} />
      </ProForm>,
    )

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1)
    })
    expect(typeof cascaderRef.value?.fetchData).toBe('function')

    await act(async () => {
      cascaderRef.value?.fetchData?.('child')
    })

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(2)
    })
  })

  it('exposes native checkbox focus from ProFormCheckbox ref', async () => {
    const checkboxRef = shallowRef<any>()
    const html = render(
      <ProForm>
        <ProFormCheckbox ref={checkboxRef} name="agree">
          Agree
        </ProFormCheckbox>
      </ProForm>,
    )

    await html.findByText('Agree')
    expect(typeof checkboxRef.value?.focus).toBe('function')

    await act(async () => {
      checkboxRef.value?.focus?.()
    })

    await waitFor(() => {
      expect(document.activeElement).toBe(
        html.container.querySelector('input[type="checkbox"]'),
      )
    })
  })

  it('exposes fetchData from ProFormCheckbox.Group ref', async () => {
    const checkboxGroupRef = shallowRef<any>()
    const request = vi.fn(async () => [
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
    ])

    render(
      <ProForm>
        <ProFormCheckbox.Group
          ref={checkboxGroupRef}
          name="status"
          request={request}
        />
      </ProForm>,
    )

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1)
    })
    expect(typeof checkboxGroupRef.value?.fetchData).toBe('function')

    await act(async () => {
      checkboxGroupRef.value?.fetchData?.('closed')
    })

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(2)
    })
  })
})
