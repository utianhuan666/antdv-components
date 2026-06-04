import { setAlpha } from '../useStyle'

export interface BaseLayoutDesignToken {
  hashId: string
  colorPrimary: string
  colorBgAppListIconHover: string
  colorTextAppListIconHover: string
  colorTextAppListIcon: string
  bgLayout: string | null
  sider: {
    colorBgCollapsedButton: string
    colorTextCollapsedButtonHover: string
    colorTextCollapsedButton: string
    colorMenuBackground: string
    menuHeight: number
    colorBgMenuItemCollapsedElevated: string
    colorMenuItemDivider: string
    colorBgMenuItemHover: string
    colorBgMenuItemActive: string
    colorBgMenuItemSelected: string
    colorTextMenuSelected: string
    colorTextMenuItemHover: string
    colorTextMenuActive: string
    colorTextMenu: string
    colorTextMenuSecondary: string
    paddingInlineLayoutMenu: number
    paddingBlockLayoutMenu: number
    colorTextMenuTitle: string
    colorTextSubMenuSelected: string
  }
  header: {
    colorBgHeader: string
    colorBgScrollHeader: string
    colorHeaderTitle: string
    colorBgMenuItemHover: string
    colorBgMenuElevated: string
    colorBgMenuItemSelected: string
    colorTextMenuSelected: string
    colorTextMenuActive: string
    colorTextMenu: string
    colorTextMenuSecondary: string
    colorBgRightActionsItemHover: string
    colorTextRightActionsItem: string
    heightLayoutHeader: number
  }
  pageContainer: {
    colorBgPageContainer: string
    paddingInlinePageContainerContent: number
    paddingBlockPageContainerContent: number
    colorBgPageContainerFixed: string
  }
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export type LayoutDesignToken = BaseLayoutDesignToken

export function getLayoutDesignToken(designTokens: DeepPartial<LayoutDesignToken>, antdToken: Record<string, any>): LayoutDesignToken {
  const finalDesignTokens = { ...designTokens }
  const defaultColorBgHeader = setAlpha(antdToken.colorBgElevated, 0.6)

  return {
    bgLayout: antdToken.colorBgLayout,
    colorTextAppListIcon: antdToken.colorTextSecondary,
    colorBgAppListIconHover: setAlpha(antdToken.colorTextBase, 0.04),
    colorTextAppListIconHover: antdToken.colorTextBase,
    ...finalDesignTokens,
    header: {
      colorBgHeader: defaultColorBgHeader,
      colorBgScrollHeader: setAlpha(antdToken.colorBgElevated, 0.8),
      colorHeaderTitle: antdToken.colorText,
      colorBgMenuItemHover: setAlpha(antdToken.colorTextBase, 0.03),
      colorBgMenuItemSelected: setAlpha(antdToken.colorTextBase, 0.04),
      colorBgMenuElevated:
        (finalDesignTokens?.header?.colorBgHeader ?? defaultColorBgHeader) !== defaultColorBgHeader
          ? finalDesignTokens.header?.colorBgHeader
          : antdToken.colorBgElevated,
      colorTextMenuSelected: antdToken.colorText,
      colorBgRightActionsItemHover: setAlpha(antdToken.colorTextBase, 0.03),
      colorTextRightActionsItem: antdToken.colorTextTertiary,
      heightLayoutHeader: 56,
      colorTextMenu: antdToken.colorTextSecondary,
      colorTextMenuSecondary: antdToken.colorTextTertiary,
      colorTextMenuTitle: antdToken.colorText,
      colorTextMenuActive: antdToken.colorText,
      ...finalDesignTokens.header,
    } as LayoutDesignToken['header'],
    sider: {
      paddingInlineLayoutMenu: 8,
      paddingBlockLayoutMenu: 12,
      colorBgCollapsedButton: antdToken.colorBgElevated,
      colorTextCollapsedButtonHover: antdToken.colorTextSecondary,
      colorTextCollapsedButton: setAlpha(antdToken.colorTextBase, 0.25),
      colorMenuBackground: setAlpha(antdToken.colorTextBase, 0.04),
      colorMenuItemDivider: setAlpha(antdToken.colorTextBase, 0.06),
      colorBgMenuItemHover: setAlpha(antdToken.colorTextBase, 0.03),
      colorBgMenuItemSelected: setAlpha(antdToken.colorTextBase, 0.04),
      colorTextMenuItemHover: antdToken.colorText,
      colorTextMenuSelected: setAlpha(antdToken.colorTextBase, 0.95),
      colorTextMenuActive: antdToken.colorText,
      colorTextMenu: antdToken.colorTextSecondary,
      colorTextMenuSecondary: antdToken.colorTextTertiary,
      colorTextMenuTitle: antdToken.colorText,
      colorTextSubMenuSelected: setAlpha(antdToken.colorTextBase, 0.95),
      ...finalDesignTokens.sider,
    } as LayoutDesignToken['sider'],
    pageContainer: {
      colorBgPageContainer: 'transparent',
      paddingInlinePageContainerContent:
        finalDesignTokens.pageContainer?.paddingInlinePageContainerContent || 24,
      paddingBlockPageContainerContent:
        finalDesignTokens.pageContainer?.paddingBlockPageContainerContent || 24,
      colorBgPageContainerFixed: antdToken.colorBgElevated,
      ...finalDesignTokens.pageContainer,
    },
  } as LayoutDesignToken
}

export interface ProTokenType {
  layout?: DeepPartial<LayoutDesignToken>
}
