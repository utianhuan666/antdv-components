import type { CSSProperties, VNodeChild } from 'vue'
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

export function ProFieldBadgeColor(props: StatusProps & { color: string }) {
  return <Badge color={props.color} text={props.children as any} />
}

export function objectToMap(value: ProFieldValueEnumType | undefined): ProSchemaValueEnumMap {
  if (getType(value) === 'map')
    return value as ProSchemaValueEnumMap
  return new Map(Object.entries(value || {})) as ProSchemaValueEnumMap
}

const TableStatus = {
  Success: (props: StatusProps) => <Badge status="success" text={props.children as any} />,
  Error: (props: StatusProps) => <Badge status="error" text={props.children as any} />,
  Default: (props: StatusProps) => <Badge status="default" text={props.children as any} />,
  Processing: (props: StatusProps) => <Badge status="processing" text={props.children as any} />,
  Warning: (props: StatusProps) => <Badge status="warning" text={props.children as any} />,
  success: (props: StatusProps) => <Badge status="success" text={props.children as any} />,
  error: (props: StatusProps) => <Badge status="error" text={props.children as any} />,
  default: (props: StatusProps) => <Badge status="default" text={props.children as any} />,
  processing: (props: StatusProps) => <Badge status="processing" text={props.children as any} />,
  warning: (props: StatusProps) => <Badge status="warning" text={props.children as any} />,
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
  const Status = TableStatus[status || 'default']
  if (Status)
    return <Status key={key}>{domText.text}</Status>
  if (color)
    return <ProFieldBadgeColor key={key} color={color}>{domText.text}</ProFieldBadgeColor>
  return <>{domText.text || (domText as any as VNodeChild)}</>
}
