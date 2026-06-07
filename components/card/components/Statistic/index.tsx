import type { StatisticProps as AntStatisticProps, BadgeProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import { QuestionCircleOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Statistic as AntStatistic, Badge, Tooltip } from 'antdv-next'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useStyle } from './style'

export interface StatisticProps extends AntStatisticProps {
  tip?: VNodeChild
  icon?: VNodeChild
  description?: VNodeChild
  layout?: 'horizontal' | 'vertical' | 'inline'
  status?: BadgeProps['status']
  trend?: 'up' | 'down'
  class?: any
  className?: any
  style?: CSSProperties
  children?: VNodeChild
}

const Statistic = defineComponent({
  name: 'ProStatistic',
  inheritAttrs: false,
  props: [
    'title',
    'value',
    'prefix',
    'suffix',
    'tip',
    'icon',
    'description',
    'layout',
    'status',
    'trend',
    'valueStyle',
    'formatter',
    'class',
    'className',
    'style',
  ],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps as StatisticProps
    const prefixCls = useProPrefixCls('pro-card-statistic')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const layout = props.layout || 'inline'
      const title = slots.title?.() ?? props.title
      const prefix = slots.prefix?.() ?? props.prefix
      const suffix = slots.suffix?.() ?? props.suffix
      const description = slots.description?.() ?? props.description
      const tip = slots.tip?.() ?? props.tip
      const icon = slots.icon?.() ?? props.icon
      const tipDom = tip
        ? (
            <Tooltip title={tip as any}>
              <QuestionCircleOutlined class={clsx(`${prefixCls.value}-tip`, hashId)} />
            </Tooltip>
          )
        : null
      const trendDom = props.trend
        ? (
            <div
              class={clsx(`${prefixCls.value}-trend-icon`, hashId, {
                [`${prefixCls.value}-trend-icon-${props.trend}`]: props.trend,
              })}
            />
          )
        : null
      const statusDom = props.status
        ? (
            <div class={clsx(`${prefixCls.value}-status`, hashId)}>
              <Badge status={props.status} text={null} />
            </div>
          )
        : null
      const iconDom = icon ? <div class={clsx(`${prefixCls.value}-icon`, hashId)}>{icon}</div> : null
      const statisticSlots: Record<string, any> = {}
      if (title || tipDom) {
        statisticSlots.title = () => (
          <>
            {title}
            {tipDom}
          </>
        )
      }
      if (trendDom || prefix) {
        statisticSlots.prefix = () => (
          <>
            {trendDom}
            {prefix}
          </>
        )
      }
      if (suffix)
        statisticSlots.suffix = () => suffix
      if (slots.formatter || typeof props.formatter === 'function') {
        statisticSlots.formatter = ({ value }: { value?: string | number }) =>
          slots.formatter?.({ value }) ?? (props.formatter as any)?.(value)
      }

      return wrapSSR(
        <div class={clsx(prefixCls.value, props.class, props.className, hashId)} style={props.style}>
          {iconDom}
          <div class={clsx(`${prefixCls.value}-wrapper`, hashId)}>
            {statusDom}
            <div class={clsx(`${prefixCls.value}-content`, hashId)}>
              <AntStatistic
                {...attrs}
                value={props.value}
                valueStyle={props.valueStyle}
                class={clsx(hashId, {
                  [`${prefixCls.value}-layout-${layout}`]: layout,
                  [`${prefixCls.value}-trend-${props.trend}`]: props.trend,
                })}
                v-slots={statisticSlots}
              />
              {description
                ? <div class={clsx(`${prefixCls.value}-description`, hashId)}>{description}</div>
                : null}
            </div>
          </div>
        </div>,
      )
    }
  },
})

export default Statistic
