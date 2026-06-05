import type { VNodeChild } from 'vue'
import type { ProEllipsis } from '../../genCopyable'
import type { LabelTooltipType, WrapperTooltipProps } from '../../typing'
import { InfoCircleOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Tooltip } from 'antdv-next'
import { defineComponent, isVNode } from 'vue'

export const LabelIconTip = defineComponent({
  name: 'ProLabelIconTip',
  props: ['label', 'subTitle', 'tooltip', 'ellipsis'],
  setup(rawProps) {
    const props = rawProps as {
      label: VNodeChild
      subTitle?: VNodeChild
      tooltip?: string | LabelTooltipType
      ellipsis?: ProEllipsis
    }

    return () => {
      const { label, tooltip, ellipsis, subTitle } = props
      if (!tooltip && !subTitle)
        return <>{label}</>

      const tooltipProps = typeof tooltip === 'string' || isVNode(tooltip)
        ? { title: tooltip }
        : (tooltip as WrapperTooltipProps)
      const icon = tooltipProps?.icon || <InfoCircleOutlined />

      return (
        <div
          class="ant-pro-core-label-tip"
          onMousedown={(event: MouseEvent) => event.stopPropagation()}
          onMouseleave={(event: MouseEvent) => event.stopPropagation()}
          onMousemove={(event: MouseEvent) => event.stopPropagation()}
        >
          <div class={clsx('ant-pro-core-label-tip-title', { 'ant-pro-core-label-tip-title-ellipsis': ellipsis })}>{label}</div>
          {subTitle ? <div class="ant-pro-core-label-tip-subtitle">{subTitle}</div> : null}
          {tooltip
            ? (
                <Tooltip {...tooltipProps}>
                  <span class="ant-pro-core-label-tip-icon">{icon}</span>
                </Tooltip>
              )
            : null}
        </div>
      )
    }
  },
})

export default LabelIconTip
