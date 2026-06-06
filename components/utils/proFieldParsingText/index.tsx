import type { CSSProperties, Slots, VNodeChild } from 'vue'
import type { ProFieldValueEnumType, ProSchemaValueEnumMap } from '../typing'
import { Badge, Space } from 'antdv-next'

function getType(obj: any) {
  const type = Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)?.[1]?.toLowerCase()
  if (type === 'string' && typeof obj === 'object')
    return 'object'
  if (obj === null)
    return 'null'
  if (obj === undefined)
    return 'undefined'
  return type
}

interface StatusProps {
  className?: string
  style?: CSSProperties
  children?: VNodeChild
}

function getChildren(props: StatusProps, slots?: Slots): VNodeChild {
  return slots?.default?.() ?? props.children
}

export function ProFieldBadgeColor(props: StatusProps & { color: string }, { slots }: { slots?: Slots } = {}) {
  return <Badge color={props.color} text={getChildren(props, slots) as any} />
}

export function objectToMap(value: ProFieldValueEnumType | undefined): ProSchemaValueEnumMap {
  if (getType(value) === 'map')
    return value as ProSchemaValueEnumMap
  return new Map(Object.entries(value || {})) as ProSchemaValueEnumMap
}

const TableStatus = {
  Success: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="success" text={getChildren(props, slots) as any} />,
  Error: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="error" text={getChildren(props, slots) as any} />,
  Default: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="default" text={getChildren(props, slots) as any} />,
  Processing: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="processing" text={getChildren(props, slots) as any} />,
  Warning: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="warning" text={getChildren(props, slots) as any} />,
  success: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="success" text={getChildren(props, slots) as any} />,
  error: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="error" text={getChildren(props, slots) as any} />,
  default: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="default" text={getChildren(props, slots) as any} />,
  processing: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="processing" text={getChildren(props, slots) as any} />,
  warning: (props: StatusProps, { slots }: { slots?: Slots } = {}) => <Badge status="warning" text={getChildren(props, slots) as any} />,
} as const

type ProFieldStatusType = keyof typeof TableStatus

export function proFieldParsingText(text: string | number | (string | number)[], valueEnumParams: ProFieldValueEnumType, key?: number | string): VNodeChild {
  if (Array.isArray(text)) {
    return (
      <Space key={key} separator="," size={2} wrap>
        {text.map((value, index) => proFieldParsingText(value, valueEnumParams, index))}
      </Space>
    )
  }

  const valueEnum = objectToMap(valueEnumParams)
  if (!valueEnum.has(text) && !valueEnum.has(`${text}`))
    return (text as any)?.label || text

  const domText = (valueEnum.get(text) || valueEnum.get(`${text}`)) as {
    text: VNodeChild
    status: ProFieldStatusType
    color?: string
  }
  if (!domText)
    return (text as any)?.label || text

  const { status, color } = domText
  const Status = TableStatus[status || 'Init']
  if (Status)
    return <Status key={key}>{domText.text}</Status>
  if (color)
    return <ProFieldBadgeColor key={key} color={color}>{domText.text}</ProFieldBadgeColor>
  return <>{domText.text || (domText as any as VNodeChild)}</>
}
