import type { ComponentPublicInstance, Ref, VNode, VNodeChild } from 'vue'
import type { CommonFormProps, ProFormInstance } from '../../BaseForm'
import type { SubmitterProps } from '../../BaseForm/Submitter'
import { cloneVNode, computed, h, isVNode, ref, Teleport, watch } from 'vue'
import { merge } from '../../../utils'
import { setRefValue } from './vueHelpers'

export interface OverlayFormSearchConfig {
  submitText: string
  resetText: string
}

export interface UseOverlayFormOptions<T> {
  propsOpen?: boolean
  visible?: boolean
  onOpenChange?: (open: boolean) => void
  formRef: Ref<ProFormInstance | undefined>
  propsFormRef?: CommonFormProps<T>['formRef']
  destroyOnHidden?: boolean
  submitTimeout?: number
  onFinish?: (values: T) => Promise<any> | any
  onCloseExtra?: (e: any) => void
  submitter?: CommonFormProps['submitter']
  searchConfig?: OverlayFormSearchConfig
  trigger?: VNodeChild
}

export interface UseOverlayFormResult<T> {
  open: Ref<boolean>
  setOpen: (updater: boolean | ((prev: boolean) => boolean)) => void
  loading: Ref<boolean>
  footerDomRef: (
    element: Element | ComponentPublicInstance | null,
    refs?: Record<string, any>,
  ) => void
  footerRef: Ref<HTMLDivElement | null>
  triggerDom: Ref<VNode | null>
  submitterConfig: Ref<CommonFormProps['submitter']>
  contentRender: (formDom: any, submitterDom: any) => VNodeChild
  onFinishHandle: (values: T) => Promise<any>
  resetFields: () => void
}

export function useOverlayForm<T = Record<string, any>>({
  propsOpen,
  visible,
  onOpenChange,
  formRef,
  propsFormRef,
  destroyOnHidden,
  submitTimeout,
  onFinish,
  onCloseExtra,
  submitter,
  searchConfig,
  trigger,
}: UseOverlayFormOptions<T>): UseOverlayFormResult<T> {
  const innerOpen = ref(false)
  const loading = ref(false)
  const footerRef = ref<HTMLDivElement | null>(null)

  const open = computed(() => (propsOpen ?? visible) ?? innerOpen.value)

  const onOpenChangeCallback = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen)
  }

  const setOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
    const prev = open.value
    const next
      = typeof updater === 'function'
        ? (updater as (prev: boolean) => boolean)(prev)
        : updater

    if (propsOpen === undefined && visible === undefined)
      innerOpen.value = next

    queueMicrotask(() => {
      onOpenChangeCallback(next)
    })
  }

  watch(
    () => propsOpen,
    (value) => {
      if (value)
        onOpenChange?.(true)
    },
    { immediate: true },
  )

  const footerDomRef = (element: Element | ComponentPublicInstance | null) => {
    footerRef.value = element instanceof HTMLDivElement ? element : null
  }

  const resetFields = () => {
    const form = formRef.value
    if (form && destroyOnHidden && typeof form.resetFields === 'function')
      form.resetFields()
  }

  watch(
    formRef,
    (form) => {
      setRefValue(propsFormRef as any, form)
    },
    { immediate: true },
  )

  const triggerDom = computed(() => {
    if (!trigger)
      return null

    if (!isVNode(trigger))
      return h('span', { onClick: () => setOpen(!open.value) }, trigger)

    const triggerNode = trigger as VNode
    const originOnClick = (triggerNode.props as Record<string, any> | null)?.onClick

    return cloneVNode(triggerNode, {
      key: 'trigger',
      ...(triggerNode.props || {}),
      onClick: async (e: any) => {
        setOpen(!open.value)
        await originOnClick?.(e)
      },
    }, true)
  })

  const submitterConfig = computed<CommonFormProps['submitter']>(() => {
    if (submitter === false)
      return false

    return merge(
      {
        searchConfig: {
          submitText: searchConfig?.submitText,
          resetText: searchConfig?.resetText,
        },
        resetButtonProps: {
          preventDefault: true,
          disabled: submitTimeout ? loading.value : false,
          onClick: (e: any) => {
            setOpen(false)
            onCloseExtra?.(e)
          },
        },
      } as SubmitterProps,
      submitter ?? {},
    ) as CommonFormProps['submitter']
  })

  const contentRender = (formDom: any, submitterDom: any) => {
    return (
      <>
        {formDom}
        {footerRef.value && submitterDom
          ? (
              <Teleport to={footerRef.value}>
                {submitterDom}
              </Teleport>
            )
          : submitterDom}
      </>
    )
  }

  const onFinishHandle = async (values: T) => {
    const responsePromise = onFinish?.(values)

    if (submitTimeout) {
      loading.value = true
      const timer = setTimeout(() => {
        loading.value = false
      }, submitTimeout)
      try {
        const result = await responsePromise
        clearTimeout(timer)
        loading.value = false
        if (result)
          setOpen(false)
        return result
      }
      catch (error) {
        clearTimeout(timer)
        loading.value = false
        throw error
      }
    }

    const result = await responsePromise
    if (result)
      setOpen(false)
    return result
  }

  return {
    open,
    setOpen,
    loading,
    footerDomRef,
    footerRef,
    triggerDom,
    submitterConfig,
    contentRender,
    onFinishHandle,
    resetFields,
  }
}
