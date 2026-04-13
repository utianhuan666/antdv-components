export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

export function isEmptyOrWhitespace(str?: string): boolean {
  return isNil(str) || str === '' || str?.trim() === ''
}
