import type { Theme } from '@antdv-next/cssinjs'
import type { ConfigProviderProps, ThemeConfig } from 'antdv-next'
import type { InjectionKey, VNodeChild } from 'vue'
import type { IntlType } from './intl'
import type { DeepPartial, ProTokenType } from './typing/layoutToken'
import type { ProAliasToken } from './useStyle'
import { useCacheToken } from '@antdv-next/cssinjs'
import { theme as antdTheme, ConfigProvider } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import zhCNLocale from 'antdv-next/locale/zh_CN'
import { ThemeProvider } from 'antdv-style'
import dayjs from 'dayjs'
import { SWRVCache } from 'swrv'
import { computed, defineComponent, getCurrentInstance, inject, onUnmounted, provide, reactive, watchEffect } from 'vue'
import { findIntlKeyByAntdLocaleKey, intlMap, zhCNIntl } from './intl'
import { getLayoutDesignToken } from './typing/layoutToken'
import { shallowMergeOneLevel } from './utils/merge'
import 'dayjs/locale/zh-cn'

export * from './intl'
export * from './useStyle'
export type { DeepPartial, ProTokenType }

type OmitUndefined<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

function omitUndefined<T extends Record<string, any>>(obj: T): OmitUndefined<T> | undefined {
  const result = {} as Record<string, any>

  Object.keys(obj || {}).forEach((key) => {
    if (obj[key] !== undefined)
      result[key] = obj[key]
  })

  if (Object.keys(result).length < 1)
    return undefined

  return result as OmitUndefined<T>
}

export function isNeedOpenHash() {
  const currentProcess = (globalThis as any).process
  if (!currentProcess)
    return true

  const env = currentProcess.env?.NODE_ENV?.toLowerCase()
  if (env === 'test' || env === 'development')
    return false

  return true
}

function resolveIntl(propsIntl: IntlType | undefined, parentIntl: IntlType | undefined, antdLocaleName: string | undefined): IntlType {
  if (propsIntl)
    return propsIntl

  if (parentIntl && parentIntl.locale !== 'default')
    return parentIntl

  if (antdLocaleName) {
    const key = findIntlKeyByAntdLocaleKey(antdLocaleName)
    const found = intlMap[key as keyof typeof intlMap]
    if (found)
      return found
  }

  return zhCNIntl
}

export interface ProSchemaValueEnumType {
  text: VNodeChild
  status?: string
  color?: string
  disabled?: boolean
}

export type ProSchemaValueEnumMap = Map<
  string | number | boolean,
  ProSchemaValueEnumType | VNodeChild
>

export type ProSchemaValueEnumObj = Record<
  string,
  ProSchemaValueEnumType | VNodeChild
>

export interface BaseProFieldFC {
  text?: VNodeChild
  fieldProps?: any
  mode?: ProFieldFCMode
  light?: boolean
  label?: VNodeChild
  valueEnum?: ProSchemaValueEnumObj | ProSchemaValueEnumMap
  proFieldKey?: string | number | bigint
}

export type ProFieldFCMode = 'read' | 'edit' | 'update'

export type ProFieldFCRenderProps = {
  mode?: ProFieldFCMode
  readonly?: boolean
  placeholder?: string | string[]
  value?: any
  onChange?: (...rest: any[]) => void
} & BaseProFieldFC

export interface ProRenderFieldPropsType {
  render?:
    | ((
      text: any,
      props: Omit<ProFieldFCRenderProps, 'value' | 'onChange'>,
      dom: VNodeChild,
    ) => VNodeChild)
    | undefined
  formItemRender?:
    | ((
      text: any,
      props: ProFieldFCRenderProps,
      dom: VNodeChild,
    ) => VNodeChild)
    | undefined
}

export type ParamsType = Record<string, any>

export interface ConfigContextPropsType {
  intl?: IntlType
  valueTypeMap?: Record<string, ProRenderFieldPropsType>
  token: ProAliasToken
  hashId?: string
  hashed?: boolean
  dark?: boolean
  prefixCls?: string
}

export const ProConfigKey: InjectionKey<ConfigContextPropsType> = Symbol('ProConfig')

const defaultToken = {
  ...antdTheme.getDesignToken(),
  proComponentsCls: '.ant-pro',
  antCls: '.ant',
  themeId: 0,
} as ProAliasToken

const defaultProConfigContext: ConfigContextPropsType = {
  intl: {
    ...zhCNIntl,
    locale: 'default',
  },
  valueTypeMap: {},
  hashed: true,
  dark: false,
  token: defaultToken,
  prefixCls: '.ant-pro',
}

export const ProProviderKey: InjectionKey<ConfigContextPropsType>
  = Symbol('ProProvider')

interface ProProviderSWRVContext {
  cache: SWRVCache<any>
  key: string
}

let swrvCacheSeed = 0

const ProProviderSWRVContextKey: InjectionKey<ProProviderSWRVContext | undefined>
  = Symbol('ProProviderSWRVContext')

export function useProProviderContext(): ConfigContextPropsType {
  return inject(ProProviderKey, defaultProConfigContext)
}

export function useProProviderSWRVContext(): ProProviderSWRVContext | undefined {
  return inject(ProProviderSWRVContextKey, undefined)
}

function clearSWRVCache(context: ProProviderSWRVContext | undefined) {
  const items = (context?.cache as any)?.items
  if (typeof items?.clear === 'function')
    items.clear()
}

export const ConfigConsumer = defineComponent({
  name: 'ProConfigConsumer',
  setup(_, { slots }) {
    const context = useProProviderContext()
    return () => slots.default?.(context)
  },
})

interface ConfigProviderContainerProps {
  autoClearCache?: boolean
  valueTypeMap?: Record<string, ProRenderFieldPropsType>
  token?: DeepPartial<ProAliasToken>
  hashed?: boolean
  dark?: boolean
  prefixCls?: string
  intl?: IntlType
}

const ConfigProviderContainer = defineComponent<ConfigProviderContainerProps>({
  name: 'ProConfigProviderContainer',
  props: ['autoClearCache', 'valueTypeMap', 'token', 'hashed', 'dark', 'prefixCls', 'intl'],
  setup(props, { slots }) {
    const config = useConfig()
    const tokenContext = antdTheme.useToken()
    const parentProvide = useProProviderContext()
    const parentSWRVContext = useProProviderSWRVContext()
    const scopedSWRVContext = props.autoClearCache
      ? {
          cache: new SWRVCache(),
          key: `pro-provider-${++swrvCacheSeed}`,
        }
      : parentSWRVContext

    const proComponentsCls = computed(() =>
      props.prefixCls
        ? `.${props.prefixCls}`
        : `.${config.value.getPrefixCls()}-pro`,
    )
    const antCls = computed(() => `.${config.value.getPrefixCls()}`)

    const salt = computed(() => `${proComponentsCls.value}`)

    /**
     * 合并一下token，不然导致嵌套 token 失效
     */
    const proLayoutTokenMerge = computed(() =>
      getLayoutDesignToken(props.token || {}, tokenContext.token.value),
    )

    const proProvideValue = computed(() => {
      return {
        ...parentProvide,
        dark: props.dark ?? parentProvide.dark,
        token: shallowMergeOneLevel<ProAliasToken>(
          parentProvide.token,
          tokenContext.token.value,
          {
            proComponentsCls: proComponentsCls.value,
            antCls: antCls.value,
            themeId: (tokenContext.theme.value as any).id ?? 0,
            layout: proLayoutTokenMerge.value,
          },
        ),
        intl: resolveIntl(props.intl, parentProvide.intl, config.value.locale?.locale),
      }
    })

    const finalToken = computed(() => ({
      ...(proProvideValue.value.token || {}),
      proComponentsCls: proComponentsCls.value,
    }) as ProAliasToken)

    const cacheTokenResult = useCacheToken<ProAliasToken>(
      computed(() => tokenContext.theme.value as unknown as Theme<any, any>),
      computed(() => [tokenContext.token.value, finalToken.value ?? {}]),
      computed(() => ({
        salt: salt.value,
        override: finalToken.value,
        cssVar: {
          key: 'pro',
        },
      })),
    )
    const nativeHashId = computed(() => cacheTokenResult.value[1])

    const hashed = computed(() => {
      if (props.hashed === false)
        return false
      if (parentProvide.hashed === false)
        return false
      return true
    })

    const hashId = computed(() => {
      if (!hashed.value)
        return ''
      // Fix issue with hashId code
      if (isNeedOpenHash() === false)
        return ''
      // 生产环境或其他环境优先用 antd hashId，缺失时回退到 useCacheToken 的 nativeHashId
      return tokenContext.hashId.value || nativeHashId.value
    })

    watchEffect(() => {
      dayjs.locale(config.value.locale?.locale || 'zh-cn')
    })

    const proConfigContextValue = reactive({
      get intl() {
        return proProvideValue.value.intl
      },
      get valueTypeMap() {
        return props.valueTypeMap || proProvideValue.value.valueTypeMap
      },
      get token() {
        return finalToken.value
      },
      get hashed() {
        return hashed.value
      },
      get hashId() {
        return hashId.value
      },
      get dark() {
        return proProvideValue.value.dark
      },
      get prefixCls() {
        return props.prefixCls
      },
    }) as ConfigContextPropsType

    provide(ProProviderKey, proConfigContextValue)
    provide(ProConfigKey, proConfigContextValue as any)
    provide(ProProviderSWRVContextKey, scopedSWRVContext)

    onUnmounted(() => {
      if (props.autoClearCache)
        clearSWRVCache(scopedSWRVContext)
    })

    const themeConfig = computed<ThemeConfig>(() => ({
      ...(config.value.theme || {}),
      hashId: hashId.value,
      hashed: hashed.value && isNeedOpenHash(),
    }) as ThemeConfig)

    return () => (
      <ConfigProvider theme={themeConfig.value}>
        <ThemeProvider
          customToken={proConfigContextValue.token as unknown as Record<string, unknown>}
          prefixCls={config.value.getPrefixCls()}
        >
          {slots.default?.()}
        </ThemeProvider>
      </ConfigProvider>
    )
  },
})

export interface ProConfigProviderProps {
  children?: VNodeChild
  autoClearCache?: boolean
  token?: DeepPartial<ProAliasToken>
  needDeps?: boolean
  valueTypeMap?: Record<string, ProRenderFieldPropsType>
  dark?: boolean
  hashed?: boolean
  prefixCls?: string
  intl?: IntlType
}

export const ProConfigProvider = defineComponent<ProConfigProviderProps>({
  name: 'ProConfigProvider',
  props: ['autoClearCache', 'needDeps', 'valueTypeMap', 'token', 'dark', 'hashed', 'prefixCls', 'intl'],
  setup(props, { slots }) {
    const parentProvide = useProProviderContext()
    const config = useConfig()
    const instance = getCurrentInstance()

    // 当开启 needDeps 且外层已存在有效的 ProProvider 时，当前层不必再套一次 Provider。
    // 只有在"仅传了 needDeps（其他所有可配置项都没传）"时才允许透传，
    // 防止外层错过 token/intl/dark/prefixCls 等显式配置。
    // 注意：Vue 中 children 走 slots、不在 vnode.props 里，故 ALLOWED 不含 'children'。
    const PASSTHROUGH_ALLOWED_KEYS: readonly string[] = ['needDeps']

    const mergeAlgorithm = () => {
      const isDark = props.dark ?? parentProvide.dark

      if (isDark) {
        return [config.value.theme?.algorithm, antdTheme.darkAlgorithm]
          .flat(1)
          .filter(Boolean) as NonNullable<ThemeConfig['algorithm']>[]
      }
      return config.value.theme?.algorithm
    }

    return () => {
      // vnode.props 反映父级实际传入的 prop（未填默认值），等价于 React 的 Object.keys(props)
      const passedKeys = Object.keys(instance?.vnode.props || {})
      const isNullProvide
        = props.needDeps
          && parentProvide.hashId !== undefined
          && passedKeys.every(k => PASSTHROUGH_ALLOWED_KEYS.includes(k))

      if (isNullProvide)
        return slots.default?.()

      // 自动注入 antd 的配置
      const mergedTheme = omitUndefined({
        ...(config.value.theme || {}),
        algorithm: mergeAlgorithm(),
      }) as ThemeConfig | undefined

      return (
        <ConfigProvider
          locale={(config.value.locale || zhCNLocale) as ConfigProviderProps['locale']}
          theme={mergedTheme as ConfigProviderProps['theme']}
        >
          <ConfigProviderContainer
            autoClearCache={props.autoClearCache}
            valueTypeMap={props.valueTypeMap}
            token={props.token}
            dark={props.dark}
            hashed={props.hashed}
            prefixCls={props.prefixCls}
            intl={props.intl}
          >
            {slots.default?.()}
          </ConfigProviderContainer>
        </ConfigProvider>
      )
    }
  },
})

interface ProProviderProviderProps {
  value: ConfigContextPropsType
}

const ProProviderProvider = defineComponent<ProProviderProviderProps>({
  name: 'ProProvider',
  props: ['value'],
  setup(props, { slots }) {
    provide(ProProviderKey, props.value)
    provide(ProConfigKey, props.value as any)
    return () => slots.default?.()
  },
})

export function useIntl(): IntlType {
  const config = useConfig()
  const { intl } = useProProviderContext()

  if (intl && intl.locale !== 'default')
    return intl

  if (config.value.locale?.locale) {
    return (
      intlMap[
        findIntlKeyByAntdLocaleKey(config.value.locale.locale) as 'zh-CN'
      ] || zhCNIntl
    )
  }

  return zhCNIntl
}

export const ProProvider = {
  Provider: ProProviderProvider,
  Consumer: ConfigConsumer,
}

export default ProProvider
