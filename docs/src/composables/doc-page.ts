import { computed, inject, provide, shallowRef } from 'vue'

export interface Frontmatter {
  title?: string
  subtitle?: string
  description?: string
  tag?: string
  demo?: {
    cols?: number
    class?: string
  }
  [key: string]: unknown
}

export interface HeaderItem {
  level: 2
  title: string
  slug: string
  link: string
  children?: HeaderItem[]
}

export interface DocPage {
  frontmatter?: Frontmatter
  title?: string
  headers?: HeaderItem[]
}

export interface AnchorItem {
  key: string
  title: string
  href: string
  children?: AnchorItem[]
}

export function useDocPage() {
  const pageData = shallowRef<DocPage>()
  const demosMap = new Map<string, unknown>()

  provide('__pageData__', (data: DocPage) => {
    pageData.value = data
  })

  provide('__demosMap__', (key: string, demo: unknown) => {
    demosMap.set(key, demo)
  })

  const anchorItems = computed<AnchorItem[]>(() => {
    const formatHeaders = (headers: HeaderItem[]): AnchorItem[] => {
      return headers.map((header) => {
        const item: AnchorItem = {
          key: header.slug,
          title: header.title,
          href: header.link || `#${header.slug}`,
        }
        if (header.children?.length) item.children = formatHeaders(header.children)
        return item
      })
    }

    return formatHeaders(pageData.value?.headers ?? [])
  })

  return {
    pageData,
    anchorItems,
    demosMap,
  }
}

export function usePageInfo() {
  return inject('__pageInfo__', {} as DocPage) as DocPage
}
