import type { ConfigProviderProps, ThemeConfig } from 'antdv-next'
import type { DefineComponent, InjectionKey, PropType, VNodeChild } from 'vue'
import type { ProRenderFieldPropsType, ProSchemaValueEnumType } from '../field/types'
import type { IntlType } from './intl'
import type { DeepPartial, ProTokenType } from './typing/layoutToken'
import type { ProAliasToken } from './useStyle'
import { theme as antdTheme, ConfigProvider } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import zhCNLocale from 'antdv-next/locale/zh_CN'
import { ThemeProvider } from 'antdv-style'
import dayjs from 'dayjs'
import { computed, defineComponent, inject, provide, reactive, watchEffect } from 'vue'
import { ProConfigKey } from '../field/types'
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

export type ProSchemaValueEnumMap = Map<
  string | number | boolean,
  ProSchemaValueEnumType | VNodeChild
>

export type ProSchemaValueEnumObj = Record<
  string,
  ProSchemaValueEnumType | VNodeChild
>

export interface BaseProFieldFC {
  text: VNodeChild
  fieldProps?: any
  mode?: ProFieldFCMode
  light?: boolean
  label?: VNodeChild
  valueEnum?: ProSchemaValueEnumObj | ProSchemaValueEnumMap
  proFieldKey?: string | number
}

export type ProFieldFCMode = 'read' | 'edit' | 'update'

export type ProFieldFCRenderProps = {
  mode?: ProFieldFCMode
  readonly?: boolean
  placeholder?: string | string[]
  value?: any
  onChange?: (...rest: any[]) => void
} & BaseProFieldFC

export type { ProRenderFieldPropsType }

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

export function useProProviderContext(): ConfigContextPropsType {
  return inject(ProProviderKey, defaultProConfigContext)
}

export const ConfigConsumer = defineComponent({
  name: 'ProConfigConsumer',
  setup(_, { slots }) {
    const context = useProProviderContext()
    return () => slots.default?.(context)
  },
})

const ConfigProviderContainer = defineComponent({
  name: 'ProConfigProviderContainer',
  props: {
    autoClearCache: { type: Boolean, default: false },
    valueTypeMap: { type: Object as PropType<Record<string, ProRenderFieldPropsType>>, default: undefined },
    token: { type: Object as PropType<DeepPartial<ProAliasToken>>, default: undefined },
    hashed: { type: Boolean, default: undefined },
    dark: { type: Boolean, default: undefined },
    prefixCls: { type: String, default: undefined },
    intl: { type: Object as PropType<IntlType>, default: undefined },
  },
  setup(props, { slots }) {
    const config = useConfig()
    const tokenContext = antdTheme.useToken()
    const parentProvide = useProProviderContext()

    const proComponentsCls = computed(() =>
      props.prefixCls
        ? `.${props.prefixCls}`
        : `.${config.value.getPrefixCls('pro')}`,
    )
    const antCls = computed(() => `.${config.value.getPrefixCls()}`)

    const layoutToken = computed(() =>
      getLayoutDesignToken(props.token || {}, tokenContext.token.value),
    )

    const baseProvideValue = computed(() => {
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
            layout: layoutToken.value,
          },
        ),
        intl: resolveIntl(props.intl, parentProvide.intl, config.value.locale?.locale),
      }
    })

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
      if (isNeedOpenHash() === false)
        return ''
      return tokenContext.hashId.value
    })

    watchEffect(() => {
      dayjs.locale(config.value.locale?.locale || 'zh-cn')
    })

    const contextValue = reactive({
      get intl() {
        return baseProvideValue.value.intl
      },
      get valueTypeMap() {
        return props.valueTypeMap || baseProvideValue.value.valueTypeMap
      },
      get token() {
        return {
          ...(baseProvideValue.value.token || {}),
          proComponentsCls: proComponentsCls.value,
        } as ProAliasToken
      },
      get hashed() {
        return hashed.value
      },
      get hashId() {
        return hashId.value
      },
      get dark() {
        return baseProvideValue.value.dark
      },
      get prefixCls() {
        return props.prefixCls
      },
    }) as ConfigContextPropsType

    provide(ProProviderKey, contextValue)
    provide(ProConfigKey, contextValue)

    const themeConfig = computed<ThemeConfig>(() => ({
      ...(config.value.theme || {}),
      hashed: hashed.value && isNeedOpenHash(),
    }))

    return () => (
      <ConfigProvider theme={themeConfig.value}>
        <ThemeProvider
          customToken={contextValue.token as unknown as Record<string, unknown>}
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

export const ProConfigProvider = defineComponent({
  name: 'ProConfigProvider',
  props: {
    autoClearCache: { type: Boolean, default: false },
    needDeps: { type: Boolean, default: false },
    valueTypeMap: { type: Object as PropType<Record<string, ProRenderFieldPropsType>>, default: undefined },
    token: { type: Object as PropType<DeepPartial<ProAliasToken>>, default: undefined },
    dark: { type: Boolean, default: undefined },
    hashed: { type: Boolean, default: undefined },
    prefixCls: { type: String, default: undefined },
    intl: { type: Object as PropType<IntlType>, default: undefined },
  },
  setup(props, { slots }) {
    const parentProvide = useProProviderContext()
    const config = useConfig()

    const isNullProvide = computed(() =>
      props.needDeps
      && parentProvide.hashId !== undefined
      && props.valueTypeMap === undefined
      && props.token === undefined
      && props.dark === undefined
      && props.hashed === undefined
      && props.prefixCls === undefined
      && props.intl === undefined,
    )

    const mergedTheme = computed(() => {
      const isDark = props.dark ?? parentProvide.dark
      const currentTheme = config.value.theme || {}
      const algorithm = isDark
        ? ([currentTheme.algorithm, antdTheme.darkAlgorithm].flat(1).filter(Boolean) as NonNullable<ThemeConfig['algorithm']>[])
        : currentTheme.algorithm

      return omitUndefined({
        ...currentTheme,
        algorithm,
      }) as ThemeConfig | undefined
    })

    return () => {
      if (isNullProvide.value)
        return slots.default?.()

      return (
        <ConfigProvider
          locale={(config.value.locale || zhCNLocale) as ConfigProviderProps['locale']}
          theme={mergedTheme.value as ConfigProviderProps['theme']}
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
}) as DefineComponent<ProConfigProviderProps>

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

export const ProProvider = ProProviderKey

export default ProProviderKey
