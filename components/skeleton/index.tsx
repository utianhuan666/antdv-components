import type { App } from 'vue'
import type { DescriptionsPageSkeletonProps } from './components/Descriptions'
import type { ListPageSkeletonProps } from './components/List'
import { defineComponent } from 'vue'
import DescriptionsPageSkeleton, {
  DescriptionsSkeleton,
  TableItemSkeleton,
  TableSkeleton,
} from './components/Descriptions'
import ListPageSkeleton, {
  ListSkeleton,
  ListSkeletonItem,
  ListToolbarSkeleton,
  PageHeaderSkeleton,
} from './components/List'
import ResultPageSkeleton from './components/Result'

type ProSkeletonProps = ListPageSkeletonProps & DescriptionsPageSkeletonProps & {
  type?: 'list' | 'result' | 'descriptions'
  active?: boolean
}

const proSkeletonPropNames = [
  'type',
  'active',
  'pageHeader',
  'statistic',
  'actionButton',
  'toolbar',
  'list',
]

const ProSkeletonComponent = defineComponent<ProSkeletonProps>({
  name: 'ProSkeleton',
  props: proSkeletonPropNames,
  setup(rawProps) {
    return () => {
      const { type = 'list', ...rest } = rawProps as ProSkeletonProps

      if (type === 'result') {
        return <ResultPageSkeleton {...rest} />
      }

      if (type === 'descriptions') {
        return <DescriptionsPageSkeleton {...rest} />
      }

      return <ListPageSkeleton {...rest} />
    }
  },
})

const ProSkeleton = ProSkeletonComponent as typeof ProSkeletonComponent & {
  install?: (app: App) => void
}

ProSkeleton.install = (app: App) => {
  app.component(ProSkeleton.name!, ProSkeleton)
}

export {
  DescriptionsSkeleton,
  ListPageSkeleton,
  ListSkeleton,
  ListSkeletonItem,
  ListToolbarSkeleton,
  PageHeaderSkeleton,
  ProSkeleton,
  TableItemSkeleton,
  TableSkeleton,
}

export default ProSkeleton
