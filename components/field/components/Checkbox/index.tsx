import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { Spin } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { isProFieldEditOnlyMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldCheckboxEdit from './FieldCheckboxEdit'
import FieldCheckboxRead from './FieldCheckboxRead'

export type { FieldCheckboxProps, GroupProps } from './types'
type CheckboxFieldProps = NonNullable<ProFieldFC<GroupProps>['__props']>

function buildOptionsValueEnum(options: any[] | undefined) {
  if (!options?.length)
    return undefined

  return options.reduce<Record<string, any>>((pre, cur) => {
    pre[cur?.value ?? ''] = cur?.label
    return pre
  }, {})
}

const FieldCheckbox = defineComponent({
  name: 'FieldCheckbox',
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
    'proFieldKey',
    'layout',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps as CheckboxFieldProps
    const prefixCls = useProPrefixCls('pro-field-checkbox')
    const [loading, fetchedOptions, fetchData] = useFieldFetchData(props as any)
    const options = computed(() => props.request ? fetchedOptions.value : (props.options ?? fetchedOptions.value))
    const optionsValueEnum = computed(() => buildOptionsValueEnum(options.value))
    const mergedProps = computed<CheckboxFieldProps>(() => ({
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

    expose({ fetchData })

    return () => {
      if (loading.value)
        return <Spin size="small" />

      const fieldProps = mergedProps.value

      if (isProFieldReadMode(fieldProps.mode)) {
        return FieldCheckboxRead({
          ...fieldProps,
          optionsValueEnum: optionsValueEnum.value,
        })
      }

      if (isProFieldEditOnlyMode(fieldProps.mode)) {
        return FieldCheckboxEdit({
          ...fieldProps,
          options: options.value,
          loading: loading.value,
          layout: fieldProps.layout ?? 'horizontal',
          layoutClassName: prefixCls.value,
          wrapSSR,
          hashId,
          status,
        })
      }

      return null
    }
  },
}) as unknown as ProFieldFC<GroupProps>

export default FieldCheckbox as any
