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

const Statistic = defineComponent<StatisticProps>({
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
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-card-statistic')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const layout = props.layout || 'inline'
      const trend = props.trend
      const status = props.status
      const title = slots.title?.() ?? props.title
      const prefix = slots.prefix?.() ?? props.prefix
      const suffix = slots.suffix?.() ?? props.suffix
      const description = slots.description?.() ?? props.description
      const tip = slots.tip?.() ?? props.tip
      const icon = slots.icon?.() ?? props.icon

      const classString = clsx(prefixCls.value, props.class, props.className, hashId)
      const statusClass = clsx(`${prefixCls.value}-status`, hashId)
      const iconClass = clsx(`${prefixCls.value}-icon`, hashId)
      const wrapperClass = clsx(`${prefixCls.value}-wrapper`, hashId)
      const contentClass = clsx(`${prefixCls.value}-content`, hashId)

      const statisticClassName = clsx(hashId, {
        [`${prefixCls.value}-layout-${layout}`]: layout,
        [`${prefixCls.value}-trend-${trend}`]: trend,
      })

      const tipDom = tip
        ? (
            <Tooltip title={tip as any}>
              <QuestionCircleOutlined class={clsx(`${prefixCls.value}-tip`, hashId)} />
            </Tooltip>
          )
        : null

      const trendIconClassName = clsx(`${prefixCls.value}-trend-icon`, hashId, {
        [`${prefixCls.value}-trend-icon-${trend}`]: trend,
      })

      const trendDom = trend ? <div class={trendIconClassName} /> : null

      const statusDom = status
        ? (
            <div class={statusClass}>
              <Badge status={status} text={null} />
            </div>
          )
        : null

      const iconDom = icon ? <div class={iconClass}>{icon}</div> : null

      // antdv-next Statistic 通过 slots 承载 title/prefix/suffix/formatter（React antd 用 props），
      // 此处把 React 的 title/prefix 组合转换为对应的 scoped slot。
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
        <div class={classString} style={props.style}>
          {iconDom}
          <div class={wrapperClass}>
            {statusDom}
            <div class={contentClass}>
              <AntStatistic
                {...attrs}
                value={props.value}
                valueStyle={props.valueStyle}
                class={statisticClassName}
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
