import type { BadgeProps } from 'antdv-next'
import type { CSSProperties, SetupContext, VNodeChild } from 'vue'
import { Badge } from 'antdv-next'

interface StatusProps {
  className?: string
  style?: CSSProperties
  children?: VNodeChild
}

type StatusColorProps = StatusProps & {
  color: BadgeProps['color']
}

type BadgeStatus = 'success' | 'error' | 'default' | 'processing' | 'warning'

function createStatusComponent(name: string, status: BadgeStatus) {
  const StatusComponent = (_props: StatusProps, { slots }: SetupContext) => {
    return <Badge status={status} text={(slots.default?.() ?? _props.children) as BadgeProps['text']} />
  }
  StatusComponent.displayName = name
  return StatusComponent
}

/** Quick status display with Badge component */
export const StatusComponents = {
  Success: createStatusComponent('StatusSuccess', 'success'),
  Error: createStatusComponent('StatusError', 'error'),
  Default: createStatusComponent('StatusDefault', 'default'),
  Processing: createStatusComponent('StatusProcessing', 'processing'),
  Warning: createStatusComponent('StatusWarning', 'warning'),
  success: createStatusComponent('Statussuccess', 'success'),
  error: createStatusComponent('Statuserror', 'error'),
  default: createStatusComponent('Statusdefault', 'default'),
  processing: createStatusComponent('Statusprocessing', 'processing'),
  warning: createStatusComponent('Statuswarning', 'warning'),
}

export type ProFieldStatusType = keyof typeof StatusComponents

export function ProFieldBadgeColor(props: StatusColorProps, { slots }: SetupContext) {
  return <Badge color={props.color ?? ''} text={(slots.default?.() ?? props.children) as BadgeProps['text']} />
}
ProFieldBadgeColor.displayName = 'ProFieldBadgeColor'

export default StatusComponents
