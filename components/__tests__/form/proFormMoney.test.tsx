import { ConfigProvider } from 'antdv-next'
import enGBIntl from '../../provider/locale/en_GB'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProForm, ProFormMoney } from '../../form'
import { act, cleanup, fireEvent, render, waitFor } from '../testUtils'

afterEach(() => {
  cleanup()
})

describe('💵 ProFormMoney', () => {
  const getMoneyInput = (container: HTMLElement) =>
    container.querySelector('input#amount') as HTMLInputElement

  it('💵 ProFormMoney value expect number', async () => {
    const fn = vi.fn()
    const { container } = render(
      <ProForm
        onFinish={async (values: any) => {
          fn(values.amount)
        }}
      >
        <ProFormMoney name="amount" initialValue={44.33} fieldProps={{ id: 'amount' }} />
      </ProForm>,
    )

    expect(getMoneyInput(container).value).toBe('¥ 44.33')

    await act(async () => {
      fireEvent.click(container.querySelector('button.ant-btn-primary'))
    })

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(44.33)
    })
    expect(getMoneyInput(container).value).toBe('¥ 44.33')
  })

  it('💵 moneySymbol with global locale', async () => {
    const fn = vi.fn()
    const { container } = render(
      <ConfigProvider locale={enGBIntl as any}>
        <ProForm
          onFinish={async (values: any) => {
            fn(values.amount)
          }}
        >
          <ProFormMoney name="amount" initialValue={44.33} fieldProps={{ id: 'amount' }} />
        </ProForm>
      </ConfigProvider>,
    )

    expect(getMoneyInput(container).value).toBe('£ 44.33')

    await act(async () => {
      fireEvent.click(container.querySelector('button.ant-btn-primary'))
    })

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(44.33)
    })
    expect(getMoneyInput(container).value).toBe('£ 44.33')
  })

  it('💵 moneySymbol with custom locale', async () => {
    const fn = vi.fn()
    const { container } = render(
      <ProForm
        onFinish={async (values: any) => {
          fn(values.amount)
        }}
      >
        <ProFormMoney name="amount" initialValue={44.33} locale="en-US" fieldProps={{ id: 'amount' }} />
      </ProForm>,
    )

    expect(getMoneyInput(container).value).toBe('$ 44.33')

    fireEvent.click(container.querySelector('button.ant-btn-primary'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(44.33)
    })
    expect(getMoneyInput(container).value).toBe('$ 44.33')
  })

  it('💵 moneySymbol with custom symbol', async () => {
    const fn = vi.fn()
    const { container } = render(
      <ProForm
        onFinish={async (values: any) => {
          fn(values.amount)
        }}
      >
        <ProFormMoney name="amount" initialValue={44.33} customSymbol="💰" fieldProps={{ id: 'amount' }} />
      </ProForm>,
    )

    expect(getMoneyInput(container).value).toBe('💰 44.33')

    await act(async () => {
      fireEvent.click(container.querySelector('button.ant-btn-primary'))
    })
    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(44.33)
    })
    expect(getMoneyInput(container).value).toBe('💰 44.33')
  })

  it('💵 can not input negative', async () => {
    const fn = vi.fn()
    const { container } = render(
      <ProForm
        onFinish={async (values: any) => {
          fn(values.amount)
        }}
      >
        <ProFormMoney name="amount" min={0} fieldProps={{ id: 'amount' }} />
      </ProForm>,
    )

    expect(getMoneyInput(container).value).toBe('')

    await fireEvent.change(getMoneyInput(container), {
      target: {
        value: '-55.33',
      },
    })
    await act(async () => {
      fireEvent.click(container.querySelector('button.ant-btn-primary'))
    })
    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(undefined)
    })
  })

  it('💵 can input negative', async () => {
    const fn = vi.fn()
    const { container } = render(
      <ProForm
        onFinish={async (values: any) => {
          fn(values.amount)
        }}
      >
        <ProFormMoney name="amount" fieldProps={{ id: 'amount' }} />
      </ProForm>,
    )

    expect(getMoneyInput(container).value).toBe('')

    await fireEvent.change(getMoneyInput(container), {
      target: {
        value: '-55.33',
      },
    })

    expect(getMoneyInput(container).value).toBe('¥ -55.33')

    fireEvent.click(container.querySelector('button.ant-btn-primary'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(-55.33)
    })
    expect(getMoneyInput(container).value).toBe('¥ -55.33')
  })

  it('💵 update money precision when init', async () => {
    const fn = vi.fn()
    const { container } = render(
      <ProForm
        onFinish={async (values: any) => {
          fn(values.amount)
        }}
      >
        <ProFormMoney
          name="amount"
          initialValue={444444444.333333333}
          fieldProps={{ precision: 2, id: 'amount' }}
          customSymbol="💰"
        />
      </ProForm>,
    )

    expect(getMoneyInput(container).value).toBe('💰 444,444,444.33')

    fireEvent.click(container.querySelector('button.ant-btn-primary'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(444444444.333333333)
    })
    expect(getMoneyInput(container).value).toBe('💰 444,444,444.33')
  })
})
