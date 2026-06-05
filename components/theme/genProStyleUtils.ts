import type { CSSInterpolation } from '@antdv-next/cssinjs'
import type { GetCompUnitless } from '@antdv-next/cssinjs/cssinjs-utils'
import type { AliasToken } from 'antdv-next/dist/theme/interface/alias'
import type { ComponentTokenMap } from 'antdv-next/dist/theme/interface/components'
import type { SeedToken } from 'antdv-next/dist/theme/interface/seeds'
import { genStyleUtils } from '@antdv-next/cssinjs/cssinjs-utils'
import { defaultIconPrefixCls, useConfig } from 'antdv-next/dist/config-provider/context'
import { genCommonStyle, genIconStyle, genLinkStyle } from 'antdv-next/dist/style/index'
import useToken, { unitless } from 'antdv-next/dist/theme/useToken'
import { computed } from 'vue'
import './augmentComponentTokenMap'

const getProCompUnitless = (() => unitless) as GetCompUnitless<ComponentTokenMap, AliasToken>

export const {
  genStyleHooks: genProStyleHooks,
  genComponentStyleHook: genProComponentStyleHook,
  genSubStyleComponent: genProSubStyleComponent,
} = genStyleUtils<ComponentTokenMap, AliasToken, SeedToken>({
  usePrefix: () => {
    const config = useConfig()
    return computed(() => {
      const { getPrefixCls, iconPrefixCls } = config.value
      return {
        rootPrefixCls: getPrefixCls(),
        iconPrefixCls,
      }
    })
  },
  useToken: () => {
    const [theme, realToken, hashId, token, cssVar, zeroRuntime] = useToken()
    return {
      theme,
      realToken,
      hashId: computed(() => hashId.value ?? ''),
      token,
      cssVar: computed(() => cssVar.value ?? { prefix: '', key: '' }),
      zeroRuntime,
    }
  },
  useCSP: () => {
    const config = useConfig()
    return computed(() => config.value?.csp ?? {})
  },
  getResetStyles: (token, config): CSSInterpolation => {
    const linkStyle = genLinkStyle(token)
    return [
      linkStyle,
      { '&': linkStyle },
      genIconStyle(config?.prefix.value?.iconPrefixCls ?? defaultIconPrefixCls),
    ] as CSSInterpolation
  },
  getCommonStyle: genCommonStyle,
  getCompUnitless: getProCompUnitless,
  layer: {
    name: 'antd-pro',
  },
})
