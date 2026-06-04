import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { Spin } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { isProFieldEditOnlyMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldRadioEdit from './FieldRadioEdit'
import FieldRadioRead from './FieldRadioRead'

type RadioFieldProps = NonNullable<ProFieldFC<GroupProps>['__props']>

function buildOptionsValueEnum(options: any[] | undefined) {
  if (!options?.length)
    return undefined

  return options.reduce<Record<string, any>>((pre, cur) => {
    pre[cur?.value ?? ''] = cur?.label
    return pre
  }, {})
}

const FieldRadio = defineComponent({
  name: 'FieldRadio',
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'emptyText',
    'valueEnum',
    'options',
    'request',
    'params',
    'debounceTime',
    'defaultKeyWords',
    'cacheForSwr',
    'radioType',
    'layout',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps as RadioFieldProps
    const radioRef = ref<unknown>(null)
    const [loading, fetchedOptions, fetchData] = useFieldFetchData(props as any)
    const options = computed(() => props.request ? fetchedOptions.value : (props.options ?? fetchedOptions.value))
    const optionsValueEnum = computed(() => buildOptionsValueEnum(options.value))
    const mergedProps = computed<RadioFieldProps>(() => ({
      ...props,
      text: props.text ?? '',
      mode: props.mode ?? 'read',
      fieldProps: props.fieldProps ?? {},
      emptyText: props.emptyText ?? '-',
      layout: props.layout ?? 'horizontal',
    }))
    const wrapSSR = (node: JSX.Element) => node
    const hashId = ''
    const status = undefined

    expose({ fetchData, radioRef })

    return () => {
      if (loading.value)
        return <Spin size="small" />

      const fieldProps = mergedProps.value

      if (isProFieldReadMode(fieldProps.mode)) {
        return FieldRadioRead({
          ...fieldProps,
          optionsValueEnum: optionsValueEnum.value,
        })
      }

      if (isProFieldEditOnlyMode(fieldProps.mode)) {
        return FieldRadioEdit({
          ...fieldProps,
          options: options.value,
          loading: loading.value,
          radioRef,
          layoutClassName: 'ant-pro-field-radio',
          wrapSSR,
          hashId,
          status,
        })
      }

      return null
    }
  },
}) as unknown as ProFieldFC<GroupProps>

export default FieldRadio as any
