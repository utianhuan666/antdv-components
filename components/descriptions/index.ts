import type { App } from 'vue'
import ProDescriptions from './ProDescriptions'

const DescriptionsModule = {
  install(app: App) {
    app.component(ProDescriptions.name!, ProDescriptions)
  },
}

export { DescriptionsModule, ProDescriptions }
export type {
  DescriptionsItemProps,
  ProDescriptionsActionType,
  ProDescriptionsColumn,
  ProDescriptionsItemProps,
  ProDescriptionsProps,
  RowEditableConfig,
} from './typing'
export type { ProDescriptionsRequestResult, RequestData } from './useFetchData'

export default ProDescriptions
