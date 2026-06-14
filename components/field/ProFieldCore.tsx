import type { VNodeChild } from 'vue'
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
import { createRefProxy } from '../utils/createRefProxy'
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

interface ProFieldCoreExpose {
  fetchData: (keyWord?: string) => unknown
}

interface MergedFieldProps extends Record<string, unknown> {
  value?: unknown
  onChange?: (...args: unknown[]) => void
  placeholder?: string | string[]
}

interface ProFieldCoreProps {
  text?: ProFieldTextType
  valueType?: ProFieldValueTypeInput
  mode?: ProFieldFCMode
  readonly?: boolean
  value?: unknown
  onChange?: (...args: unknown[]) => void
  fieldProps?: Record<string, any>
  valueEnum?: Map<any, any> | Record<string, any>
  render?: ProRenderFieldPropsType['render']
  formItemRender?: ProRenderFieldPropsType['formItemRender']
  emptyText?: VNodeChild | false
  placeholder?: string | string[]
  label?: VNodeChild
  light?: boolean
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  request?: ProFieldRequestData
  params?: Record<string, unknown> | ((...args: any[]) => Record<string, unknown>)
  debounceTime?: number
  cacheForSwr?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
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
    props: [
      'text',
      'valueType',
      'mode',
      'readonly',
      'value',
      'onChange',
      'fieldProps',
      'valueEnum',
      'render',
      'formItemRender',
      'emptyText',
      'placeholder',
      'label',
      'light',
      'variant',
      'request',
      'params',
      'debounceTime',
      'cacheForSwr',
      'open',
      'onOpenChange',
    ],
    setup(rawProps, { attrs, expose }) {
      const props = rawProps as ProFieldCoreProps
      const context = useProProviderContext()
      const fieldRef = ref<FieldInstance>()

      const fetchData = (keyWord?: string) => fieldRef.value?.fetchData?.(keyWord)

      expose(createRefProxy<FieldInstance, ProFieldCoreExpose>(fieldRef, { fetchData }))

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
        props.readonly ? 'read' : (props.mode ?? 'read'),
      )

      // -- customValueType flag (for pickProProps) --------------------------

      const customValueType = computed(() => {
        if (!options.pickProPropsWithValueTypeMap)
          return false
        return Object.keys(context.valueTypeMap || {}).includes(String(props.valueType ?? 'text'))
      })

      // -- dataValue: which source to read from depending on *original* mode -

      const dataValue = computed<ProFieldTextType>(() => {
        const mode = props.mode ?? 'read'
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

        const resolvedValueType = props.valueType ?? 'text'
        const emptyText = props.emptyText ?? '-'

        const placeholderValue = props.placeholder ?? fieldProps.value?.placeholder
        const cacheForSwr = props.cacheForSwr ?? false

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
          params: props.params,
          debounceTime: props.debounceTime,
          cacheForSwr,
          emptyText,
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
