import type { CSSProperties, VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { Statistic as AntStatistic } from 'antdv-next'
import { defineComponent } from 'vue'
import { useStyle } from './style'

export interface StatisticProps {
  title?: VNodeChild
  value?: string | number
  prefix?: VNodeChild
  suffix?: VNodeChild
  tip?: VNodeChild
  icon?: VNodeChild
  description?: VNodeChild
  layout?: 'horizontal' | 'vertical' | 'inline'
  status?: 'success' | 'error' | 'warning' | 'processing' | 'default'
  trend?: 'up' | 'down'
  valueStyle?: CSSProperties
  formatter?: (value?: string | number) => VNodeChild
  class?: any
  className?: any
  style?: CSSProperties
  [key: string]: any
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
    const { wrapSSR, hashId } = useStyle('ant-pro-statistic')

    return () => {
      const layout = props.layout || 'horizontal'
      const statisticSlots: Record<string, any> = {}
      if (slots.title || props.title != null)
        statisticSlots.title = () => slots.title?.() ?? props.title
      if (slots.prefix || props.prefix != null || props.icon != null)
        statisticSlots.prefix = () => slots.prefix?.() ?? props.prefix ?? props.icon
      if (slots.suffix || props.suffix != null)
        statisticSlots.suffix = () => slots.suffix?.() ?? props.suffix
      if (slots.formatter || props.formatter)
        statisticSlots.formatter = ({ value }: { value?: string | number }) => slots.formatter?.({ value }) ?? props.formatter?.(value)

      return wrapSSR(
        <div
          class={clsx(
            'ant-pro-statistic',
            hashId,
            `ant-pro-statistic-${layout}`,
            props.status && `ant-pro-statistic-status-${props.status}`,
            props.trend && `ant-pro-statistic-trend-${props.trend}`,
            props.class,
            props.className,
          )}
          style={props.style}
        >
          <AntStatistic
            {...attrs}
            value={props.value}
            valueStyle={props.valueStyle}
            v-slots={statisticSlots}
          />
          {props.description || slots.description
            ? <div class="ant-pro-statistic-description">{slots.description?.() ?? props.description}</div>
            : null}
        </div>,
      )
    }
  },
})

export default Statistic
