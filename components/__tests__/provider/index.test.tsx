import type { ComponentTokenMap } from 'antdv-next/dist/theme/interface/components'
import { mount } from '@vue/test-utils'
import { ConfigProvider } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { ProField } from '../../field'
import { ProForm, ProFormMoney } from '../../form'
import {
  createIntl,
  ProConfigProvider,
  useIntl,
  useProProviderContext,
  useStyle,
} from '../../provider'
import { genProStyleHooks } from '../../theme/genProStyleUtils'
import { waitFor } from '../testUtils'

describe('proConfigProvider', () => {
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

  it('useStyle respects hashed=false', () => {
    const assertToken = vi.fn()

    const Demo = defineComponent({
      setup() {
        const style = useStyle('ProProviderDemo', (token) => {
          assertToken(token.proComponentsCls, token.antCls)
          return {
            '.pro-provider-demo': {
              color: token.colorPrimary,
            },
          }
        })

        return () => (
          <div class="pro-provider-demo" data-hash-id={style.hashId}>
            wrapped
          </div>
        )
      },
    })

    const wrapper = mount(() => (
      <ProConfigProvider hashed={false}>
        <Demo />
      </ProConfigProvider>
    ))

    expect(wrapper.find('.pro-provider-demo').text()).toBe('wrapped')
    expect(wrapper.find('.pro-provider-demo').attributes('data-hash-id')).toBe('')
    expect(assertToken).toHaveBeenCalledWith('.ant-pro', '.ant')
  })

  it('genProStyleHooks registers pro component styles', () => {
    const assertToken = vi.fn()
    const useProGridContentStyle = genProStyleHooks(
      'ProGridContent',
      (token) => {
        assertToken(token.componentCls, token.wideMaxWidth)
        return {
          [token.componentCls]: {
            maxWidth: token.wideMaxWidth,
          },
        }
      },
      { wideMaxWidth: 1200 },
    )

    const Demo = defineComponent({
      setup() {
        const [hashId] = useProGridContentStyle(ref('ant-pro-grid-content'))
        return () => (
          <div class="ant-pro-grid-content" data-hash-id={hashId.value}>
            grid
          </div>
        )
      },
    })

    const wrapper = mount(() => (
      <ProConfigProvider>
        <Demo />
      </ProConfigProvider>
    ))

    expect(wrapper.find('.ant-pro-grid-content').text()).toBe('grid')
    expect(assertToken).toHaveBeenCalledWith(
      '.ant-pro-grid-content',
      'var(--ant-pro-grid-content-wide-max-width)',
    )
  })

  it('augments ProGridContent component token type', () => {
    const token: NonNullable<ComponentTokenMap['ProGridContent']> = {
      wideMaxWidth: 1200,
    }

    expect(token.wideMaxWidth).toBe(1200)
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

  it('respects custom prefixCls and antd prefixCls in context tokens', () => {
    const Demo = defineComponent({
      setup() {
        const context = useProProviderContext()
        return () => (
          <span
            data-pro={context.token.proComponentsCls}
            data-ant={context.token.antCls}
            data-prefix={context.prefixCls}
          />
        )
      },
    })

    const wrapper = mount(() => (
      <ConfigProvider prefixCls="acme">
        <ProConfigProvider prefixCls="acme-pro">
          <Demo />
        </ProConfigProvider>
      </ConfigProvider>
    ))

    const node = wrapper.find('span')
    expect(node.attributes('data-pro')).toBe('.acme-pro')
    expect(node.attributes('data-ant')).toBe('.acme')
    expect(node.attributes('data-prefix')).toBe('acme-pro')
  })

  it('updates dark and token values dynamically', async () => {
    const dark = ref(false)
    const colorPrimary = ref('#1677ff')

    const Demo = defineComponent({
      setup() {
        const context = useProProviderContext()
        return () => (
          <span
            data-dark={String(context.dark)}
            data-color={context.token.colorPrimary}
          />
        )
      },
    })

    const wrapper = mount(() => (
      <ConfigProvider theme={{ token: { colorPrimary: colorPrimary.value } }}>
        <ProConfigProvider dark={dark.value}>
          <Demo />
        </ProConfigProvider>
      </ConfigProvider>
    ))

    expect(wrapper.find('span').attributes('data-dark')).toBe('false')
    expect(wrapper.find('span').attributes('data-color')).toBe('#1677ff')

    dark.value = true
    colorPrimary.value = '#ff4d4f'
    await nextTick()

    await waitFor(() => {
      expect(wrapper.find('span').attributes('data-dark')).toBe('true')
      expect(wrapper.find('span').attributes('data-color')).not.toBe('#1677ff')
    })
  })
})
