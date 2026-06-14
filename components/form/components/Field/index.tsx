import type { ComponentPublicInstance } from 'vue'
import type { ProFieldValueTypeInput, ProSchema } from '../../../utils/typing'
import type { ProFormFieldItemProps, ProFormFieldRuntimeProps } from '../../typing'
import { cloneVNode, defineComponent, ref } from 'vue'
import { PureProField } from '../../../field'
import { runFunction } from '../../../utils'
import { createRefProxy } from '../../../utils/createRefProxy'
import { useEditOrReadOnlyContext } from '../../BaseForm/EditOrReadOnlyContext'
import { proFormFieldPropNames, warpField } from '../FormItem/warpField'

export type ProFormFieldProps<
  T = any,
  FiledProps = Record<string, any>,
> = ProSchema<
  T,
  ProFormFieldRuntimeProps<FiledProps> & {
    mode?: 'edit' | 'read' | 'update'
    isDefaultDom?: boolean
    text?: any
    getFieldProps?: () => Record<string, any>
    getFormItemProps?: () => Record<string, any>
    dependenciesValues?: Record<string, any>
    originDependencies?: Record<string, any>
  },
  any,
  any
>

type BaseProFormFieldRuntimeProps<FiledProps = Record<string, any>> = ProFormFieldRuntimeProps<FiledProps> & {
  autoFocus?: boolean
  debounceTime?: number
  dependenciesValues?: Record<string, any>
  getFieldProps?: () => Record<string, any>
  getFormItemProps?: () => Record<string, any>
  isDefaultDom?: boolean
  light?: boolean
  originDependencies?: Record<string, any>
}

const BaseProFormField = defineComponent<ProFormFieldProps>({
  name: 'BaseProFormField',
  inheritAttrs: false,
  props: proFormFieldPropNames,
  setup(rawProps, { slots, expose }) {
    const modeContext = useEditOrReadOnlyContext()
    const innerRef = ref<ComponentPublicInstance | null>(null)

    expose(createRefProxy<ComponentPublicInstance>(innerRef))

    return () => {
      const props = rawProps as BaseProFormFieldRuntimeProps & {
        onChange?: (...args: any[]) => any
      }
      const {
        fieldProps,
        autoFocus,
        render,
        proFieldProps,
        formItemRender,
        valueType,
        onChange,
        valueEnum,
        params,
        dependenciesValues,
        cacheForSwr = false,
        valuePropName = 'value',
        emptyText,
        placeholder,
        label,
        light,
        variant,
        request,
        debounceTime,
        readonly,
        open,
        onOpenChange,
        children: _children,
        ...restProps
      } = props

      const propsParams = dependenciesValues && (restProps as Record<string, any>).request
        ? {
            ...params,
            ...(dependenciesValues || {}),
          }
        : params

      const memoFieldProps = {
        autoFocus,
        ...(restProps.name !== undefined && fieldProps?.id === undefined ? { id: String(restProps.name) } : {}),
        ...fieldProps,
        onChange: (...restParams: any[]) => {
          fieldProps?.onChange?.(...restParams)
        },
      }

      const children = slots.default?.()
      if (children?.length) {
        const firstChild = children[0]
        if (firstChild && typeof firstChild === 'object') {
          return cloneVNode(firstChild, {
            ref: innerRef,
            ...restProps,
            onChange: (...restParams: any[]) => {
              if (fieldProps?.onChange) {
                fieldProps.onChange(...restParams)
                return
              }
              onChange?.(...restParams)
            },
            ...((firstChild.props as any) || {}),
          })
        }
        return children
      }

      return (
        <PureProField
          ref={innerRef}
          text={(fieldProps as Record<string, any> | undefined)?.[valuePropName]}
          render={render as any}
          formItemRender={formItemRender as any}
          valueType={(valueType ?? 'text') as ProFieldValueTypeInput}
          cacheForSwr={cacheForSwr}
          fieldProps={memoFieldProps}
          valueEnum={runFunction(valueEnum)}
          emptyText={emptyText}
          placeholder={placeholder}
          label={label}
          light={light}
          variant={variant}
          request={request}
          debounceTime={debounceTime}
          readonly={readonly}
          open={open}
          onOpenChange={onOpenChange}
          {...proFieldProps}
          mode={proFieldProps?.mode || modeContext.mode || 'edit'}
          params={propsParams}
        />
      )
    }
  },
})

const ProFormField = warpField(BaseProFormField)

export default ProFormField
