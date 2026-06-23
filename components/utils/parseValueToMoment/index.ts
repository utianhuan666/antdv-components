import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { isNil } from '../isNil'

dayjs.extend(customParseFormat)

type DateValue = Dayjs | Dayjs[] | string | string[] | number | number[] | Date

const isMoment = (value: any): boolean => Boolean(value?._isAMomentObject)

function hasOwn(source: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, key)
}

export function normalizeSerializedDayjsLike(value: unknown): Dayjs | null {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return null
  const rec = value as Record<string, unknown>
  if (hasOwn(rec, '$d')) {
    const raw = rec.$d
    if (isNil(raw) || raw === '')
      return null
    const parsed = raw instanceof Date ? dayjs(raw) : dayjs(raw as string | number)
    return parsed.isValid() ? parsed : null
  }
  if (rec.$isDayjsObject === true && typeof (value as any).valueOf === 'function') {
    const ms = Number((value as any).valueOf())
    if (Number.isFinite(ms)) {
      const d = dayjs(ms)
      return d.isValid() ? d : null
    }
  }
  return null
}

export function parseValueToDay(value: DateValue, formatter?: string): Dayjs | Dayjs[] | null | undefined {
  if (isNil(value))
    return value as null | undefined
  if (Array.isArray(value))
    return (value as any[]).map(v => parseValueToDay(v, formatter) as Dayjs)
  if (isMoment(value))
    return dayjs(value as any)

  const serialized = normalizeSerializedDayjsLike(value)
  if (serialized)
    return serialized

  if (dayjs.isDayjs(value)) {
    const d = value as Dayjs
    if (typeof d.clone === 'function' && d.isValid())
      return d
    const ms = typeof (d as any).valueOf === 'function' ? Number((d as any).valueOf()) : Number.NaN
    if (Number.isFinite(ms)) {
      const fromMs = dayjs(ms)
      if (fromMs.isValid())
        return fromMs
    }
    return null
  }

  if (typeof value === 'number')
    return dayjs(value)
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return dayjs(value)
  if (typeof value === 'string') {
    const parsed = formatter ? dayjs(value, formatter) : dayjs(value)
    if (formatter && parsed.isValid()) {
      const normalized = dayjs(parsed.format(formatter), formatter)
      return normalized.isValid() ? normalized : parsed
    }
    return parsed.isValid() ? parsed : null
  }

  if (value && typeof value === 'object') {
    const ms = typeof (value as any).valueOf === 'function' ? Number((value as any).valueOf()) : Number.NaN
    if (Number.isFinite(ms) && ((value as any).$isDayjsObject === true || hasOwn(value as object, '$d'))) {
      const fromMs = dayjs(ms)
      if (fromMs.isValid())
        return fromMs
    }
  }

  const fallback = formatter ? dayjs(value as any, formatter) : dayjs(value as any)
  return fallback.isValid() ? fallback : null
}
