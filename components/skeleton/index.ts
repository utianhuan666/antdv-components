import type { App } from 'vue'
import ProSkeleton from './ProSkeleton.vue'

ProSkeleton.install = (app: App) => {
  app.component(ProSkeleton.name!, ProSkeleton)
}

export { ProSkeleton }

export { DescriptionsPageSkeleton, DescriptionsSkeleton, TableItemSkeleton, TableSkeleton } from './components/Descriptions'
export { ListPageSkeleton, ListSkeleton, ListSkeletonItem, ListToolbarSkeleton, PageHeaderSkeleton } from './components/List'
export { ResultPageSkeleton } from './components/Result'
