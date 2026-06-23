import type { VNodeChild } from 'vue'
import type { ProEllipsis } from '../../genCopyable'
import type { LabelTooltipType, WrapperTooltipProps } from '../../typing'
import { InfoCircleOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Tooltip } from 'antdv-next'
import { defineComponent, isVNode } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useStyle } from './style'

interface LabelIconTipProps {
  label: VNodeChild
  subTitle?: VNodeChild
  tooltip?: string | LabelTooltipType
  ellipsis?: ProEllipsis
}

export const LabelIconTip = defineComponent<LabelIconTipProps>({
  name: 'ProLabelIconTip',
  props: ['label', 'subTitle', 'tooltip', 'ellipsis'],
  setup(rawProps) {
    const props = rawProps
    const prefixCls = useProPrefixCls('pro-core-label-tip')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const { label, tooltip, ellipsis, subTitle } = props
      if (!tooltip && !subTitle)
        return <>{label}</>

      const tooltipProps = typeof tooltip === 'string' || isVNode(tooltip)
        ? { title: tooltip }
        : (tooltip as WrapperTooltipProps)
      const icon = tooltipProps?.icon || <InfoCircleOutlined />

      return wrapSSR(
        <div
          class={clsx(prefixCls.value, hashId)}
          onMousedown={(event: MouseEvent) => event.stopPropagation()}
          onMouseleave={(event: MouseEvent) => event.stopPropagation()}
          onMousemove={(event: MouseEvent) => event.stopPropagation()}
        >
          <div class={clsx(`${prefixCls.value}-title`, hashId, { [`${prefixCls.value}-title-ellipsis`]: ellipsis })}>{label}</div>
          {subTitle ? <div class={clsx(`${prefixCls.value}-subtitle`, hashId)}>{subTitle}</div> : null}
          {tooltip
            ? (
                <Tooltip {...tooltipProps}>
                  <span class={clsx(`${prefixCls.value}-icon`, hashId)}>{icon}</span>
                </Tooltip>
              )
            : null}
        </div>,
      )
    }
  },
})

export default LabelIconTip
