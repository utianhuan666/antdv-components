import type { App } from 'vue'
import type {
  CheckCardGroupProps,
  CheckCardProps,
} from './components/CheckCard'
import type { StatisticProps } from './components/Statistic'
import type { StatisticCardProps } from './components/StatisticCard'
import type { ProCardProps } from './ProCard'
import type { ProCardTabsProps } from './typing'
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
  CheckCardGroupProps,
  CheckCardProps,
  ProCardProps,
  ProCardTabsProps,
  StatisticCardProps,
  StatisticProps,
}

export default ProCard
