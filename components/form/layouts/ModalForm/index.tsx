import type { ModalProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { OverlayFormOptions } from '../_shared/useOverlayForm'
import type { ProFormProps } from '../ProForm'
import { Modal } from 'antdv-next'
import { defineComponent, ref, shallowReactive } from 'vue'
import BaseForm from '../../BaseForm'
import { useOverlayForm } from '../_shared/useOverlayForm'

export type ModalFormProps<T = Record<string, any>, U = Record<string, any>>
  = Omit<ProFormProps<T, U>, 'title'> & {
    trigger?: VNodeChild
    open?: ModalProps['open']
    visible?: ModalProps['open']
    onOpenChange?: (open: boolean) => void
    modalProps?: Omit<ModalProps, 'open'>
    title?: ModalProps['title']
    width?: ModalProps['width']
    submitTimeout?: number
  }

export const ModalForm = defineComponent({
  name: 'ModalForm',
  inheritAttrs: false,
  props: ['open', 'visible', 'modalProps', 'title', 'width', 'trigger', 'onOpenChange', 'submitTimeout'],
  setup(props, { attrs, slots }) {
    const formRef = ref<any>()
    const overlayOptions = shallowReactive<OverlayFormOptions>({
      formRef,
    })
    const overlay = useOverlayForm(overlayOptions)

    return () => {
      const formProps = attrs as ProFormProps
      Object.assign(overlayOptions, {
        propsOpen: props.open,
        visible: props.visible,
        onOpenChange: props.onOpenChange,
        submitTimeout: props.submitTimeout,
        onFinish: formProps.onFinish,
        submitter: formProps.submitter,
        searchConfig: {
          submitText: String((props.modalProps as any)?.okText ?? '确认'),
          resetText: String((props.modalProps as any)?.cancelText ?? '取消'),
        },
        trigger: props.trigger,
      })

      return (
        <>
          {overlay.triggerDom.value}
          <Modal
            {...props.modalProps as any}
            open={overlay.open.value}
            title={props.title as any}
            width={props.width || 800}
            onCancel={(event: any) => {
              if (props.submitTimeout && overlay.loading.value)
                return
              overlay.setOpen(false)
              ;(props.modalProps as any)?.onCancel?.(event)
            }}
            afterClose={() => {
              if ((props.modalProps as any)?.destroyOnHidden)
                overlay.resetFields()
              ;(props.modalProps as any)?.afterClose?.()
            }}
            footer={formProps.submitter !== false ? overlay.footerDom() : null}
          >
            <BaseForm
              {...formProps as any}
              formRef={formRef}
              layout="vertical"
              formComponentType="ModalForm"
              submitter={overlay.submitterConfig.value}
              onFinish={(values: Record<string, any>) => overlay.onFinishHandle(values)}
              contentRender={overlay.contentRender}
            >
              {slots.default?.()}
            </BaseForm>
          </Modal>
        </>
      )
    }
  },
})

export default ModalForm
