import type { DrawerProps, FormProps } from 'antdv-next'
import type { FunctionalComponent, VNodeChild } from 'vue'
import type { CommonFormProps, FormData, FormRefLike } from '../../typing'
import { Drawer } from 'antdv-next'
import { defineComponent, shallowRef } from 'vue'
import { BaseForm } from '../../BaseForm'
import { useOverlayForm } from '../_shared/useOverlayForm'

export interface CustomizeResizeType {
  onResize?: () => void
  maxWidth?: DrawerProps['size']
  minWidth?: DrawerProps['size']
}

type DrawerFormDrawerProps = Omit<DrawerProps, 'open'> & {
  okText?: VNodeChild
  cancelText?: VNodeChild
}

export type DrawerFormProps<T = FormData, U = FormData> = Omit<FormProps, 'onFinish' | 'title'> & CommonFormProps<T, U> & {
  onFinish?: (formData: T) => Promise<boolean | void> | boolean | void
  submitTimeout?: number
  trigger?: VNodeChild
  open?: DrawerProps['open']
  onOpenChange?: (open: boolean) => void
  drawerProps?: DrawerFormDrawerProps
  title?: DrawerProps['title']
  width?: DrawerProps['size']
  resize?: CustomizeResizeType | boolean
}

const drawerFormPropNames = [
  'submitTimeout',
  'trigger',
  'open',
  'onOpenChange',
  'drawerProps',
  'title',
  'width',
  'resize',
  'submitter',
  'onFinish',
] as const

function resolveBoolean(value: unknown, fallback?: boolean) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

const DrawerFormImpl = defineComponent({
  name: 'DrawerForm',
  inheritAttrs: false,
  props: [...drawerFormPropNames],
  emits: ['openChange'],
  setup(rawProps, { attrs, slots, emit, expose }) {
    const props = rawProps as Readonly<DrawerFormProps>
    const baseRef = shallowRef<FormRefLike>()
    const drawerProps = () => props.drawerProps || {}
    const submitter = () => props.submitter ?? {}
    const onFinish = (values: FormData): Promise<boolean | void> | boolean | void => {
      const handler = props.onFinish ?? (attrs.onFinish as DrawerFormProps['onFinish'] | undefined)
      return handler?.(values)
    }
    const overlay = useOverlayForm<FormData>({
      propsOpen: resolveBoolean(props.open),
      onOpenChange: props.onOpenChange,
      emitOpenChange: (open: boolean) => emit('openChange', open),
      formRef: baseRef,
      destroyOnHidden: drawerProps().destroyOnHidden,
      submitTimeout: props.submitTimeout,
      onFinish,
      onCloseExtra: event => drawerProps().onClose?.(event as KeyboardEvent | MouseEvent),
      submitter: submitter(),
      searchConfig: {
        submitText: String(drawerProps().okText ?? '确认'),
        resetText: String(drawerProps().cancelText ?? '取消'),
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
      const currentDrawerProps = drawerProps()
      const footer = submitter() === false
        ? null
        : <div ref={overlay.setFooterRef} style={{ display: 'flex', justifyContent: 'flex-end' }} />

      return (
        <>
          <Drawer
            title={props.title}
            size={props.width || 800}
            {...currentDrawerProps}
            open={overlay.open.value}
            footer={footer}
            onClose={(event?: Event | KeyboardEvent | MouseEvent) => {
              if (props.submitTimeout && overlay.loading.value)
                return
              overlay.setOpen(false)
              currentDrawerProps.onClose?.(event as KeyboardEvent | MouseEvent)
            }}
            afterOpenChange={(nextOpen: boolean) => {
              if (!nextOpen && currentDrawerProps.destroyOnHidden)
                overlay.resetFields()
              currentDrawerProps.afterOpenChange?.(nextOpen)
            }}
          >
            <BaseForm
              ref={baseRef}
              formComponentType="DrawerForm"
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
          </Drawer>
          {overlay.renderTrigger()}
        </>
      )
    }
  },
})

const DrawerForm = DrawerFormImpl as unknown as FunctionalComponent<DrawerFormProps>

export default DrawerForm
export { DrawerForm }
