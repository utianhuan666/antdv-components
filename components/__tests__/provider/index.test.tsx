import type { ComponentTokenMap } from 'antdv-next/dist/theme/interface/components'
import { mount } from '@vue/test-utils'
import { TinyColor } from '@ctrl/tinycolor'
import { ConfigProvider, theme as antdTheme } from 'antdv-next'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { ProField } from '../../field'
import { useFieldFetchData } from '../../field/components/Select'
import { ProForm, ProFormMoney } from '../../form'
import {
  createIntl,
  ProConfigProvider,
  ProProvider,
  lighten,
  setAlpha,
  useIntl,
  useProProviderContext,
  useStyle,
} from '../../provider'
import type { VNodeChild } from 'vue'
import type {
  ProFieldFCRenderProps,
  ProRenderFieldPropsType as ProviderProRenderFieldPropsType,
  ProSchemaValueEnumType,
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

  it('useStyle falls back to antd token without ProConfigProvider', () => {
    const assertToken = vi.fn()

    const Demo = defineComponent({
      setup() {
        const style = useStyle('ProProviderFallback', (token) => {
          assertToken(token.colorPrimary, token.proComponentsCls, token.antCls)
          return {
            '.pro-provider-fallback': {
              color: token.colorPrimary,
            },
          }
        })

        return () => <div class="pro-provider-fallback" data-hash-id={style.hashId} />
      },
    })

    const wrapper = mount(() => (
      <ConfigProvider theme={{ token: { colorPrimary: '#f5222d' } }}>
        <Demo />
      </ConfigProvider>
    ))

    expect(wrapper.find('.pro-provider-fallback').exists()).toBe(true)
    expect(assertToken).toHaveBeenCalledWith('#f5222d', '.ant-pro', '.ant')
  })

  it('setAlpha and lighten match TinyColor behavior', () => {
    expect(setAlpha('red', 0.35)).toBe(new TinyColor('red').setAlpha(0.35).toRgbString())
    expect(setAlpha('hsl(120, 100%, 25%)', 0.5)).toBe(new TinyColor('hsl(120, 100%, 25%)').setAlpha(0.5).toRgbString())
    expect(lighten('#1677ff', 20)).toBe(new TinyColor('#1677ff').lighten(20).toHexString())
    expect(lighten('rgba(22, 119, 255, 0.8)', 20)).toBe(new TinyColor('rgba(22, 119, 255, 0.8)').lighten(20).toHexString())
  })

  it('ProProvider facade provides and consumes context value', () => {
    const token = {
      ...antdTheme.getDesignToken(),
      proComponentsCls: '.custom-pro',
      antCls: '.custom-ant',
      themeId: 0,
    }

    const Demo = defineComponent({
      setup() {
        const context = useProProviderContext()
        return () => (
          <span
            data-locale={context.intl?.locale}
            data-token={context.token.proComponentsCls}
          />
        )
      },
    })

    const wrapper = mount(() => (
      <ProProvider.Provider
        value={{
          intl: createIntl('en_US', { moneySymbol: '$' }),
          valueTypeMap: {},
          token,
          hashed: false,
          dark: false,
          prefixCls: '.custom-pro',
        }}
      >
        <ProProvider.Consumer>
          {{
            default: (context: any) => <span class="consumer">{context.token.proComponentsCls}</span>,
          }}
        </ProProvider.Consumer>
        <Demo />
      </ProProvider.Provider>
    ))

    expect(wrapper.find('.consumer').text()).toBe('.custom-pro')
    expect(wrapper.find('span[data-locale]').attributes('data-locale')).toBe('en_US')
    expect(wrapper.find('span[data-locale]').attributes('data-token')).toBe('.custom-pro')
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

  it('autoClearCache isolates and clears swrv cache on unmount', async () => {
    const request = vi.fn(async () => [{ label: 'A', value: 'A' }])

    const Demo = defineComponent({
      setup() {
        const [, options] = useFieldFetchData({
          request,
          cacheForSwr: true,
          proFieldKey: 'provider-auto-clear-cache',
        } as any)

        return () => <span>{options.value.length}</span>
      },
    })

    const first = mount(() => (
      <ProConfigProvider autoClearCache>
        <Demo />
      </ProConfigProvider>
    ))

    await waitFor(() => {
      expect(first.text()).toBe('1')
    })
    expect(request).toHaveBeenCalledTimes(1)
    first.unmount()

    const second = mount(() => (
      <ProConfigProvider autoClearCache>
        <Demo />
      </ProConfigProvider>
    ))

    await waitFor(() => {
      expect(second.text()).toBe('1')
    })
    expect(request).toHaveBeenCalledTimes(2)
    second.unmount()
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

  it('exports provider types aligned with React provider surface', () => {
    expectTypeOf<ProSchemaValueEnumType['text']>().toEqualTypeOf<VNodeChild>()
    expectTypeOf<ProSchemaValueEnumType['status']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<ProSchemaValueEnumType['color']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<ProSchemaValueEnumType['disabled']>().toEqualTypeOf<boolean | undefined>()

    expectTypeOf<NonNullable<ProFieldFCRenderProps['proFieldKey']>>()
      .toEqualTypeOf<string | number | bigint>()

    expectTypeOf<ProviderProRenderFieldPropsType['render']>()
      .parameter(1)
      .exclude<undefined>()
      .toEqualTypeOf<Omit<ProFieldFCRenderProps, 'value' | 'onChange'>>()
  })
})
