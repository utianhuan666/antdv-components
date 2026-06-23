import type { MenuDataItem } from '../typing'

export function getOpenKeysFromMenuData(menuData?: MenuDataItem[]): string[] {
  return (menuData || []).reduce((pre, item) => {
    if (item.flatMenu) {
      if (item.children) {
        return pre.concat(getOpenKeysFromMenuData(item.children) || [])
      }
      return pre
    }
    if (item.key) {
      pre.push(item.key)
    }
    if (item.children) {
      const newArray: string[] = pre.concat(
        getOpenKeysFromMenuData(item.children) || [],
      )
      return newArray
    }
    return pre
  }, [] as string[])
}

const themeConfig = {
  techBlue: '#1677FF',
  daybreak: '#1890ff',
  dust: '#F5222D',
  volcano: '#FA541C',
  sunset: '#FAAD14',
  cyan: '#13C2C2',
  green: '#52C41A',
  geekblue: '#2F54EB',
  purple: '#722ED1',
}

export function genStringToTheme(val?: string): string {
  return val && themeConfig[val as keyof typeof themeConfig]
    ? themeConfig[val as keyof typeof themeConfig]
    : val || ''
}

export function clearMenuItem(menusData: MenuDataItem[]): MenuDataItem[] {
  return menusData
    .map((item) => {
      const children: MenuDataItem[] = item.children || []
      const finalItem = { ...item }
      if (!finalItem.name || finalItem.hideInMenu) {
        return null
      }
      if (finalItem && finalItem?.children) {
        if (
          !finalItem.hideChildrenInMenu
          && children.some(child => child && child.name && !child.hideInMenu)
        ) {
          return {
            ...item,
            children: clearMenuItem(children),
          }
        }
        delete finalItem.children
      }
      return finalItem
    })
    .filter(item => item) as MenuDataItem[]
}
