import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { Spin } from 'antdv-next'
import { useFormItemInputContext } from 'antdv-next/dist/form/context'
import { computed, defineComponent, ref } from 'vue'
import { useStyle } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOnlyMode, isProFieldReadMode } from '../../internal/fieldMode'
import { useFieldFetchData } from '../Select'
import FieldRadioEdit from './FieldRadioEdit'
import FieldRadioRead from './FieldRadioRead'

export type { GroupProps } from './types'

type FieldRadioInstance = InstanceType<typeof import('antdv-next')['RadioGroup']>
export type FieldRadioExpose = Partial<FieldRadioInstance> & {
  fetchData: (keyWord?: string) => void
}

type RadioFieldProps = NonNullable<ProFieldFC<GroupProps>['__props']>

const FieldRadio = defineComponent<RadioFieldProps>({
  name: 'FieldRadio',
  inheritAttrs: false,
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
    'radioType',
    'layout',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps
    const layoutClassName = useProPrefixCls('pro-field-radio')
    const radioRef = ref<FieldRadioInstance | null>(null)
    const [loading, options, fetchData] = useFieldFetchData(props as any)
    const optionsValueEnum = computed(() => options.value?.length
      ? options.value.reduce((pre: any, cur: any) => {
          return { ...pre, [(cur?.value as any) ?? '']: cur?.label }
        }, {})
      : undefined)
    const mergedProps = computed<RadioFieldProps>(() => ({
      ...props,
      text: props.text ?? '',
      mode: props.mode ?? 'read',
      fieldProps: props.fieldProps ?? {},
      emptyText: props.emptyText ?? '-',
    }))
    const status = useFormItemInputContext()
    const { wrapSSR, hashId } = useStyle('FieldRadioRadio', token => ({
      [`.${layoutClassName.value}-error`]: {
        span: {
          color: token.colorError,
        },
      },
      [`.${layoutClassName.value}-warning`]: {
        span: {
          color: token.colorWarning,
        },
      },
      [`.${layoutClassName.value}-vertical`]: {
        [`${token.antCls}-radio-wrapper`]: {
          display: 'flex',
          marginInlineEnd: 0,
        },
      },
    }))

    expose(createRefProxy<FieldRadioInstance, Pick<FieldRadioExpose, 'fetchData'>>(radioRef, { fetchData }))

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
          layoutClassName: layoutClassName.value,
          wrapSSR,
          hashId,
          status: status.value,
        })
      }

      return null
    }
  },
})

export default FieldRadio
