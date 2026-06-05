import type { SearchTransformKeyFn } from '../typing'
import { isNil } from '../isNil'
import { cloneDeep, getValue, isPlainObject, parseDotPath, setValue } from '../path'

export interface DataFormatMapType {
  [key: string]: SearchTransformKeyFn | undefined | DataFormatMapType
}

function filterNilTransforms(
  dataFormatMapRaw: Record<string, SearchTransformKeyFn | undefined | DataFormatMapType>,
): Record<string, SearchTransformKeyFn> {
  const filtered: Record<string, SearchTransformKeyFn> = {}
  for (const key in dataFormatMapRaw) {
    const value = dataFormatMapRaw[key]
    if (!isNil(value))
      filtered[key] = value as SearchTransformKeyFn
  }
  return filtered
}

function separateTransformFormats(
  dataFormatMapRaw: Record<string, SearchTransformKeyFn | undefined | DataFormatMapType>,
) {
  const dotPathTransforms: Record<string, SearchTransformKeyFn> = {}
  const objectTransforms: Record<string, any> = {}
  for (const key in dataFormatMapRaw) {
    const value = dataFormatMapRaw[key]
    if (isNil(value))
      continue
    if (key.includes('.'))
      dotPathTransforms[key] = value as SearchTransformKeyFn
    else
      objectTransforms[key] = value
  }
  return { dotPathTransforms, objectTransforms }
}

function processDotPathTransforms(result: any, dotPathTransforms: Record<string, SearchTransformKeyFn>) {
  Object.keys(dotPathTransforms).forEach((dotPath) => {
    const transform = dotPathTransforms[dotPath]
    if (typeof transform !== 'function')
      return
    const pathArray = parseDotPath(dotPath)
    const currentValue = getValue(result, pathArray)
    if (currentValue === undefined)
      return

    const transformed = transform(currentValue, pathArray.map(String), result)
    if (transformed && typeof transformed === 'object' && !Array.isArray(transformed)) {
      const parentPath = pathArray.slice(0, -1)
      const parentObj = parentPath.length > 0 ? getValue(result, parentPath) : result
      const lastKey = pathArray[pathArray.length - 1]
      if (lastKey === undefined)
        return
      if (Array.isArray(parentObj)) {
        parentObj[lastKey as number] = transformed
      }
      else if (parentObj && typeof parentObj === 'object') {
        delete parentObj[lastKey]
        Object.assign(parentObj, transformed)
      }
    }
    else {
      setValue(result, pathArray, transformed)
    }
  })
}

function findNestedTransformFunction(currentTransforms: any, parentsKey: (string | number)[], entityKey: string): SearchTransformKeyFn | undefined {
  const candidate = getValue(currentTransforms, [...parentsKey.map(String), entityKey])
  return typeof candidate === 'function' ? candidate : undefined
}

function isInArrayPath(rootValues: any, parentsKey: (string | number)[]): boolean {
  let cursor: any = rootValues
  for (const segment of parentsKey) {
    if (Array.isArray(cursor))
      return true
    if (cursor == null || typeof cursor !== 'object')
      return false
    cursor = cursor[segment as keyof typeof cursor]
  }
  return Array.isArray(cursor)
}

function processNestedObjectTransforms(
  currentValues: any,
  parentsKey: (string | number)[] | undefined,
  currentTransforms: any,
  rootLevelMerges: any[],
  rootAllValues: any,
): any {
  const isArrayValues = Array.isArray(currentValues)
  const currentResult: any = isArrayValues ? [] : {}

  if (currentValues == null || currentValues === undefined)
    return currentResult

  const keysToProcess = isArrayValues
    ? currentValues.map((_: unknown, index: number) => index.toString())
    : Object.keys(currentValues)

  for (const entityKey of keysToProcess) {
    const nextParentsKey = parentsKey ? [...parentsKey, entityKey] : [entityKey]
    const itemValue = currentValues[entityKey]
    let transformFunction = currentTransforms[entityKey]

    if (!transformFunction && parentsKey)
      transformFunction = findNestedTransformFunction(currentTransforms, parentsKey, entityKey)

    if (typeof transformFunction === 'function') {
      const namePath = nextParentsKey.map(k => String(k))
      const transformed = transformFunction(itemValue, namePath, rootAllValues)
      if (transformed && typeof transformed === 'object' && !Array.isArray(transformed)) {
        if (parentsKey ? isInArrayPath(rootAllValues, parentsKey) : false)
          Object.assign(currentResult, transformed)
        else
          rootLevelMerges.push(transformed)
      }
      else {
        currentResult[entityKey] = transformed
      }
    }
    else if (isPlainObject(itemValue) && !isNil(itemValue)) {
      const nestedTransforms = currentTransforms[entityKey]
      if (nestedTransforms && typeof nestedTransforms === 'object') {
        const nested = processNestedObjectTransforms(itemValue, nextParentsKey, nestedTransforms, rootLevelMerges, rootAllValues)
        if (Object.keys(nested).length > 0)
          currentResult[entityKey] = nested
      }
      else {
        currentResult[entityKey] = processNestedObjectTransforms(itemValue, nextParentsKey, currentTransforms, rootLevelMerges, rootAllValues)
      }
    }
    else if (!isNil(itemValue)) {
      currentResult[entityKey] = itemValue
    }
  }

  return currentResult
}

export function transformKeySubmitValue<T extends object = any>(values: T, dataFormatMapRaw: Record<string, SearchTransformKeyFn | undefined | DataFormatMapType>): T {
  const dataFormatMap = filterNilTransforms(dataFormatMapRaw)
  if (Object.keys(dataFormatMap).length < 1)
    return values
  if (typeof window === 'undefined')
    return values
  if (typeof values !== 'object' || isNil(values) || values instanceof Blob)
    return values

  let result = cloneDeep(values)
  const { dotPathTransforms, objectTransforms } = separateTransformFormats(dataFormatMapRaw)
  processDotPathTransforms(result, dotPathTransforms)

  const rootLevelMerges: any[] = []
  if (Object.keys(objectTransforms).length > 0)
    result = processNestedObjectTransforms(result, undefined, objectTransforms, rootLevelMerges, result)

  rootLevelMerges.forEach(obj => Object.assign(result, obj))
  return result
}
