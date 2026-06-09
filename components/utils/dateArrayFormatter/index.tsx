import dayjs from 'dayjs'

type FormatType = ((dayjs: any) => string) | string

/**
 * 通过 format 来格式化日期，因为支持了function 所以需要单独的方法来处理
 * @param  {any} endText
 * @param  {FormatType} format
 * @return string
 */
function toDayjsInstance(endText: any) {
  if (dayjs.isDayjs(endText)) {
    return endText
  }
  if (
    endText != null
    && typeof endText.format === 'function'
    && typeof endText.isValid === 'function'
  ) {
    return endText
  }
  return dayjs(endText)
}

function formatString(endText: any, format: FormatType | undefined): string {
  const d = toDayjsInstance(endText)
  if (typeof format === 'function') {
    return format(d)
  }
  return d.format(format)
}
/**
 * 格式化区域日期,如果是一个数组，会返回 start ~ end
 * @param  {any} value
 * @param  {FormatType | FormatType[]} format
 * returns string
 */
export function dateArrayFormatter(
  value: any[],
  format:
    | FormatType
    | FormatType[]
    | {
      format: string
      type?: 'mask'
    },
): string {
  const [startText, endText] = Array.isArray(value) ? value : []

  let formatFirst: FormatType | undefined
  let formatEnd: FormatType | undefined

  if (Array.isArray(format)) {
    formatFirst = format[0]
    formatEnd = format[1]
  }
  else if (typeof format === 'object' && format.type === 'mask') {
    formatFirst = format.format
    formatEnd = format.format
  }
  else {
    formatFirst = format as FormatType
    formatEnd = format as FormatType
  }

  const parsedStartText: string = startText
    ? formatString(startText, formatFirst)
    : ''
  const parsedEndText: string = endText ? formatString(endText, formatEnd) : ''
  const valueStr: string
    = parsedStartText && parsedEndText
      ? `${parsedStartText} ~ ${parsedEndText}`
      : ''

  return valueStr
}
