import type { DrawerProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProFormInstance } from '../../BaseForm'
import type { ProFormProps } from '../ProForm'
import { clsx, warning as rcWarning } from '@v-c/util'
import { Drawer } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, onBeforeUnmount, ref } from 'vue'
import { isBrowser, omitUndefined } from '../../../utils'
import BaseForm from '../../BaseForm'
import { useOverlayForm } from '../_shared/useOverlayForm'
import { useStyle } from './style'

const { noteOnce } = rcWarning

export interface CustomizeResizeType {
  onResize?: () => void
  maxWidth?: DrawerProps['size']
  minWidth?: DrawerProps['size']
}

export type DrawerFormProps<T = Record<string, any>, U = Record<string, any>>
  = Omit<ProFormProps<T, U>, 'title'> & {
    onFinish?: (formData: T) => Promise<any>
    submitTimeout?: number
    trigger?: VNodeChild
    open?: DrawerProps['open']
    onOpenChange?: (open: boolean) => void
    drawerProps?: Omit<DrawerProps, 'open'>
    title?: DrawerProps['title']
    width?: DrawerProps['size']
    resize?: CustomizeResizeType | boolean
  }

export const DrawerForm = defineComponent<DrawerFormProps>({
  name: 'DrawerForm',
  inheritAttrs: false,
  props: [
    'open',
    'drawerProps',
    'title',
    'width',
    'trigger',
    'onOpenChange',
    'submitTimeout',
    'resize',
    'onFinish',
    'formRef',
    'submitter',
    'onInit',
  ],
  setup(props, { attrs, slots }) {
    noteOnce(
      !(attrs as Record<string, any>).footer || !props.drawerProps?.footer,
      'DrawerForm 是一个 ProForm 的特殊布局，如果想自定义按钮，请使用 submit.render 自定义。',
    )

    const resizeInfo = computed<CustomizeResizeType>(() => {
      const defaultResize: CustomizeResizeType = {
        onResize: () => {},
        maxWidth: isBrowser() ? window.innerWidth * 0.8 : undefined,
        minWidth: 300,
      }
      if (typeof props.resize === 'boolean')
        return props.resize ? defaultResize : {}
      return omitUndefined({
        onResize: props.resize?.onResize ?? defaultResize.onResize,
        maxWidth: props.resize?.maxWidth ?? defaultResize.maxWidth,
        minWidth: props.resize?.minWidth ?? defaultResize.minWidth,
      }) || {}
    })

    const config = useConfig()
    const baseClassName = computed(() => config.value.getPrefixCls('pro-form-drawer'))
    const { wrapSSR, hashId } = useStyle(baseClassName.value)
    const getCls = (className: string) => `${baseClassName.value}-${className}`

    const drawerWidth = ref<DrawerProps['size']>(
      props.width ? props.width : props.resize ? resizeInfo.value?.minWidth : 800,
    )

    const formRef = ref<ProFormInstance>()

    const {
      open,
      setOpen,
      loading,
      footerDomRef,
      triggerDom,
      submitterConfig,
      contentRender,
      onFinishHandle,
      resetFields,
    } = useOverlayForm<any>({
      propsOpen: props.open,
      onOpenChange: props.onOpenChange,
      formRef,
      propsFormRef: props.formRef,
      destroyOnHidden: props.drawerProps?.destroyOnHidden,
      submitTimeout: props.submitTimeout,
      onFinish: props.onFinish,
      onCloseExtra: props.drawerProps?.onClose,
      submitter: props.submitter,
      searchConfig: {
        submitText: config.value.locale?.Modal?.okText ?? '确认',
        resetText: config.value.locale?.Modal?.cancelText ?? '取消',
      },
      trigger: props.trigger,
    })

    const cbHandleMouseMove = (e: MouseEvent) => {
      const offsetRight
        = (document.body.offsetWidth || 1000)
          - (e.clientX - document.body.offsetLeft)
      const minWidth = resizeInfo.value?.minWidth ?? (props.width || 800)
      const maxWidth = resizeInfo.value?.maxWidth ?? window.innerWidth * 0.8

      if (offsetRight < (minWidth as number)) {
        drawerWidth.value = minWidth
        return
      }
      if (offsetRight > (maxWidth as number)) {
        drawerWidth.value = maxWidth
        return
      }
      drawerWidth.value = offsetRight
    }

    const cbHandleMouseUp = () => {
      document.removeEventListener('mousemove', cbHandleMouseMove)
      document.removeEventListener('mouseup', cbHandleMouseUp)
    }

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', cbHandleMouseMove)
      document.removeEventListener('mouseup', cbHandleMouseUp)
    })

    return () => {
      const rest = attrs as Omit<ProFormProps, 'title'>

      return wrapSSR(
        <>
          <Drawer
            {...props.drawerProps as any}
            destroyOnHidden={props.drawerProps?.destroyOnHidden}
            title={props.title as any}
            size={typeof drawerWidth.value === 'number' ? drawerWidth.value : drawerWidth.value as any}
            open={open.value}
            afterOpenChange={(nextOpen: boolean) => {
              if (!nextOpen && props.drawerProps?.destroyOnHidden)
                resetFields()
              props.drawerProps?.afterOpenChange?.(nextOpen)
            }}
            onClose={(e: any) => {
              if (props.submitTimeout && loading.value)
                return
              setOpen(false)
              props.drawerProps?.onClose?.(e)
            }}
            footer={
              rest.submitter !== false
                ? (
                    <div
                      ref={footerDomRef}
                      style={{ display: 'flex', justifyContent: 'flex-end' }}
                    />
                  )
                : null
            }
          >
            {props.resize
              ? (
                  <div
                    class={clsx(getCls('sidebar-dragger'), hashId, {
                      [getCls('sidebar-dragger-min-disabled')]:
                        drawerWidth.value === resizeInfo.value?.minWidth,
                      [getCls('sidebar-dragger-max-disabled')]:
                        drawerWidth.value === resizeInfo.value?.maxWidth,
                    })}
                    onMousedown={(e: MouseEvent) => {
                      resizeInfo.value?.onResize?.()
                      e.stopPropagation()
                      e.preventDefault()
                      document.addEventListener('mousemove', cbHandleMouseMove)
                      document.addEventListener('mouseup', cbHandleMouseUp)
                    }}
                  />
                )
              : null}
            <BaseForm
              formComponentType="DrawerForm"
              layout="vertical"
              {...rest as any}
              formRef={formRef}
              onInit={(_: Record<string, any>, form: ProFormInstance) => {
                if (props.formRef) {
                  ;(props.formRef as { current?: ProFormInstance }).current = form
                }
                props.onInit?.(_, form as any)
                formRef.value = form
              }}
              submitter={submitterConfig.value}
              onFinish={async (values: Record<string, any>) => {
                return onFinishHandle(values)
              }}
              contentRender={contentRender}
            >
              {slots.default?.()}
            </BaseForm>
          </Drawer>
          {triggerDom.value}
        </>,
      )
    }
  },
})

export default DrawerForm
