import type { VNodeChild } from 'vue'

export interface AppItemProps {
  title: VNodeChild
  desc?: VNodeChild
  icon?: VNodeChild | (() => VNodeChild)
  url?: string
  target?: string
  children?: Omit<AppItemProps, 'children'>[]
}

export type AppListProps = AppItemProps[]
