import type { DrawerProps } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { OverlayFormOptions } from '../_shared/useOverlayForm'
import type { ProFormProps } from '../ProForm'
import { clsx } from '@v-c/util'
import { Drawer } from 'antdv-next'
import { defineComponent, onBeforeUnmount, ref, shallowReactive } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { omitUndefined } from '../../../utils'
import BaseForm from '../../BaseForm'
import { useOverlayForm } from '../_shared/useOverlayForm'
import { useStyle } from './style'

export interface CustomizeResizeType {
  onResize?: () => void
  maxWidth?: DrawerProps['size']
  minWidth?: DrawerProps['size']
}

export type DrawerFormProps<T = Record<string, any>, U = Record<string, any>>
  = Omit<ProFormProps<T, U>, 'title'> & {
    trigger?: VNodeChild
    open?: DrawerProps['open']
    visible?: DrawerProps['open']
    onOpenChange?: (open: boolean) => void
    drawerProps?: Omit<DrawerProps, 'open'>
    title?: DrawerProps['title']
    width?: DrawerProps['size']
    submitTimeout?: number
    resize?: CustomizeResizeType | boolean
  }

function getResizeInfo(resize: CustomizeResizeType | boolean | undefined): CustomizeResizeType {
  const defaultResize: CustomizeResizeType = {
    onResize: () => {},
    maxWidth: typeof window === 'undefined' ? undefined : window.innerWidth * 0.8,
    minWidth: 300,
  }
  if (typeof resize === 'boolean')
    return resize ? defaultResize : {}
  return omitUndefined({
    onResize: resize?.onResize ?? defaultResize.onResize,
    maxWidth: resize?.maxWidth ?? defaultResize.maxWidth,
    minWidth: resize?.minWidth ?? defaultResize.minWidth,
  }) || {}
}

export const DrawerForm = defineComponent({
  name: 'DrawerForm',
  inheritAttrs: false,
  props: ['open', 'visible', 'drawerProps', 'title', 'width', 'trigger', 'onOpenChange', 'submitTimeout', 'resize'],
  setup(props, { attrs, slots }) {
    const prefixCls = useProPrefixCls('pro-form-drawer')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const formRef = ref<any>()
    const drawerWidth = ref<DrawerProps['size']>()
    const overlayOptions = shallowReactive<OverlayFormOptions>({
      formRef,
    })
    const overlay = useOverlayForm(overlayOptions)
    let mouseMove: ((event: MouseEvent) => void) | undefined
    let mouseUp: (() => void) | undefined

    onBeforeUnmount(() => {
      if (mouseMove)
        document.removeEventListener('mousemove', mouseMove)
      if (mouseUp)
        document.removeEventListener('mouseup', mouseUp)
    })

    return () => {
      const formProps = attrs as ProFormProps
      const resizeInfo = getResizeInfo(props.resize as any)
      if (drawerWidth.value === undefined)
        drawerWidth.value = props.width || (props.resize ? resizeInfo.minWidth : 800)

      Object.assign(overlayOptions, {
        propsOpen: props.open,
        visible: props.visible,
        onOpenChange: props.onOpenChange,
        submitTimeout: props.submitTimeout,
        onFinish: formProps.onFinish,
        submitter: formProps.submitter,
        searchConfig: {
          submitText: '确认',
          resetText: '取消',
        },
        trigger: props.trigger,
      })

      const startResize = (event: MouseEvent) => {
        resizeInfo.onResize?.()
        event.stopPropagation()
        event.preventDefault()
        mouseMove = (moveEvent: MouseEvent) => {
          const offsetRight = (document.body.offsetWidth || 1000) - (moveEvent.clientX - document.body.offsetLeft)
          const minWidth = (resizeInfo.minWidth ?? props.width ?? 800) as number
          const maxWidth = (resizeInfo.maxWidth ?? window.innerWidth * 0.8) as number
          drawerWidth.value = Math.max(minWidth, Math.min(maxWidth, offsetRight))
        }
        mouseUp = () => {
          if (mouseMove)
            document.removeEventListener('mousemove', mouseMove)
          if (mouseUp)
            document.removeEventListener('mouseup', mouseUp)
        }
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
      }

      return wrapSSR(
        <>
          {overlay.triggerDom.value}
          <Drawer
            {...props.drawerProps as any}
            open={overlay.open.value}
            title={props.title as any}
            size={drawerWidth.value}
            onClose={(event: any) => {
              if (props.submitTimeout && overlay.loading.value)
                return
              overlay.setOpen(false)
              ;(props.drawerProps as any)?.onClose?.(event)
            }}
            afterOpenChange={(nextOpen: boolean) => {
              if (!nextOpen && (props.drawerProps as any)?.destroyOnHidden)
                overlay.resetFields()
              ;(props.drawerProps as any)?.afterOpenChange?.(nextOpen)
            }}
            footer={formProps.submitter !== false ? overlay.footerDom() : null}
          >
            {props.resize
              ? (
                  <div
                    class={clsx(`${prefixCls.value}-sidebar-dragger`, {
                      [`${prefixCls.value}-sidebar-dragger-min-disabled`]: drawerWidth.value === resizeInfo.minWidth,
                      [`${prefixCls.value}-sidebar-dragger-max-disabled`]: drawerWidth.value === resizeInfo.maxWidth,
                    }, hashId)}
                    style={{ position: 'absolute', insetBlock: 0, insetInlineStart: 0, width: 4, cursor: 'ew-resize' } as CSSProperties}
                    onMousedown={startResize}
                  />
                )
              : null}
            <BaseForm
              {...formProps as any}
              formRef={formRef}
              layout="vertical"
              formComponentType="DrawerForm"
              submitter={overlay.submitterConfig.value}
              onFinish={(values: Record<string, any>) => overlay.onFinishHandle(values)}
              contentRender={overlay.contentRender}
            >
              {slots.default?.()}
            </BaseForm>
          </Drawer>
        </>,
      )
    }
  },
})

export default DrawerForm
