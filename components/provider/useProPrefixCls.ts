import type { ComputedRef, MaybeRef } from 'vue'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, unref } from 'vue'

export function useProPrefixCls(
  componentName = 'pro',
  customizePrefixCls?: MaybeRef<string | undefined>,
): ComputedRef<string> {
  const config = useConfig()

  return computed(() => {
    const customPrefixCls = unref(customizePrefixCls)
    return customPrefixCls || config.value.getPrefixCls(componentName)
  })
}
