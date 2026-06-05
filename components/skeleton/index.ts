import type { App } from 'vue'
import ProSkeletonComponent from './ProSkeleton.vue'

const ProSkeleton = ProSkeletonComponent as typeof ProSkeletonComponent & {
  install?: (app: App) => void
}

ProSkeleton.install = (app: App) => {
  app.component(ProSkeleton.name!, ProSkeleton)
}

export { ProSkeleton }

export { DescriptionsPageSkeleton, DescriptionsSkeleton, TableItemSkeleton, TableSkeleton } from './components/Descriptions'
export { ListPageSkeleton, ListSkeleton, ListSkeletonItem, ListToolbarSkeleton, PageHeaderSkeleton } from './components/List'
export { ResultPageSkeleton } from './components/Result'
export default ProSkeleton
