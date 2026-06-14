import type { VNodeChild } from 'vue'
import type { ProFieldFC } from '../../types'
import type { FieldSelectProps, RequestOptionsType } from '../Select/types'
import { Spin } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldSegmentedEdit from './FieldSegmentedEdit'
import FieldSegmentedRead from './FieldSegmentedRead'

type FieldSegmentedInstance = InstanceType<typeof import('antdv-next')['Segmented']>
export type FieldSegmentedExpose = Partial<FieldSegmentedInstance> & {
  fetchData: (keyWord?: string) => void
}

type FieldSegmentedProps = NonNullable<ProFieldFC<{
  text: string
  emptyText?: VNodeChild
  options?: RequestOptionsType[]
} & FieldSelectProps>['__props']>

const FieldSegmented = defineComponent<FieldSegmentedProps>({
  name: 'FieldSegmented',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'valueEnum',
    'request',
    'params',
    'debounceTime',
    'defaultKeyWords',
    'cacheForSwr',
    'proFieldKey',
    'options',
    'render',
    'formItemRender',
    'fieldProps',
    'emptyText',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps
    const inputRef = ref<FieldSegmentedInstance | null>(null)
    const [loading, options, fetchData] = useFieldFetchData(
      props as Parameters<typeof useFieldFetchData>[0],
    )
    const optionsValueEnum = computed<Record<string, RequestOptionsType['label']> | undefined>(() => options.value?.length
      ? options.value.reduce<Record<string, RequestOptionsType['label']>>((pre, cur) => {
          pre[String(cur?.value ?? '')] = cur?.label
          return pre
        }, {})
      : undefined)
    const mergedProps = computed<FieldSegmentedProps>(() => ({
      ...props,
      text: props.text ?? '',
      mode: props.mode ?? 'read',
      fieldProps: props.fieldProps ?? {},
      emptyText: props.emptyText ?? '-',
    }))

    expose(createRefProxy<FieldSegmentedInstance, Pick<FieldSegmentedExpose, 'fetchData'>>(inputRef, { fetchData }))

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
          options: options.value,
          loading: loading.value,
        }, inputRef)
      }

      return null
    }
  },
})

export default FieldSegmented
