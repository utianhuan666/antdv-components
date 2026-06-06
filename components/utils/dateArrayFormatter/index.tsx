import dayjs from 'dayjs'

type FormatType = ((dayjs: any) => string) | string

function toDayjsInstance(value: any) {
  if (dayjs.isDayjs(value))
    return value
  if (value != null && typeof value.format === 'function' && typeof value.isValid === 'function')
    return value
  return dayjs(value)
}

function formatString(value: any, format: FormatType | undefined): string {
  const d = toDayjsInstance(value)
  if (typeof format === 'function')
    return format(d)
  return d.format(format)
}

export function dateArrayFormatter(value: any[], format: FormatType | FormatType[] | { format: string, type?: 'mask' }): string {
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

  const parsedStartText = startText ? formatString(startText, formatFirst) : ''
  const parsedEndText = endText ? formatString(endText, formatEnd) : ''
  return parsedStartText && parsedEndText ? `${parsedStartText} ~ ${parsedEndText}` : ''
}
