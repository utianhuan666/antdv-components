// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { ProForm, ProFormField, ProFormText } from '@antdv/components'
import { mountAttached, waitFor } from '../testUtils'

describe('Schema vs imperative alignment', () => {
  it('text column (valueType text) matches ProFormText', async () => {
    const readValues = vi.fn()
    const Probe = defineComponent({
      setup() {
        return () => (
          <ProForm
            initialValues={{ fieldA: 'hello' }}
            onInit={(values: Record<string, any>) => readValues(values)}
          >
            <ProFormText name="fieldA" />
          </ProForm>
        )
      },
    })

    mountAttached(Probe)

    await waitFor(() => {
      expect(readValues).toHaveBeenCalledWith({ fieldA: 'hello' })
    })
  })

  it('digit column matches ProFormDigit through valueType field', async () => {
    const readValues = vi.fn()
    mountAttached({
      render: () => (
        <ProForm
          initialValues={{ fieldA: 12 }}
          onInit={(values: Record<string, any>) => readValues(values)}
        >
          <ProFormField name="fieldA" valueType="digit" />
        </ProForm>
      ),
    })

    await waitFor(() => {
      expect(readValues).toHaveBeenCalledWith({ fieldA: 12 })
    })
  })
})
