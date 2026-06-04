import type { PropType, VNodeChild } from 'vue'
import type { CommonFormProps } from '../../typing'
import { Modal } from 'antdv-next'
import { defineComponent, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'
import { useOverlayForm } from '../_shared/useOverlayForm'

export interface ModalFormProps<T = Record<string, any>, U = Record<string, any>> extends CommonFormProps<T, U> {
  submitTimeout?: number
  trigger?: VNodeChild
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modalProps?: Record<string, any>
  title?: VNodeChild
  width?: string | number
}

const ModalForm = defineComponent({
  name: 'ModalForm',
  inheritAttrs: false,
  props: {
    submitTimeout: { type: Number, default: undefined },
    trigger: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    open: { type: Boolean, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    modalProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    title: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    width: { type: [String, Number] as PropType<string | number>, default: undefined },
    submitter: { type: [Boolean, Object] as PropType<CommonFormProps['submitter']>, default: () => ({}) },
    onFinish: { type: Function as PropType<CommonFormProps['onFinish']>, default: undefined },
  },
  emits: ['openChange'],
  setup(props, { attrs, slots, emit, expose }) {
    const baseRef = shallowRef<any>()
    const overlay = useOverlayForm({
      propsOpen: props.open,
      onOpenChange: props.onOpenChange,
      emitOpenChange: (open: boolean) => emit('openChange', open),
      formRef: baseRef,
      destroyOnHidden: props.modalProps?.destroyOnHidden,
      submitTimeout: props.submitTimeout,
      onFinish: props.onFinish as any,
      onCloseExtra: props.modalProps?.onCancel,
      submitter: props.submitter,
      searchConfig: {
        submitText: String(props.modalProps?.okText ?? '确认'),
        resetText: String(props.modalProps?.cancelText ?? '取消'),
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
      setFieldsValue: (values: Record<string, any>) => baseRef.value?.setFieldsValue?.(values),
    })

    return () => {
      const modalProps = props.modalProps || {}
      const footer = props.submitter === false
        ? null
        : <div ref={overlay.setFooterRef} style={{ display: 'flex', justifyContent: 'flex-end' }} />

      return (
        <>
          <Modal
            title={props.title as any}
            width={props.width || 800}
            {...modalProps}
            open={overlay.open.value}
            footer={footer}
            onCancel={(event: any) => {
              if (props.submitTimeout && overlay.loading.value)
                return
              overlay.setOpen(false)
              modalProps.onCancel?.(event)
            }}
            afterClose={() => {
              if (modalProps.destroyOnHidden)
                overlay.resetFields()
              if (overlay.open.value)
                overlay.setOpen(false)
              modalProps.afterClose?.()
            }}
          >
            <BaseForm
              ref={baseRef}
              formComponentType="ModalForm"
              layout="vertical"
              {...attrs}
              submitter={overlay.submitterConfig.value}
              onFinish={overlay.onFinishHandle as any}
              contentRender={(items, submitter) => overlay.renderContent(items, submitter)}
            >
              {{
                default: () => slots.default?.(),
                submitter: slots.submitter
                  ? (slotProps: Record<string, any>) => slots.submitter?.(slotProps)
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

export default ModalForm
export { ModalForm }
