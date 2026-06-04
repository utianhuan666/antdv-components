import type { ComponentPublicInstance, Ref, VNodeChild } from 'vue'
import type { CommonFormProps, FormData, FormRefLike, SubmitterProps } from '../../typing'
import { cloneVNode, computed, h, isVNode, nextTick, ref, shallowRef, Teleport } from 'vue'

type OverlayCloseHandler = {
  bivarianceHack: (event?: MouseEvent | KeyboardEvent | Event) => void
}['bivarianceHack']

export interface OverlayFormOptions<T = FormData> {
  propsOpen?: boolean
  onOpenChange?: (open: boolean) => void
  emitOpenChange?: (open: boolean) => void
  formRef: Ref<FormRefLike | undefined>
  destroyOnHidden?: boolean
  submitTimeout?: number
  onFinish?: (values: T) => Promise<boolean | void> | boolean | void
  onCloseExtra?: OverlayCloseHandler
  submitter?: CommonFormProps['submitter']
  searchConfig: {
    submitText: string
    resetText: string
  }
  trigger?: VNodeChild
}

function isControlled(open: boolean | undefined) {
  return open !== undefined
}

export function useOverlayForm<T = FormData>(options: OverlayFormOptions<T>) {
  const innerOpen = ref(false)
  const loading = ref(false)
  const footerRef = shallowRef<HTMLElement>()

  const open = computed(() => isControlled(options.propsOpen) ? options.propsOpen! : innerOpen.value)

  function notifyOpenChange(nextOpen: boolean) {
    options.onOpenChange?.(nextOpen)
    options.emitOpenChange?.(nextOpen)
  }

  function setOpen(nextOpen: boolean) {
    if (!isControlled(options.propsOpen))
      innerOpen.value = nextOpen
    queueMicrotask(() => notifyOpenChange(nextOpen))
  }

  function resetFields() {
    if (options.destroyOnHidden)
      options.formRef.value?.reset?.()
  }

  function renderTrigger() {
    const trigger = options.trigger
    if (!trigger)
      return null

    const onClick = (event: MouseEvent) => {
      setOpen(!open.value)
      if (isVNode(trigger)) {
        const triggerProps = trigger.props as { onClick?: (event: MouseEvent) => void } | null
        triggerProps?.onClick?.(event)
      }
    }

    return isVNode(trigger)
      ? cloneVNode(trigger, { onClick })
      : h('span', { onClick }, trigger)
  }

  const submitterConfig = computed<CommonFormProps['submitter']>(() => {
    if (options.submitter === false)
      return false

    const submitter = (options.submitter || {}) as SubmitterProps
    return {
      ...submitter,
      searchConfig: {
        ...submitter.searchConfig,
        submitText: submitter.searchConfig?.submitText ?? options.searchConfig.submitText,
        resetText: submitter.searchConfig?.resetText ?? options.searchConfig.resetText,
      },
      resetButtonProps: {
        ...(typeof submitter.resetButtonProps === 'object' ? submitter.resetButtonProps : {}),
        preventDefault: true,
        disabled: options.submitTimeout ? loading.value : (typeof submitter.resetButtonProps === 'object' ? submitter.resetButtonProps.disabled : undefined),
        onClick: (event: MouseEvent) => {
          setOpen(false)
          options.onCloseExtra?.(event)
          if (typeof submitter.resetButtonProps === 'object')
            submitter.resetButtonProps.onClick?.(event)
        },
      },
    }
  })

  function renderContent(formDom: VNodeChild, submitterDom: VNodeChild) {
    return (
      <>
        {formDom}
        {footerRef.value && submitterDom
          ? <Teleport to={footerRef.value}>{submitterDom}</Teleport>
          : submitterDom}
      </>
    )
  }

  async function onFinishHandle(values: T) {
    const response = options.onFinish?.(values)

    if (options.submitTimeout) {
      loading.value = true
      const timer = window.setTimeout(() => {
        loading.value = false
      }, options.submitTimeout)
      try {
        const result = await response
        window.clearTimeout(timer)
        loading.value = false
        if (result)
          setOpen(false)
        return result
      }
      catch (error) {
        window.clearTimeout(timer)
        loading.value = false
        throw error
      }
    }

    const result = await response
    if (result)
      setOpen(false)
    return result
  }

  function setFooterRef(element: Element | ComponentPublicInstance | null) {
    footerRef.value = element instanceof HTMLElement ? element : undefined
    nextTick()
  }

  return {
    open,
    loading,
    footerRef,
    setFooterRef,
    setOpen,
    resetFields,
    renderTrigger,
    submitterConfig,
    renderContent,
    onFinishHandle,
  }
}
