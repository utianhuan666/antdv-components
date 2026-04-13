/** Get display symbol by real value */
export function getSymbolByRealValue(realValue: number): string | null {
  if (realValue === 0)
    return null
  if (realValue > 0)
    return '+'
  return '-'
}

/** Get color by real value */
export function getColorByRealValue(realValue: number): string {
  if (realValue === 0)
    return '#595959'
  return realValue > 0 ? '#ff4d4f' : '#52c41a'
}

/** Get the final display number with precision */
export function getRealTextWithPrecision(
  realValue: number,
  precision: number = 2,
): string {
  return precision >= 0 ? realValue?.toFixed(precision) : String(realValue)
}

/** Convert to number */
export function toNumber(value: any): number {
  if (typeof value === 'symbol') {
    return Number.NaN
  }
  return Number(value)
}
