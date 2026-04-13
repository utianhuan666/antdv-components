import type { CSSProperties, PropType } from 'vue'
import { Badge } from 'antdv-next'
import { defineComponent } from 'vue'

/** Quick status display with Badge component */
export const StatusComponents: Record<string, ReturnType<typeof defineComponent>> = {
  Success: defineComponent({
    name: 'StatusSuccess',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="success" text={slots.default?.() as any} /> },
  }),
  Error: defineComponent({
    name: 'StatusError',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="error" text={slots.default?.() as any} /> },
  }),
  Default: defineComponent({
    name: 'StatusDefault',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="default" text={slots.default?.() as any} /> },
  }),
  Processing: defineComponent({
    name: 'StatusProcessing',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="processing" text={slots.default?.() as any} /> },
  }),
  Warning: defineComponent({
    name: 'StatusWarning',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="warning" text={slots.default?.() as any} /> },
  }),
  // lowercase aliases
  success: defineComponent({
    name: 'Statussuccess',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="success" text={slots.default?.() as any} /> },
  }),
  error: defineComponent({
    name: 'Statuserror',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="error" text={slots.default?.() as any} /> },
  }),
  default: defineComponent({
    name: 'Statusdefault',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="default" text={slots.default?.() as any} /> },
  }),
  processing: defineComponent({
    name: 'Statusprocessing',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="processing" text={slots.default?.() as any} /> },
  }),
  warning: defineComponent({
    name: 'Statuswarning',
    props: { className: { type: String, default: '' }, style: { type: Object as PropType<CSSProperties>, default: () => ({}) } },
    setup(_, { slots }) { return () => <Badge status="warning" text={slots.default?.() as any} /> },
  }),
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
