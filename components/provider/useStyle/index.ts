import type { CSSInterpolation, CSSObject } from '@antdv-next/cssinjs'
import type { GlobalToken } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProTokenType } from '../typing/layoutToken'
import { useStyleRegister } from '@antdv-next/cssinjs'
import { TinyColor } from '@ctrl/tinycolor'
import { theme as antdTheme } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, ref, watch } from 'vue'
import { useProProviderContext } from '../index'

export type { CSSInterpolation, CSSObject }

export type GenerateStyle<
  ComponentToken extends object = GlobalToken,
  ReturnType = CSSInterpolation,
> = (token: ComponentToken, ...rest: any[]) => ReturnType

export function setAlpha(baseColor: string, alpha: number) {
  return new TinyColor(baseColor).setAlpha(alpha).toRgbString()
}

export function lighten(baseColor: string, brightness: number) {
  return new TinyColor(baseColor).lighten(brightness).toHexString()
}

export const proTheme = antdTheme as any

export interface UseStyleResult {
  wrapSSR: (node: VNodeChild) => VNodeChild
  hashId: string
}

export type ProAliasToken = GlobalToken
  & ProTokenType & {
    themeId: number
    proComponentsCls: string
    antCls: string
  }

export function resetComponent(token: ProAliasToken): CSSObject {
  return {
    'boxSizing': 'border-box',
    'margin': 0,
    'padding': 0,
    'color': token.colorText,
    'fontSize': token.fontSize,
    'lineHeight': token.lineHeight,
    'listStyle': 'none',
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
  }
}

export function operationUnit(token: ProAliasToken): CSSObject {
  return {
    'color': token.colorLink,
    'outline': 'none',
    'cursor': 'pointer',
    'transition': `color ${token.motionDurationSlow}`,
    '&:focus, &:hover': {
      color: token.colorLinkHover,
    },
    '&:active': {
      color: token.colorLinkActive,
    },
  }
}

function hashString(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i += 1)
    hash = (hash * 33) ^ input.charCodeAt(i)

  return (hash >>> 0).toString(36)
}

function getProTokenKey(token: ProAliasToken): string {
  try {
    return hashString(JSON.stringify(token))
  }
  catch {
    return ''
  }
}

export function useStyle(
  componentName: string,
  styleFn: GenerateStyle<ProAliasToken>,
) {
  const proProvider = useProProviderContext()
  const { token: antdToken, hashId, theme } = antdTheme.useToken()
  const config = useConfig()

  const mergedToken = computed((): ProAliasToken => {
    const contextToken = proProvider.token?.layout ? proProvider.token : antdToken.value
    return {
      ...(contextToken as Record<string, any>),
      proComponentsCls:
        proProvider.token?.proComponentsCls
        ?? `.${config.value.getPrefixCls('pro')}`,
      antCls: `.${config.value.getPrefixCls()}`,
    } as ProAliasToken
  })

  const styleKey = computed(() =>
    [
      proProvider.hashId || hashId.value,
      (theme.value as any)?.id,
      mergedToken.value.themeId,
      getProTokenKey(mergedToken.value),
    ].filter(Boolean).join('-'),
  )

  const lastStyleKey = ref('')
  const styleVersion = ref(0)

  watch(
    styleKey,
    (key) => {
      if (lastStyleKey.value !== key) {
        styleVersion.value += 1
        lastStyleKey.value = key
      }
    },
    { immediate: true, flush: 'sync' },
  )

  useStyleRegister(
    computed(() => ({
      theme: theme.value as any,
      token: mergedToken.value,
      path: [componentName, styleKey.value, styleVersion.value].filter(Boolean).map(String),
      nonce: config.value.csp?.nonce,
      layer: {
        name: 'antd-pro',
      },
    })),
    () => styleFn(mergedToken.value),
  )

  return {
    wrapSSR: (node: VNodeChild) => node,
    get hashId() {
      return proProvider.hashed ? (proProvider.hashId || hashId.value) : ''
    },
  } as UseStyleResult
}
