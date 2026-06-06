import type { MaybeRefOrGetter } from 'vue'
import type { ProSettings } from '../defaultSettings'
import { computed, toValue } from 'vue'
import { omitUndefined } from '../../utils'

export function getCurrentMenuLayoutProps(currentMenu: ProSettings) {
  return omitUndefined({
    layout:
      typeof currentMenu.layout !== 'object'
        ? currentMenu.layout
        : undefined,
    menuRender: currentMenu.menuRender,
    footerRender: currentMenu.footerRender,
    menuHeaderRender: currentMenu.menuHeaderRender,
    headerRender: currentMenu.headerRender,
    fixSiderbar: currentMenu.fixSiderbar,
  })
}

function useCurrentMenuLayoutProps(currentMenu: MaybeRefOrGetter<ProSettings>) {
  return computed(() => getCurrentMenuLayoutProps(toValue(currentMenu)))
}

export { useCurrentMenuLayoutProps }
