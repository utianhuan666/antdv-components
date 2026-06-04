import type { PropType, VNodeChild } from 'vue'
import type { CommonFormProps } from '../../typing'
import { Drawer } from 'antdv-next'
import { defineComponent, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'
import { useOverlayForm } from '../_shared/useOverlayForm'

export interface DrawerFormProps<T = Record<string, any>, U = Record<string, any>> extends CommonFormProps<T, U> {
  submitTimeout?: number
  trigger?: VNodeChild
  open?: boolean
  onOpenChange?: (open: boolean) => void
  drawerProps?: Record<string, any>
  title?: VNodeChild
  width?: string | number
  resize?: boolean | Record<string, any>
}

const DrawerForm = defineComponent({
  name: 'DrawerForm',
  inheritAttrs: false,
  props: {
    submitTimeout: { type: Number, default: undefined },
    trigger: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    open: { type: Boolean, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    drawerProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    title: { type: null as unknown as PropType<VNodeChild>, default: undefined },
    width: { type: [String, Number] as PropType<string | number>, default: undefined },
    resize: { type: [Boolean, Object] as PropType<DrawerFormProps['resize']>, default: false },
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
      destroyOnHidden: props.drawerProps?.destroyOnHidden,
      submitTimeout: props.submitTimeout,
      onFinish: props.onFinish as any,
      onCloseExtra: props.drawerProps?.onClose,
      submitter: props.submitter,
      searchConfig: {
        submitText: String(props.drawerProps?.okText ?? '确认'),
        resetText: String(props.drawerProps?.cancelText ?? '取消'),
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
      const drawerProps = props.drawerProps || {}
      const footer = props.submitter === false
        ? null
        : <div ref={overlay.setFooterRef} style={{ display: 'flex', justifyContent: 'flex-end' }} />

      return (
        <>
          <Drawer
            title={props.title as any}
            size={(props.width || 800) as any}
            {...drawerProps}
            open={overlay.open.value}
            footer={footer}
            onClose={(event: any) => {
              if (props.submitTimeout && overlay.loading.value)
                return
              overlay.setOpen(false)
              drawerProps.onClose?.(event)
            }}
            afterOpenChange={(nextOpen: boolean) => {
              if (!nextOpen && drawerProps.destroyOnHidden)
                overlay.resetFields()
              drawerProps.afterOpenChange?.(nextOpen)
            }}
          >
            <BaseForm
              ref={baseRef}
              formComponentType="DrawerForm"
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
          </Drawer>
          {overlay.renderTrigger()}
        </>
      )
    }
  },
})

export default DrawerForm
export { DrawerForm }
