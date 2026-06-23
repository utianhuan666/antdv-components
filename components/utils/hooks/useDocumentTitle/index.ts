import { watchEffect } from 'vue'
import { isBrowser } from '../../isBrowser'

export function useDocumentTitle(
  titleInfo: {
    title: string
    id: string
    pageName: string
  },
  appDefaultTitle: string | false,
) {
  watchEffect(() => {
    const titleText = typeof titleInfo.title === 'string' ? titleInfo.title : appDefaultTitle
    if (isBrowser() && titleText)
      document.title = titleText
  })
}
