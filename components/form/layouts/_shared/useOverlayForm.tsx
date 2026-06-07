import type { Ref, VNodeChild } from 'vue'
import { cloneVNode, computed, h, isVNode, ref, Teleport, watch } from 'vue'

export interface OverlayFormOptions<T = Record<string, any>> {
  propsOpen?: boolean
  visible?: boolean
  onOpenChange?: (open: boolean) => void
  formRef: Ref<any>
  submitTimeout?: number
  onFinish?: (values: T) => Promise<any> | any
  submitter?: any
  searchConfig?: Record<string, any>
  trigger?: VNodeChild
}

export function useOverlayForm<T = Record<string, any>>(options: OverlayFormOptions<T>) {
  const innerOpen = ref(Boolean(options.propsOpen ?? options.visible))
  const loading = ref(false)
  const footerRef = ref<HTMLElement | null>(null)

  const open = computed(() => options.propsOpen ?? options.visible ?? innerOpen.value)
  const setOpen = (nextOpen: boolean) => {
    if (options.propsOpen === undefined && options.visible === undefined)
      innerOpen.value = nextOpen
    options.onOpenChange?.(nextOpen)
  }

  watch(
    () => [options.propsOpen, options.visible],
    ([propsOpen, visible]) => {
      if (propsOpen !== undefined || visible !== undefined)
        innerOpen.value = Boolean(propsOpen ?? visible)
    },
  )

  const resetFields = () => {
    options.formRef.value?.resetFields?.()
  }

  const onFinishHandle = async (values: T) => {
    if (!options.onFinish)
      return undefined
    loading.value = true
    try {
      const result = await options.onFinish(values)
      if (result)
        setOpen(false)
      return result
    }
    finally {
      loading.value = false
    }
  }

  const submitterConfig = computed(() => {
    if (options.submitter === false)
      return false
    return {
      ...options.submitter,
      searchConfig: {
        ...options.searchConfig,
        ...options.submitter?.searchConfig,
      },
    }
  })

  const contentRender = (items: VNodeChild[], submitter: VNodeChild) => (
    <>
      {items}
      {footerRef.value && submitter ? <Teleport to={footerRef.value}>{submitter}</Teleport> : submitter}
    </>
  )

  const triggerDom = computed(() => {
    if (!options.trigger)
      return null
    if (!isVNode(options.trigger))
      return <span onClick={() => setOpen(true)}>{options.trigger}</span>
    const originOnClick = (options.trigger.props as any)?.onClick
    return cloneVNode(options.trigger, {
      onClick: (...args: any[]) => {
        originOnClick?.(...args)
        setOpen(true)
      },
    }, true)
  })

  return {
    open,
    setOpen,
    loading,
    footerRef,
    footerDom: () => h('div', { ref: footerRef, style: { display: 'flex', justifyContent: 'flex-end' } }),
    triggerDom,
    submitterConfig,
    contentRender,
    onFinishHandle,
    resetFields,
  }
}
