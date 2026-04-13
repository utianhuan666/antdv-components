import type { ProFieldValueEnumType } from './types'

/**
 * Convert valueEnum (Map or Object) to a Map instance.
 */
export function objectToMap(value: ProFieldValueEnumType): Map<any, any> {
  if (value instanceof Map) {
    return value
  }
  return new Map(Object.entries(value || {}))
}

/**
 * Parse text against valueEnum to resolve display labels.
 * Supports arrays (joined by comma), status badges, and plain text fallback.
 */
export function proFieldParsingText(
  text: string | number | (string | number)[],
  valueEnumParams: ProFieldValueEnumType,
): any {
  if (Array.isArray(text)) {
    return text.map(value => proFieldParsingText(value, valueEnumParams)).join(', ')
  }

  const valueEnum = objectToMap(valueEnumParams)

  if (!valueEnum.has(text) && !valueEnum.has(`${text}`)) {
    return (text as any)?.label || text
  }

  const domText = valueEnum.get(text) || valueEnum.get(`${text}`)

  if (!domText) {
    return (text as any)?.label || text
  }

  // If domText is an object with text property, use it
  if (typeof domText === 'object' && domText !== null) {
    return domText.text || domText.label || domText
  }

  return domText
}

/**
 * Convert valueEnum Map/Object to an options array for Select.
 */
export function proFieldParsingValueEnumToArray(
  valueEnumParams: ProFieldValueEnumType,
): { label: string, value: any, text?: string, disabled?: boolean }[] {
  const enumArray: { label: string, value: any, text?: string, disabled?: boolean }[] = []
  const valueEnum = objectToMap(valueEnumParams)

  valueEnum.forEach((_, key) => {
    const value = valueEnum.get(key) || valueEnum.get(`${key}`)

    if (value == null)
      return

    if (typeof value === 'object' && value?.text) {
      enumArray.push({
        text: value.text,
        value: key,
        label: value.text,
        disabled: value.disabled,
      })
      return
    }

    enumArray.push({
      text: value as unknown as string,
      value: key,
      label: value as unknown as string,
    })
  })

  return enumArray
}
