import dayjs from 'dayjs'

/**
 * Format a date value using dayjs.
 * If text is falsy, returns '-'.
 * Supports string format or a function formatter.
 * If format is an array (e.g. RangePicker), uses the first entry.
 */
export function formatDate(text: any, format: any): string {
  if (!text)
    return '-'
  if (typeof format === 'function') {
    return format(dayjs(text))
  }
  return dayjs(text).format(
    (Array.isArray(format) ? format[0] : format) || 'YYYY-MM-DD',
  )
}
