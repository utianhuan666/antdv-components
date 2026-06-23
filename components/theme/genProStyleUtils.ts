import type { GetCompUnitless } from '@antdv-next/cssinjs/cssinjs-utils'
import type { AliasToken } from 'antdv-next/dist/theme/interface/alias'
import type { ComponentTokenMap } from 'antdv-next/dist/theme/interface/components'
import type { SeedToken } from 'antdv-next/dist/theme/interface/seeds'
import { genStyleUtils } from '@antdv-next/cssinjs/cssinjs-utils'
import { defaultIconPrefixCls, useConfig } from 'antdv-next/dist/config-provider/context'
import { genCommonStyle, genIconStyle, genLinkStyle } from 'antdv-next/dist/style/index'
import useLocalToken, { unitless } from 'antdv-next/dist/theme/useToken'
import { computed } from 'vue'
import './augmentComponentTokenMap'

/**
 * Same pipeline as `antdv-next/theme/util/genStyleUtils` (`genStyleHooks` + component tokens),
 * with styles registered under the `antd-pro` layer.
 */
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
    const [theme, realToken, hashId, token, cssVar, zeroRuntime] = useLocalToken()
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
  getResetStyles: (token, config) => {
    const linkStyle = genLinkStyle(token)
    return [
      linkStyle,
      { '&': linkStyle },
      genIconStyle(config?.prefix.value?.iconPrefixCls ?? defaultIconPrefixCls),
    ]
  },
  getCommonStyle: genCommonStyle,
  getCompUnitless: (() => unitless) as GetCompUnitless<ComponentTokenMap, AliasToken>,
  layer: {
    name: 'antd-pro',
  },
})
