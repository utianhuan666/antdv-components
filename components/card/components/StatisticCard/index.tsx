import type { VNodeChild } from 'vue'
import type { CardProps } from '../../typing'
import type { StatisticProps } from '../Statistic'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
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

const StatisticCardBase = defineComponent({
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
    const props = rawProps as StatisticCardProps
    const { wrapSSR, hashId } = useStyle('ant-pro-statistic-card')

    return () => {
      const statistic = props.statistic
        ? <Statistic layout="vertical" {...props.statistic} />
        : null
      const chart = slots.chart?.() ?? props.chart
      const footer = slots.footer?.() ?? props.footer
      const chartDom = chart
        ? (
            <div
              class={clsx('ant-pro-statistic-card-chart', {
                'ant-pro-statistic-card-chart-left': props.chartPlacement === 'left' && statistic,
                'ant-pro-statistic-card-chart-right': props.chartPlacement === 'right' && statistic,
              })}
            >
              {chart}
            </div>
          )
        : null
      const contentCls = clsx('ant-pro-statistic-card-content', {
        'ant-pro-statistic-card-content-horizontal': props.chartPlacement === 'left' || props.chartPlacement === 'right',
      })
      const contentDom = (chartDom || statistic)
        ? (
            <div class={contentCls}>
              {props.chartPlacement === 'left' ? chartDom : statistic}
              {props.chartPlacement === 'left' ? statistic : chartDom}
            </div>
          )
        : null

      return wrapSSR(
        <Card
          {...attrs}
          {...props}
          class={clsx('ant-pro-statistic-card', hashId, props.class, props.className)}
          onCollapse={(value: boolean) => emit('collapse', value)}
          onClick={(event: MouseEvent) => emit('click', event)}
          onChecked={(event: MouseEvent) => emit('checked', event)}
        >
          {contentDom}
          {slots.default?.()}
          {footer != null ? <div class="ant-pro-statistic-card-footer">{footer}</div> : null}
        </Card>,
      )
    }
  },
})

const Group = defineComponent({
  name: 'StatisticCardGroup',
  inheritAttrs: false,
  props: StatisticCardBase.props as any,
  setup(props, { attrs, emit, slots }) {
    return () => (
      <StatisticCardBase
        {...attrs}
        {...props}
        styles={{ ...(props as any).styles, body: { ...(props as any).styles?.body, padding: 0 } }}
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
