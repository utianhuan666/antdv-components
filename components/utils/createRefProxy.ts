import type { Ref } from 'vue'

export function createRefProxy<T extends object, E extends object = Record<string, never>>(
  targetRef: Readonly<Ref<T | null | undefined>>,
  extra?: E,
): T & E {
  const base = (extra ?? {}) as T & E

  return new Proxy(base, {
    get(target, key: string | symbol) {
      if (Reflect.has(target, key))
        return Reflect.get(target, key)
      return targetRef.value?.[key as keyof T]
    },
    has(target, key: string | symbol) {
      return Reflect.has(target, key) || (!!targetRef.value && key in targetRef.value)
    },
  }) as T & E
}
