import type { Dayjs } from 'dayjs'
import type { NamePath, ProFieldValueType } from '../typing'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import { isNil } from '../isNil'
import { normalizeSerializedDayjsLike } from '../parseValueToMoment'
import { getValue } from '../path'

dayjs.extend(isoWeek)
dayjs.extend(advancedFormat)
dayjs.extend(quarterOfYear)

type DateFormatter
  = | (string & {})
    | 'number'
    | 'string'
    | ((value: Dayjs, valueType: string) => string | number)
    | false

export const dateFormatterMap = {
  time: 'HH:mm:ss',
  timeRange: 'HH:mm:ss',
  date: 'YYYY-MM-DD',
  dateWeek: 'GGGG-[W]WW',
  dateWeekRange: 'GGGG-[W]WW',
  dateMonth: 'YYYY-MM',
  dateQuarter: 'YYYY-[Q]Q',
  dateYear: 'YYYY',
  dateRange: 'YYYY-MM-DD',
  dateTime: 'YYYY-MM-DD HH:mm:ss',
  dateTimeRange: 'YYYY-MM-DD HH:mm:ss',
}

export function getLightFilterRangeDisplayFormat(valueType: string | undefined): string {
  if (valueType && valueType in dateFormatterMap)
    return dateFormatterMap[valueType as keyof typeof dateFormatterMap]
  return 'YYYY-MM-DD'
}

function isObject(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function isPlainObject(value: { constructor: any }): boolean {
  if (!isObject(value))
    return false
  const ctor = value.constructor
  if (ctor === undefined)
    return true
  const prot = ctor.prototype
  if (!isObject(prot))
    return false
  return Object.prototype.hasOwnProperty.call(prot, 'isPrototypeOf') !== false
}

const isMoment = (value: any): boolean => Boolean(value?._isAMomentObject)

function formatWithQuarterFallback(value: Dayjs, formatter: string): string {
  const formatted = value.format(formatter)
  if (!formatter.includes('Q') || !formatted.includes('Q'))
    return formatted

  const quarter = typeof (value as any).quarter === 'function'
    ? (value as any).quarter()
    : Math.floor(value.month() / 3) + 1

  return formatted.replace(/QQ/g, `Q${quarter}`)
}

export function convertMoment(value: Dayjs, dateFormatter: DateFormatter, valueType: string) {
  if (!dateFormatter)
    return value

  let target: any = value
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    target = dayjs(value)

  if (dayjs.isDayjs(target) || isMoment(target)) {
    if (typeof target.format !== 'function')
      return value
    if (dateFormatter === 'number')
      return target.valueOf()
    if (dateFormatter === 'string')
      return formatWithQuarterFallback(target, dateFormatterMap[valueType as 'date'] || 'YYYY-MM-DD HH:mm:ss')
    if (typeof dateFormatter === 'string' && dateFormatter !== 'string')
      return formatWithQuarterFallback(target, dateFormatter)
    if (typeof dateFormatter === 'function')
      return dateFormatter(target, valueType)
  }
  return value
}

export function conversionMomentValue<T extends {} = any>(value: T, dateFormatter: DateFormatter, valueTypeMap: Record<string, { valueType: ProFieldValueType, dateFormat: string } | any>, omitNil?: boolean, parentKey?: NamePath): T {
  const tmpValue = {} as Record<string, any> as T
  if (typeof window === 'undefined')
    return value
  if (typeof value !== 'object' || isNil(value) || value instanceof Blob || Array.isArray(value))
    return value

  Object.keys(value as Record<string, any>).forEach((valueKey) => {
    const parentPath = parentKey === undefined ? [] : [parentKey].flat(1)
    const namePath = [...parentPath, valueKey] as (string | number)[]
    const valueFormatMap = getValue(valueTypeMap, namePath) || 'text'
    let valueType: ProFieldValueType = 'text'
    let dateFormat: string | undefined
    if (typeof valueFormatMap === 'string') {
      valueType = valueFormatMap as ProFieldValueType
    }
    else if (valueFormatMap) {
      valueType = valueFormatMap.valueType
      dateFormat = valueFormatMap.dateFormat
    }

    const itemValue = (value as Record<string, any>)[valueKey]
    if (omitNil && (isNil(itemValue) || itemValue === ''))
      return

    const currentDateFormatter = dateFormatter ?? 'string'
    let finalDateFormatter: DateFormatter
    if (currentDateFormatter === 'number' || currentDateFormatter === false || typeof currentDateFormatter === 'function')
      finalDateFormatter = currentDateFormatter
    else if (currentDateFormatter === 'string')
      finalDateFormatter = dateFormat || dateFormatterMap[valueType as keyof typeof dateFormatterMap]
    else
      finalDateFormatter = currentDateFormatter

    const serializedDayjs = normalizeSerializedDayjsLike(itemValue)
    if (serializedDayjs) {
      ;(tmpValue as any)[valueKey] = convertMoment(serializedDayjs, finalDateFormatter, valueType)
      return
    }

    if (isPlainObject(itemValue) && !Array.isArray(itemValue) && !dayjs.isDayjs(itemValue) && !isMoment(itemValue)) {
      ;(tmpValue as any)[valueKey] = conversionMomentValue(itemValue, dateFormatter, valueTypeMap, omitNil, namePath)
      return
    }

    if (Array.isArray(itemValue)) {
      ;(tmpValue as any)[valueKey] = itemValue.map((arrayValue, index) => {
        if (dayjs.isDayjs(arrayValue) || isMoment(arrayValue)) {
          const arrayDateFormatter = finalDateFormatter === undefined && currentDateFormatter === 'string' ? 'string' : finalDateFormatter
          return convertMoment(arrayValue, arrayDateFormatter, valueType)
        }
        const serialized = normalizeSerializedDayjsLike(arrayValue)
        if (serialized) {
          const arrayDateFormatter = finalDateFormatter === undefined && currentDateFormatter === 'string' ? 'string' : finalDateFormatter
          return convertMoment(serialized, arrayDateFormatter, valueType)
        }
        return conversionMomentValue(arrayValue, dateFormatter, valueTypeMap, omitNil, [valueKey, `${index}`].flat(1))
      })
      return
    }

    ;(tmpValue as any)[valueKey] = convertMoment(itemValue, finalDateFormatter, valueType)
  })

  return tmpValue
}
