import type { VNodeChild } from 'vue'
import type { ProFormItemProps } from '../index'
import { defineComponent } from 'vue'
import ProFormItem from '../index'

export interface ControlPropsType {
  id: string
  value: any
  onChange: (value: any, ...args: any[]) => void
}

export type WithControlPropsType<T = object> = T & Partial<ControlPropsType>

export interface FormControlInjectProps extends Partial<ControlPropsType> {
  status?: string
  errors?: VNodeChild[]
  warnings?: VNodeChild[]
  [key: string]: any
}

interface FormControlProps {
  valuePropName?: string
  trigger?: string
  name?: string
}

function getControlConfigProps(props: FormControlProps | string = {}) {
  const config = typeof props === 'string' ? { name: props } : props
  return {
    valuePropName: config.valuePropName || 'value',
    trigger: config.trigger || 'onChange',
    name: config.name || '',
  }
}

export function useControlModel(
  { value, onChange }: WithControlPropsType,
  model?: FormControlProps | string[] | FormControlProps[],
): any {
  if (!Array.isArray(model)) {
    const config = getControlConfigProps(model)
    return {
      [config.valuePropName]: value,
      [config.trigger]: (event: any) => {
        onChange?.(event?.target ? event.target[config.valuePropName] : event)
      },
    }
  }

  return model.reduce((acc, item) => {
    const config = getControlConfigProps(item as any)
    const name = config.name || String(item)
    acc[name] = {
      [config.valuePropName]: value?.[name],
      [config.trigger]: (event: any) => {
        onChange?.({
          ...value,
          [name]: event?.target ? event.target[config.valuePropName] : event,
        })
      },
    }
    return acc
  }, {} as Record<string, unknown>)
}

export type FormControlFC<P> = (props: WithControlPropsType<P>) => VNodeChild

export function pickControlProps(props: FormControlInjectProps) {
  return {
    value: props.value,
    onChange: (value: any) => props.onChange?.(value?.target ? value.target.value : value),
  }
}

export function pickControlPropsWithId(props: FormControlInjectProps) {
  const ariaAttrs = ['aria-describedby', 'aria-invalid', 'aria-required'].reduce((acc, key) => {
    if (props[key] !== undefined)
      acc[key] = props[key]
    return acc
  }, {} as Record<string, any>)

  return {
    ...pickControlProps(props),
    id: props.id,
    ...ariaAttrs,
  }
}

export const FormControlRender = defineComponent({
  name: 'FormControlRender',
  inheritAttrs: false,
  setup(props: WithControlPropsType<{ children?: (props: FormControlInjectProps) => VNodeChild }>, { attrs, slots }) {
    return () => {
      const current = { ...attrs, ...props } as FormControlInjectProps
      const render = slots.default || props.children
      return render?.({
        status: current.status,
        errors: current.errors || [],
        warnings: current.warnings || [],
        ...current,
      }) as any
    }
  },
}) as any

export function withFormItemRender<T>(Comp: T) {
  return defineComponent({
    name: 'WithFormItemRender',
    inheritAttrs: false,
    setup(props: ProFormItemProps, { attrs, slots }) {
      const AnyComp = Comp as any
      return () => (
        <AnyComp {...attrs} {...props}>
          {{
            default: (controlProps: FormControlInjectProps) => (
              <FormControlRender {...controlProps}>
                {slots.default as any}
              </FormControlRender>
            ),
          }}
        </AnyComp>
      )
    },
  }) as any
}

export const FormItemRender = withFormItemRender(ProFormItem)
export const ProFormItemRender = withFormItemRender(ProFormItem)
