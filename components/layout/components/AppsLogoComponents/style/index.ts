import type { GenerateStyle, ProAliasToken } from '../../../../provider'
import { useStyle as useAntdStyle } from '../../../../provider'

export interface AppsLogoToken extends ProAliasToken {
  componentCls: string
}

const genAppsLogoStyle: GenerateStyle<AppsLogoToken> = token => ({
  [token.componentCls]: {
    display: 'inline-flex',
  },
})

export function useStyle(prefixCls: string) {
  return useAntdStyle('ProLayoutAppsLogo', (token) => {
    const appsLogoToken: AppsLogoToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    }
    return [genAppsLogoStyle(appsLogoToken)]
  })
}
