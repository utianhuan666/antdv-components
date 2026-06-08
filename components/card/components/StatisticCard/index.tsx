import type { VNodeChild } from 'vue'
import type { CardProps } from '../../typing'
import type { StatisticProps } from '../Statistic'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import Card from '../Card'
import Divider from '../Divider'
import Operation from '../Operation'
import Statistic from '../Statistic'
import { useStyle } from './style'

export type StatisticCardProps = CardProps & {
  chart?: VNodeChild
  statistic?: StatisticProps
  chartPlacement?: 'right' | 'bottom' | 'left'
  footer?: VNodeChild
}

const StatisticCardBase = defineComponent<StatisticCardProps>({
  name: 'StatisticCard',
  inheritAttrs: false,
  props: [
    'chart',
    'statistic',
    'chartPlacement',
    'footer',
    'class',
    'className',
    'title',
    'subTitle',
    'tooltip',
    'extra',
    'headerBordered',
    'layout',
    'type',
    'direction',
    'wrap',
    'size',
    'loading',
    'colSpan',
    'colStyle',
    'gutter',
    'actions',
    'split',
    'variant',
    'hoverable',
    'ghost',
    'collapsible',
    'collapsed',
    'defaultCollapsed',
    'collapsibleIconRender',
    'checked',
    'tabs',
    'styles',
    'classNames',
    'style',
    'rootClassName',
    'cover',
    'boxShadow',
    'prefixCls',
  ],
  emits: ['collapse', 'click', 'checked'],
  setup(rawProps, { attrs, emit, slots }) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-statistic-card')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const {
        chart: _chart,
        statistic: _statistic,
        chartPlacement: _chartPlacement,
        footer: _footer,
        class: classProp,
        className,
        ...others
      } = props as any

      const chart = slots.chart?.() ?? props.chart
      const footer = slots.footer?.() ?? props.footer

      const classString = clsx(prefixCls.value, classProp, className, hashId)

      // 在 StatisticCard 中时默认为 vertical。
      const statisticDom = props.statistic
        ? <Statistic layout="vertical" {...props.statistic} />
        : null

      const chartCls = clsx(`${prefixCls.value}-chart`, hashId, {
        [`${prefixCls.value}-chart-left`]: props.chartPlacement === 'left' && chart && props.statistic,
        [`${prefixCls.value}-chart-right`]: props.chartPlacement === 'right' && chart && props.statistic,
      })

      const chartDom = chart ? <div class={chartCls}>{chart}</div> : null

      const contentCls = clsx(`${prefixCls.value}-content`, hashId, {
        [`${prefixCls.value}-content-horizontal`]: props.chartPlacement === 'left' || props.chartPlacement === 'right',
      })

      // 默认上下结构
      const contentDom = (chartDom || statisticDom)
        ? (props.chartPlacement === 'left'
            ? (
                <div class={contentCls}>
                  {chartDom}
                  {statisticDom}
                </div>
              )
            : (
                <div class={contentCls}>
                  {statisticDom}
                  {chartDom}
                </div>
              ))
        : null

      const footerDom = footer
        ? <div class={clsx(`${prefixCls.value}-footer`, hashId)}>{footer}</div>
        : null

      return wrapSSR(
        <Card
          {...attrs}
          {...others}
          class={classString}
          onCollapse={(value: boolean) => emit('collapse', value)}
          onClick={(event: MouseEvent) => emit('click', event)}
          onChecked={(event: MouseEvent) => emit('checked', event)}
        >
          {contentDom}
          {slots.default?.()}
          {footerDom}
        </Card>,
      )
    }
  },
})

const Group = defineComponent({
  name: 'StatisticCardGroup',
  inheritAttrs: false,
  props: StatisticCardBase.props as any,
  emits: ['collapse', 'click', 'checked'],
  setup(props, { attrs, emit, slots }) {
    return () => (
      <StatisticCardBase
        styles={{ body: { padding: 0 } }}
        {...attrs}
        {...props}
        onCollapse={(value: boolean) => emit('collapse', value)}
        onClick={(event: MouseEvent) => emit('click', event)}
        onChecked={(event: MouseEvent) => emit('checked', event)}
      >
        {slots.default?.()}
      </StatisticCardBase>
    )
  },
})

;(Group as any).isProCard = true

const StatisticCard = Object.assign(StatisticCardBase, {
  Statistic,
  Divider,
  Operation,
  isProCard: true,
  Group,
})

export default StatisticCard
