import type { ModalProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProFormInstance } from '../../BaseForm'
import type { ProFormProps } from '../ProForm'
import { warning as rcWarning } from '@v-c/util'
import { Modal } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { defineComponent, ref } from 'vue'
import BaseForm from '../../BaseForm'
import { useOverlayForm } from '../_shared/useOverlayForm'
import { setRefValue } from '../_shared/vueHelpers'

const { noteOnce } = rcWarning

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

type ModalCancelEvent = Parameters<NonNullable<ModalProps['onCancel']>>[0]

export const ModalForm = defineComponent<ModalFormProps>(
  (props, { slots }) => {
    noteOnce(
      !(props as Record<string, unknown>).footer || !props.modalProps?.footer,
      'ModalForm 是一个 ProForm 的特殊布局，如果想自定义按钮，请使用 submit.render 自定义。',
    )

    const config = useConfig()
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
    } = useOverlayForm({
      propsOpen: props.open ?? props.visible,
      onOpenChange: props.onOpenChange,
      formRef,
      propsFormRef: props.formRef,
      destroyOnHidden: props.modalProps?.destroyOnHidden,
      submitTimeout: props.submitTimeout,
      onFinish: props.onFinish,
      onCloseExtra: props.modalProps?.onCancel,
      submitter: props.submitter,
      searchConfig: {
        submitText: String(
          props.modalProps?.okText ?? config.value.locale?.Modal?.okText ?? '确认',
        ),
        resetText: String(
          props.modalProps?.cancelText ?? config.value.locale?.Modal?.cancelText ?? '取消',
        ),
      },
      trigger: props.trigger,
    })

    return () => {
      const {
        trigger: _trigger,
        onOpenChange: _onOpenChange,
        modalProps,
        title,
        width,
        submitTimeout,
        open: _open,
        visible: _visible,
        ...rest
      } = props

      return (
        <>
          <Modal
            title={title}
            width={width || 800}
            {...modalProps}
            open={open.value}
            onCancel={(e: ModalCancelEvent) => {
              if (submitTimeout && loading.value)
                return
              setOpen(false)
              modalProps?.onCancel?.(e)
            }}
            afterClose={() => {
              if (modalProps?.destroyOnHidden)
                resetFields()
              if (open.value)
                setOpen(false)
              modalProps?.afterClose?.()
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
            <BaseForm
              formComponentType="ModalForm"
              layout="vertical"
              {...rest}
              formRef={formRef}
              onInit={(values, form) => {
                setRefValue(props.formRef, form)
                props.onInit?.(values, form)
                formRef.value = form
              }}
              submitter={submitterConfig.value}
              onFinish={async (values) => {
                return onFinishHandle(values)
              }}
              contentRender={contentRender}
            >
              {slots.default?.()}
            </BaseForm>
          </Modal>
          {triggerDom.value}
        </>
      )
    }
  },
  {
    name: 'ModalForm',
    inheritAttrs: false,
  },
)

export default ModalForm
