import type { Dayjs } from 'dayjs'
import dayjs from '../../initDayjs'

export type DatePickerReadPicker = 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year'

function pickFormatTemplate(format: unknown): string {
  if (Array.isArray(format)) {
    const head = format[0]
    return typeof head === 'string' && head ? head : 'YYYY-MM-DD'
  }
  if (typeof format === 'string' && format)
    return format
  return 'YYYY-MM-DD'
}

function hasOwn(source: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, key)
}

function normalizeSerializedDayjsLike(value: unknown): Dayjs | null {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return null

  const record = value as Record<string, unknown>
  if (hasOwn(record, '$d')) {
    const raw = record.$d
    if (raw === null || raw === undefined || raw === '')
      return null
    const parsed = raw instanceof Date ? dayjs(raw) : dayjs(raw as string | number)
    return parsed.isValid() ? parsed : null
  }

  if (record.$isDayjsObject === true && typeof (value as any).valueOf === 'function') {
    const ms = Number((value as any).valueOf())
    if (Number.isFinite(ms)) {
      const parsed = dayjs(ms)
      return parsed.isValid() ? parsed : null
    }
  }

  return null
}

export function parseValueToDay(value: any, format?: string): Dayjs | Dayjs[] | null | undefined {
  if (value === null || value === undefined || value === '')
    return undefined

  if (Array.isArray(value)) {
    const parsedValue = value.map(item => parseValueToDay(item, format))
    return parsedValue.every(item => item && !Array.isArray(item) && item.isValid())
      ? parsedValue as Dayjs[]
      : undefined
  }

  const serialized = normalizeSerializedDayjsLike(value)
  if (serialized)
    return serialized

  if (dayjs.isDayjs(value) && typeof value.isValid === 'function')
    return value.isValid() ? value : undefined

  const parsed = dayjs(value, typeof value === 'number' ? undefined : format)
  return parsed.isValid() ? parsed : undefined
}

export function formatDate(
  text: any,
  format: any,
  _picker?: DatePickerReadPicker,
): string {
  if (text === null || text === undefined || text === '')
    return '-'

  const parsed = parseValueToDay(text) as Dayjs | Dayjs[] | null | undefined
  if (Array.isArray(parsed) || !parsed || !parsed.isValid())
    return '-'

  if (typeof format === 'function')
    return format(parsed)

  return parsed.format(pickFormatTemplate(format))
}
