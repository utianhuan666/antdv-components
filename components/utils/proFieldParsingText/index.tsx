import type { CSSProperties, SetupContext, Slots, VNodeChild } from 'vue'
import type { ProFieldValueEnumType, ProSchemaValueEnumMap } from '../typing'
import { Badge, Space } from 'antdv-next'
import { Fragment } from 'vue'

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

export function ProFieldBadgeColor(props: StatusProps & { color: string }, { slots }: SetupContext) {
  return <Badge color={props.color} text={getChildren(props, slots) as any} />
}
ProFieldBadgeColor.displayName = 'ProFieldBadgeColor'

export function objectToMap(value: ProFieldValueEnumType | undefined): ProSchemaValueEnumMap {
  if (getType(value) === 'map')
    return value as ProSchemaValueEnumMap
  return new Map(Object.entries(value || {})) as ProSchemaValueEnumMap
}

type BadgeStatus = 'success' | 'error' | 'default' | 'processing' | 'warning'

function createStatusComponent(name: string, status: BadgeStatus) {
  const StatusComponent = (props: StatusProps, { slots }: SetupContext) => (
    <Badge status={status} text={getChildren(props, slots) as any} />
  )
  StatusComponent.displayName = name
  return StatusComponent
}

const TableStatus = {
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
    return <Fragment key={key}>{(text as any)?.label || text}</Fragment>

  const { status, color } = domText
  const Status = TableStatus[status || 'Init']
  if (Status)
    return <Status key={key}>{domText.text}</Status>
  if (color)
    return <ProFieldBadgeColor key={key} color={color}>{domText.text}</ProFieldBadgeColor>
  return <Fragment key={key}>{domText.text || (domText as any as VNodeChild)}</Fragment>
}
