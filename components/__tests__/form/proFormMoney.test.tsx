import type { ProFormData } from '@antdv/components'
import { ProForm, ProFormMoney } from '@antdv/components'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountAttached, waitFor } from '../testUtils'

describe('💵 ProFormMoney', () => {
  it('💵 ProFormMoney value expect number', async () => {
    const fn = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={(values: ProFormData) => fn(values.amount)}>
          <ProFormMoney name="amount" initialValue={44.33} />
        </ProForm>
      ),
    })

    await nextTick()
    expect((wrapper.find('input#amount').element as HTMLInputElement).value).toContain('44.33')

    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(44.33)
    })
  })

  it('💵 moneySymbol with custom symbol', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormMoney
            name="amount"
            initialValue={44.33}
            fieldProps={{ customSymbol: '$' }}
          />
        </ProForm>
      ),
    })

    await nextTick()
    expect((wrapper.find('input#amount').element as HTMLInputElement).value).toContain('$')
  })
})
