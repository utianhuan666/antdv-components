import type { App } from 'vue'
import type {
  CheckCardGroupProps,
  CheckCardProps,
} from './components/CheckCard'
import type { ProCardDividerProps } from './components/Divider'
import type { ProCardOperationProps } from './components/Operation'
import type { StatisticProps } from './components/Statistic'
import type { StatisticCardProps } from './components/StatisticCard'
import type { ProCardProps, ProCardType } from './ProCard'
import type {
  CardType,
  ProCardTabPaneProps,
  ProCardTabsProps,
} from './typing'
import CheckCard from './components/CheckCard'
import Statistic from './components/Statistic'
import StatisticCard from './components/StatisticCard'
import ProCard from './ProCard'

const CardModule = {
  install(app: App) {
    app.component('ProCard', ProCard)
    app.component('CheckCard', CheckCard)
    app.component('StatisticCard', StatisticCard)
    app.component('ProStatistic', Statistic)
  },
}

export { CardModule, CheckCard, ProCard, Statistic, StatisticCard }
export type {
  CardType,
  CheckCardGroupProps,
  CheckCardProps,
  ProCardDividerProps,
  ProCardOperationProps,
  ProCardProps,
  ProCardTabPaneProps,
  ProCardTabsProps,
  ProCardType,
  StatisticCardProps,
  StatisticProps,
}

export default ProCard
