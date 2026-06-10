import type { PropType, VNodeChild } from 'vue'
import type {
  ProFieldFCMode,
  ProFieldFCRenderProps,
  ProRenderFieldPropsType,
} from '../provider'
import type {
  ProFieldRequestData,
  ProFieldTextType,
  ProFieldValueTypeInput,
} from '../utils/typing'

import type {
  ProFieldRenderProps,
} from './types'
import { cloneVNode, computed, defineComponent, isVNode, ref } from 'vue'
import { useProProviderContext } from '../provider'
import { omitUndefined, pickProProps } from '../utils'
import './initDayjs'

// ---------------------------------------------------------------------------
// Render function signatures
// ---------------------------------------------------------------------------

export type ProFieldRenderText = (
  dataValue: ProFieldTextType,
  valueType: ProFieldValueTypeInput,
  props: ProFieldRenderProps,
  valueTypeMap: Record<string, ProRenderFieldPropsType>,
) => JSX.Element | VNodeChild | null

/** Separate render functions for read / edit modes. */
export interface ProFieldDualRender {
  renderRead: ProFieldRenderText
  renderEdit: ProFieldRenderText
}

export function isProFieldDualRender(
  input: ProFieldRenderText | ProFieldDualRender,
): input is ProFieldDualRender {
  return (
    typeof input === 'object'
    && input !== null
    && 'renderRead' in input
    && 'renderEdit' in input
  )
}

// ---------------------------------------------------------------------------
// Factory options
// ---------------------------------------------------------------------------

export interface CreateProFieldOptions {
  /**
   * When true, if the current valueType is registered in
   * ProConfigProvider.valueTypeMap, the `customValueType` flag is passed to
   * `pickProProps` so that custom-valueType props are not filtered away.
   */
  pickProPropsWithValueTypeMap: boolean
}

interface FieldInstance {
  fetchData?: (keyWord?: string) => unknown
}

interface MergedFieldProps extends Record<string, unknown> {
  value?: unknown
  onChange?: (...args: unknown[]) => void
  placeholder?: string | string[]
}

// ---------------------------------------------------------------------------
// createProField – factory that returns a Vue component
// ---------------------------------------------------------------------------

export function createProField(
  render: ProFieldRenderText | ProFieldDualRender,
  options: CreateProFieldOptions,
) {
  const renderRead = isProFieldDualRender(render) ? render.renderRead : render
  const renderEdit = isProFieldDualRender(render) ? render.renderEdit : render

  const ProFieldComponent = defineComponent({
    name: 'ProFieldCore',
    props: {
      text: {
        type: [String, Number, Boolean, Array, Object] as PropType<ProFieldTextType>,
        default: undefined,
      },
      valueType: {
        type: [String, Object] as PropType<ProFieldValueTypeInput>,
        default: 'text',
      },
      mode: {
        type: String as PropType<ProFieldFCMode>,
        default: 'read',
      },
      readonly: { type: Boolean, default: false },
      value: { type: [String, Number, Boolean, Array, Object] as PropType<any>, default: undefined },
      onChange: { type: Function as PropType<(...args: any[]) => void>, default: undefined },
      fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
      valueEnum: { type: [Map, Object] as PropType<Map<any, any> | Record<string, any>>, default: undefined },
      render: {
        type: Function as PropType<ProRenderFieldPropsType['render']>,
        default: undefined,
      },
      formItemRender: {
        type: Function as PropType<ProRenderFieldPropsType['formItemRender']>,
        default: undefined,
      },
      emptyText: {
        type: [String, Object, Boolean, Number] as PropType<VNodeChild | false>,
        default: '-',
      },
      placeholder: {
        type: [String, Array] as PropType<string | string[]>,
        default: undefined,
      },
      label: {
        type: [String, Number, Object] as PropType<VNodeChild>,
        default: undefined,
      },
      light: { type: Boolean, default: false },
      variant: {
        type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>,
        default: undefined,
      },
      request: { type: Function as PropType<ProFieldRequestData | undefined>, default: undefined },
      open: { type: Boolean, default: undefined },
      onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    },
    setup(props, { attrs, expose }) {
      const context = useProProviderContext()
      const fieldRef = ref<FieldInstance>()

      expose({
        field: fieldRef,
        fetchData: (keyWord?: string) => fieldRef.value?.fetchData?.(keyWord),
      })

      // -- merged fieldProps (value + onChange + user fieldProps) -----------

      const fieldProps = computed<MergedFieldProps | undefined>(() => {
        const restFieldProps = omitUndefined(props.fieldProps ?? {}) as MergedFieldProps | undefined
        if (props.value === undefined && !restFieldProps && !props.onChange)
          return undefined

        const originalOnChange = restFieldProps?.onChange

        return {
          value: props.value,
          ...(restFieldProps ?? {}),
          onChange: (...args: unknown[]) => {
            originalOnChange?.(...args)
            ;(props.onChange as ((...args: unknown[]) => void) | undefined)?.(...args)
          },
        }
      })

      // -- effective mode ---------------------------------------------------

      const effectiveMode = computed<ProFieldFCMode>(() =>
        props.readonly ? 'read' : props.mode,
      )

      // -- customValueType flag (for pickProProps) --------------------------

      const customValueType = computed(() => {
        if (!options.pickProPropsWithValueTypeMap)
          return false
        return Object.keys(context.valueTypeMap || {}).includes(String(props.valueType))
      })

      // -- dataValue: which source to read from depending on *original* mode -

      const dataValue = computed<ProFieldTextType>(() => {
        const mode = props.mode
        if (mode === 'edit' || mode === 'update') {
          return (fieldProps.value?.value ?? props.text ?? '') as ProFieldTextType
        }
        return (props.text ?? fieldProps.value?.value ?? '') as ProFieldTextType
      })

      // -- render -----------------------------------------------------------

      return () => {
        const renderFn
          = effectiveMode.value === 'edit' || effectiveMode.value === 'update'
            ? renderEdit
            : renderRead

        const resolvedValueType = props.valueType || 'text'

        const placeholderValue = props.placeholder ?? fieldProps.value?.placeholder

        const renderProps: ProFieldRenderProps = omitUndefined({
          ref: fieldRef,
          ...attrs,
          mode: effectiveMode.value,
          formItemRender: props.formItemRender
            ? (curText: unknown, innerProps: ProFieldFCRenderProps, dom: VNodeChild) => {
                const { placeholder: _ph, ...restInner } = innerProps
                const newDom = props.formItemRender?.(curText, restInner, dom)
                if (isVNode(newDom)) {
                  return cloneVNode(newDom, {
                    ...fieldProps.value,
                    ...(newDom.props || {}),
                  })
                }
                return newDom
              }
            : undefined,
          render: props.render,
          placeholder: props.formItemRender ? undefined : placeholderValue,
          fieldProps: pickProProps(
            omitUndefined({
              ...fieldProps.value,
              placeholder: props.formItemRender ? undefined : placeholderValue,
            }) || {},
            customValueType.value,
          ),
          valueEnum: props.valueEnum,
          request: props.request,
          emptyText: props.emptyText,
          label: props.label,
          light: props.light ? true : undefined,
          variant: props.variant,
          open: props.open,
          onOpenChange: props.onOpenChange,
        }) as ProFieldRenderProps

        const rendered = renderFn(
          dataValue.value,
          resolvedValueType,
          renderProps,
          (context.valueTypeMap || {}) as any,
        )

        return rendered ?? null
      }
    },
  })

  return ProFieldComponent
}
