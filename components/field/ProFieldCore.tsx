import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from './internal/fieldMode'
import type {
  ProFieldFCRenderProps,
  ProFieldRenderProps,
  ProFieldRequestData,
  ProFieldTextType,
  ProFieldValueTypeInput,
  ProRenderFieldPropsType,
} from './types'
import { computed, defineComponent, ref } from 'vue'
import { useProProviderContext } from '../provider'
import { omitUndefined, pickProProps } from '../utils'

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
      const fieldRef = ref<any>()

      expose({
        field: fieldRef,
        fetchData: (keyWord?: string) => fieldRef.value?.fetchData?.(keyWord),
      })

      // -- merged fieldProps (value + onChange + user fieldProps) -----------

      const fieldProps = computed(() => {
        const userFieldProps = omitUndefined(props.fieldProps ?? {}) || {}

        const merged: Record<string, any> = {
          ...userFieldProps,
        }

        // Always expose value + onChange on fieldProps for v-model support
        if (props.value !== undefined) {
          merged.value = props.value
        }
        // Wrap so both fieldProps.onChange and props.onChange fire
        const originalOnChange = userFieldProps.onChange
        merged.onChange = (...args: any[]) => {
          originalOnChange?.(...args)
          props.onChange?.(...args)
        }
        merged['onUpdate:value'] = (value: any) => {
          userFieldProps['onUpdate:value']?.(value)
          props.onChange?.(value)
        }

        return merged
      })

      // -- effective mode ---------------------------------------------------

      const effectiveMode = computed<ProFieldFCMode>(() =>
        props.readonly ? 'read' : props.mode,
      )

      // -- customValueType flag (for pickProProps) --------------------------

      const customValueType = computed(() => {
        if (!options.pickProPropsWithValueTypeMap)
          return false
        return Object.keys(context.valueTypeMap || {}).includes(
          String(typeof props.valueType === 'object' ? (props.valueType as any).type : props.valueType),
        )
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
            ? (curText: any, innerProps: ProFieldFCRenderProps, dom: JSX.Element) => {
                const { placeholder: _ph, ...restInner } = innerProps
                return props.formItemRender!(curText, restInner as any, dom)
              }
            : undefined,
          render: props.render
            ? (curText: any, innerProps: ProFieldFCRenderProps, dom: JSX.Element) => {
                const { placeholder: _ph, ...restInner } = innerProps
                return props.render!(curText, restInner as any, dom)
              }
            : undefined,
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
          context.valueTypeMap || {},
        )

        return rendered ?? null
      }
    },
  })

  return ProFieldComponent
}
