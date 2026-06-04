import type { FormProps, ModalProps } from 'antdv-next'
import type { FunctionalComponent, VNodeChild } from 'vue'
import type { CommonFormProps, FormData, FormRefLike } from '../../typing'
import { Modal } from 'antdv-next'
import { defineComponent, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'
import { useOverlayForm } from '../_shared/useOverlayForm'

export type ModalFormProps<T = FormData, U = FormData> = Omit<FormProps, 'onFinish' | 'title'> & CommonFormProps<T, U> & {
  onFinish?: (formData: T) => Promise<boolean | void> | boolean | void
  submitTimeout?: number
  trigger?: VNodeChild
  open?: ModalProps['open']
  onOpenChange?: (open: boolean) => void
  modalProps?: Omit<ModalProps, 'open'>
  title?: ModalProps['title']
  width?: ModalProps['width']
}

const modalFormPropNames = [
  'submitTimeout',
  'trigger',
  'open',
  'onOpenChange',
  'modalProps',
  'title',
  'width',
  'submitter',
  'onFinish',
] as const

function resolveBoolean(value: unknown, fallback?: boolean) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

const ModalFormImpl = defineComponent({
  name: 'ModalForm',
  inheritAttrs: false,
  props: [...modalFormPropNames],
  emits: ['openChange'],
  setup(rawProps, { attrs, slots, emit, expose }) {
    const props = rawProps as Readonly<ModalFormProps>
    const baseRef = shallowRef<FormRefLike>()
    const modalProps = () => props.modalProps || {}
    const submitter = () => props.submitter ?? {}
    const onFinish = (values: FormData): Promise<boolean | void> | boolean | void => {
      const handler = props.onFinish ?? (attrs.onFinish as ModalFormProps['onFinish'] | undefined)
      return handler?.(values)
    }
    const overlay = useOverlayForm<FormData>({
      propsOpen: resolveBoolean(props.open),
      onOpenChange: props.onOpenChange,
      emitOpenChange: (open: boolean) => emit('openChange', open),
      formRef: baseRef,
      destroyOnHidden: modalProps().destroyOnHidden,
      submitTimeout: props.submitTimeout,
      onFinish,
      onCloseExtra: event => modalProps().onCancel?.(event as KeyboardEvent | MouseEvent),
      submitter: submitter(),
      searchConfig: {
        submitText: String(modalProps().okText ?? '确认'),
        resetText: String(modalProps().cancelText ?? '取消'),
      },
      trigger: props.trigger,
    })

    expose({
      get formInstance() {
        return baseRef.value?.formInstance
      },
      submit: () => baseRef.value?.submit?.(),
      reset: () => baseRef.value?.reset?.(),
      getFieldsValue: () => baseRef.value?.getFieldsValue?.(),
      setFieldsValue: (values: FormData) => baseRef.value?.setFieldsValue?.(values),
    })

    return () => {
      const currentModalProps = modalProps()
      const footer = submitter() === false
        ? null
        : <div ref={overlay.setFooterRef} style={{ display: 'flex', justifyContent: 'flex-end' }} />

      return (
        <>
          <Modal
            title={props.title}
            width={props.width || 800}
            {...currentModalProps}
            open={overlay.open.value}
            footer={footer}
            onCancel={(event?: Event | KeyboardEvent | MouseEvent) => {
              if (props.submitTimeout && overlay.loading.value)
                return
              overlay.setOpen(false)
              currentModalProps.onCancel?.(event as KeyboardEvent | MouseEvent)
            }}
            afterClose={() => {
              if (currentModalProps.destroyOnHidden)
                overlay.resetFields()
              if (overlay.open.value)
                overlay.setOpen(false)
              currentModalProps.afterClose?.()
            }}
          >
            <BaseForm
              ref={baseRef}
              formComponentType="ModalForm"
              layout="vertical"
              {...attrs}
              submitter={overlay.submitterConfig.value}
              onFinish={overlay.onFinishHandle}
              contentRender={(items, submitter) => overlay.renderContent(items, submitter)}
            >
              {{
                default: () => slots.default?.(),
                submitter: slots.submitter
                  ? (slotProps: FormData) => slots.submitter?.(slotProps)
                  : undefined,
              }}
            </BaseForm>
          </Modal>
          {overlay.renderTrigger()}
        </>
      )
    }
  },
})

const ModalForm = ModalFormImpl as unknown as FunctionalComponent<ModalFormProps>

export default ModalForm
export { ModalForm }
