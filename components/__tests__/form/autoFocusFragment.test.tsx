// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { ProForm, ProFormGroup, ProFormText, QueryFilter } from '@antdv/components'
import { describe, expect, it, vi } from 'vitest'
import { mountAttached, waitFor } from '../testUtils'

const FRAGMENT_AUTOFOCUS_WARNING = 'Invalid prop `autoFocus` supplied to `Vue.Fragment`'

describe('autoFocus with Vue Fragment', () => {
  it('proForm with autoFocusFirstInput should not pass autoFocus to Fragment when first child is Fragment', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mountAttached({
      render: () => (
        <ProForm autoFocusFirstInput>
          <>
            <ProFormText label="a" name="a" />
            <ProFormText label="b" name="b" />
          </>
        </ProForm>
      ),
    })

    const fragmentWarningCalls = errorSpy.mock.calls.filter(call =>
      String(call[0]).includes(FRAGMENT_AUTOFOCUS_WARNING),
    )
    errorSpy.mockRestore()
    expect(fragmentWarningCalls).toHaveLength(0)
  })

  it('queryFilter with autoFocusFirstInput should not pass autoFocus to Fragment when first child is Fragment', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mountAttached({
      render: () => (
        <QueryFilter autoFocusFirstInput>
          <>
            <ProFormText label="a" name="a" />
            <ProFormText label="b" name="b" />
          </>
        </QueryFilter>
      ),
    })

    const fragmentWarningCalls = errorSpy.mock.calls.filter(call =>
      String(call[0]).includes(FRAGMENT_AUTOFOCUS_WARNING),
    )
    errorSpy.mockRestore()
    expect(fragmentWarningCalls).toHaveLength(0)
  })

  it('proFormGroup with autoFocus should not pass autoFocus to Fragment when first child is Fragment', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mountAttached({
      render: () => (
        <ProForm>
          <ProFormGroup autoFocus title="group">
            <>
              <ProFormText label="a" name="a" />
              <ProFormText label="b" name="b" />
            </>
          </ProFormGroup>
        </ProForm>
      ),
    })

    const fragmentWarningCalls = errorSpy.mock.calls.filter(call =>
      String(call[0]).includes(FRAGMENT_AUTOFOCUS_WARNING),
    )
    errorSpy.mockRestore()
    expect(fragmentWarningCalls).toHaveLength(0)
  })

  it('proForm with autoFocusFirstInput should still pass autoFocus when first child is not Fragment', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm autoFocusFirstInput>
          <ProFormText label="a" name="a" />
          <ProFormText label="b" name="b" />
        </ProForm>
      ),
    })

    const firstInput = wrapper.find('.ant-input').element
    await waitFor(() => {
      expect(document.activeElement).toBe(firstInput)
    })
  })

  it('should not apply autoFocus when autoFocusFirstInput is false', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm autoFocusFirstInput={false}>
          <ProFormText label="a" name="a" />
        </ProForm>
      ),
    })

    expect(wrapper.find('.ant-input').exists()).toBe(true)
  })

  it('should recursively apply autoFocus when first child is nested Fragment', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mountAttached({
      render: () => (
        <ProForm autoFocusFirstInput>
          <>
            <>
              <ProFormText label="a" name="a" />
            </>
            <ProFormText label="b" name="b" />
          </>
        </ProForm>
      ),
    })

    const fragmentWarningCalls = errorSpy.mock.calls.filter(call =>
      String(call[0]).includes(FRAGMENT_AUTOFOCUS_WARNING),
    )
    errorSpy.mockRestore()
    expect(fragmentWarningCalls).toHaveLength(0)
  })
})
