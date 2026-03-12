import type { App } from 'vue'
import { version } from '../package.json'
import { Button } from './button'
import { Form, MyFormItem as FormItem } from './form'
import { ProSkeleton } from './skeleton'

export default {
  install(app: App) {
    app.use(Button as any)
    app.use(Form as any)
    app.use(ProSkeleton as any)
  },
  version,
}

export { Button, Form, FormItem, ProSkeleton, version }
export { DescriptionsPageSkeleton, DescriptionsSkeleton, TableItemSkeleton, TableSkeleton } from './skeleton'
export { ListPageSkeleton, ListSkeleton, ListSkeletonItem, ListToolbarSkeleton, PageHeaderSkeleton } from './skeleton'
export { ResultPageSkeleton } from './skeleton'
