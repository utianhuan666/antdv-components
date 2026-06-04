import type { CSSProperties, PropType } from 'vue'
import { Badge } from 'antdv-next'
import { defineComponent } from 'vue'

const statusProps = {
  className: { type: String, default: '' },
  style: { type: Object as PropType<CSSProperties>, default: () => ({}) },
}

function createStatusComponent(name: string, status: 'success' | 'error' | 'default' | 'processing' | 'warning') {
  return defineComponent({
    name,
    props: statusProps,
    setup(_, { slots }) {
      return () => <Badge status={status} text={slots.default?.() as any} />
    },
  })
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

export const ProFieldBadgeColor = defineComponent({
  name: 'ProFieldBadgeColor',
  props: {
    color: { type: String, default: '' },
    className: { type: String, default: '' },
    style: { type: Object as PropType<CSSProperties>, default: () => ({}) },
  },
  setup(props, { slots }) {
    return () => <Badge color={props.color} text={slots.default?.() as any} />
  },
})

export default StatusComponents
