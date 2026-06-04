import { ConfigProvider } from 'antdv-next'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { ProField } from '../../field'
import { ProForm, ProFormMoney } from '../../form'
import {
  ProConfigProvider,
  createIntl,
  useIntl,
  useProProviderContext,
  useStyle,
} from '../../provider'
import { waitFor } from '../testUtils'

describe('ProConfigProvider', () => {
  it('token should be correct in useStyle', () => {
    const assertToken = vi.fn()

    const Demo = defineComponent({
      setup() {
        useStyle('ProCardActions', (token) => {
          assertToken(token.colorPrimary, token.colorPrimaryBg, token.colorPrimaryBgHover)
          return {}
        })

        return () => <div />
      },
    })

    mount(() => (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#ff0000',
            colorPrimaryBg: '#00ff00',
            colorPrimaryBgHover: '#0000ff',
          },
        }}
      >
        <ProConfigProvider>
          <Demo />
        </ProConfigProvider>
      </ConfigProvider>
    ))

    expect(assertToken).toHaveBeenCalledWith('#ff0000', '#00ff00', '#0000ff')
  })

  it('custom translations should be respected', async () => {
    const wrapper = mount(() => (
      <ConfigProvider>
        <ProConfigProvider
          intl={createIntl('en', {
            moneySymbol: '!?',
          })}
        >
          <ProForm>
            {(() => {
              const Money = ProFormMoney as any
              return <Money name="amount" initialValue={44.33} />
            })()}
          </ProForm>
        </ProConfigProvider>
      </ConfigProvider>
    ))

    await waitFor(() => {
      const input = wrapper.find('input#amount')
      expect(input.exists()).toBe(true)
      expect((input.element as HTMLInputElement).value).toBe('!? 44.33')
    })
  })

  it('provides custom valueTypeMap to ProField', () => {
    const wrapper = mount(() => (
      <ProConfigProvider
        valueTypeMap={{
          link: {
            render: text => <a class="custom-link">{text}</a>,
          },
        }}
      >
        <ProField text="homepage" valueType={'link' as any} mode="read" />
      </ProConfigProvider>
    ))

    expect(wrapper.find('.custom-link').text()).toBe('homepage')
  })

  it('useIntl reads provider intl before antd locale fallback', () => {
    const Demo = defineComponent({
      setup() {
        const intl = useIntl()
        return () => <span>{intl.getMessage('tableForm.search', 'Search')}</span>
      },
    })

    const wrapper = mount(() => (
      <ProConfigProvider
        intl={createIntl('en', {
          tableForm: {
            search: 'Find',
          },
        })}
      >
        <Demo />
      </ProConfigProvider>
    ))

    expect(wrapper.text()).toBe('Find')
  })

  it('needDeps passes through when parent provider is already available', () => {
    const Demo = defineComponent({
      setup() {
        const context = useProProviderContext()
        return () => <span>{context.intl?.getMessage('moneySymbol', '¥')}</span>
      },
    })

    const wrapper = mount(() => (
      <ProConfigProvider intl={createIntl('en', { moneySymbol: '$$' })}>
        <ProConfigProvider needDeps>
          <Demo />
        </ProConfigProvider>
      </ProConfigProvider>
    ))

    expect(wrapper.text()).toBe('$$')
  })
})
