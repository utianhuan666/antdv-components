export function isDropdownValueType(valueType: string) {
  return (
    (typeof valueType === 'string' && valueType.startsWith('date') && !valueType.endsWith('Range'))
    || valueType === 'select'
    || valueType === 'time'
  )
}
