import type { VNodeChild } from 'vue'
import type { GlobalToken } from 'antdv-next'
import type { ProTokenType } from '../typing/layoutToken'
import { theme as antdTheme } from 'antdv-next'
import { createGlobalStyle } from 'antdv-style'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { useProProviderContext } from '../index'

export type CSSObject = Record<string, any>
export type CSSInterpolation =
  | CSSObject
  | CSSInterpolation[]
  | string
  | number
  | boolean
  | null
  | undefined
export type GenerateStyle<
  ComponentToken extends object = GlobalToken,
  ReturnType = CSSInterpolation,
> = (token: ComponentToken, ...rest: any[]) => ReturnType

type RGB = { r: number, g: number, b: number, a?: number }

function parseColor(color: string): RGB | undefined {
  const value = color.trim()

  if (value.startsWith('#')) {
    const hex = value.slice(1)
    const normalized = hex.length === 3
      ? hex.split('').map(char => char + char).join('')
      : hex
    const intValue = Number.parseInt(normalized.slice(0, 6), 16)
    if (Number.isNaN(intValue))
      return undefined

    return {
      r: (intValue >> 16) & 255,
      g: (intValue >> 8) & 255,
      b: intValue & 255,
    }
  }

  const rgba = value.match(/^rgba?\(([^)]+)\)$/i)
  if (!rgba)
    return undefined

  const parts = rgba[1]!.split(',').map(part => Number.parseFloat(part.trim()))
  if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN))
    return undefined

  return { r: parts[0]!, g: parts[1]!, b: parts[2]!, a: parts[3] }
}

const toHex = (value: number) =>
  Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0')

export const setAlpha = (baseColor: string, alpha: number) => {
  const rgb = parseColor(baseColor)
  if (!rgb)
    return baseColor

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export const lighten = (baseColor: string, brightness: number) => {
  const rgb = parseColor(baseColor)
  if (!rgb)
    return baseColor

  const ratio = Math.min(100, Math.max(0, brightness)) / 100
  return `#${toHex(rgb.r + (255 - rgb.r) * ratio)}${toHex(
    rgb.g + (255 - rgb.g) * ratio,
  )}${toHex(rgb.b + (255 - rgb.b) * ratio)}`
}

export const proTheme = antdTheme as any

export type UseStyleResult = {
  wrapSSR: (node: VNodeChild) => VNodeChild
  hashId: string
}

export type ProAliasToken = GlobalToken &
  ProTokenType & {
    themeId: number
    proComponentsCls: string
    antCls: string
  }

export const resetComponent = (token: ProAliasToken): CSSObject => ({
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  color: token.colorText,
  fontSize: token.fontSize,
  lineHeight: token.lineHeight,
  listStyle: 'none',
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },
})

export const operationUnit = (token: ProAliasToken): CSSObject => ({
  color: token.colorLink,
  outline: 'none',
  cursor: 'pointer',
  transition: `color ${token.motionDurationSlow}`,
  '&:focus, &:hover': {
    color: token.colorLinkHover,
  },
  '&:active': {
    color: token.colorLinkActive,
  },
})

const hashString = (input: string): string => {
  let hash = 5381
  for (let i = 0; i < input.length; i += 1)
    hash = (hash * 33) ^ input.charCodeAt(i)

  return (hash >>> 0).toString(36)
}

const getProTokenKey = (token: ProAliasToken): string => {
  try {
    return hashString(JSON.stringify(token))
  }
  catch {
    return ''
  }
}

const globalStyleCache = new Map<string, ReturnType<typeof createGlobalStyle>>()

export function useStyle(
  componentName: string,
  styleFn: GenerateStyle<ProAliasToken>,
) {
  const proProvider = useProProviderContext()
  const { token: antdToken, hashId } = antdTheme.useToken()
  const config = useConfig()

  const getMergedToken = (): ProAliasToken => {
    const contextToken = proProvider.token?.layout ? proProvider.token : antdToken.value
    return {
      ...(contextToken as Record<string, any>),
      proComponentsCls:
        proProvider.token?.proComponentsCls
        ?? `.${config.value.getPrefixCls('pro')}`,
      antCls: `.${config.value.getPrefixCls()}`,
    } as ProAliasToken
  }

  const cacheKey = `${componentName}-${getProTokenKey(getMergedToken())}`
  let useGlobalStyle = globalStyleCache.get(cacheKey)

  if (!useGlobalStyle) {
    useGlobalStyle = createGlobalStyle(() => {
      const styles = styleFn(getMergedToken())
      return styles == null || typeof styles === 'boolean' || typeof styles === 'number'
        ? ''
        : (styles as string | Record<string, unknown>)
    })
    globalStyleCache.set(cacheKey, useGlobalStyle)
  }

  useGlobalStyle()

  return {
    wrapSSR: (node: VNodeChild) => node,
    get hashId() {
      return proProvider.hashed ? hashId.value : ''
    },
  } as UseStyleResult
}
