import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps, RequestOptionsType } from '../Select/types'
import { Spin } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldSegmentedEdit from './FieldSegmentedEdit'
import FieldSegmentedRead from './FieldSegmentedRead'

type FieldSegmentedProps = NonNullable<ProFieldFC<{
  text: string
  emptyText?: VNodeChild
  options?: RequestOptionsType[]
} & FieldSelectProps>['__props']>

function buildOptionsValueEnum(options: any[] | undefined) {
  if (!options?.length)
    return undefined

  return options.reduce<Record<string, any>>((pre, cur) => {
    pre[cur?.value ?? ''] = cur?.label
    return pre
  }, {})
}

const FieldSegmented = defineComponent({
  name: 'FieldSegmented',
  props: [
    'text',
    'mode',
    'valueEnum',
    'request',
    'params',
    'debounceTime',
    'defaultKeyWords',
    'cacheForSwr',
    'options',
    'render',
    'formItemRender',
    'fieldProps',
    'emptyText',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps as FieldSegmentedProps
    const inputRef = ref<HTMLInputElement | null>(null)
    const [loading, fetchedOptions, fetchData] = useFieldFetchData(props as any)
    const options = computed(() => props.request ? fetchedOptions.value : (props.options ?? fetchedOptions.value))
    const segmentedOptions = computed(() =>
      options.value.map((item: any) => ({
        label: item.label ?? item.text,
        value: item.value,
        disabled: item.disabled,
        icon: item.icon,
      })).filter((item: any) => item.value !== undefined),
    )
    const optionsValueEnum = computed(() => buildOptionsValueEnum(options.value))
    const mergedProps = computed<FieldSegmentedProps>(() => ({
      ...props,
      text: props.text ?? '',
      mode: props.mode ?? 'read',
      fieldProps: props.fieldProps ?? {},
      emptyText: props.emptyText ?? '-',
    }))

    expose({ fetchData })

    return () => {
      if (loading.value)
        return <Spin size="small" />

      const fieldProps = mergedProps.value

      if (isProFieldReadMode(fieldProps.mode)) {
        return FieldSegmentedRead({
          ...fieldProps,
          optionsValueEnum: optionsValueEnum.value,
          emptyText: fieldProps.emptyText,
        })
      }

      if (isProFieldEditOrUpdateMode(fieldProps.mode)) {
        return FieldSegmentedEdit({
          ...fieldProps,
          options: segmentedOptions.value,
          loading: loading.value,
          inputRef,
        })
      }

      return null
    }
  },
}) as unknown as ProFieldFC<{
  text: string
  emptyText?: VNodeChild
  options?: RequestOptionsType[]
} & FieldSelectProps>

export default FieldSegmented as any
