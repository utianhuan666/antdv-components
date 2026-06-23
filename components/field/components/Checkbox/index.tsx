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
import FieldCheckboxEdit from './FieldCheckboxEdit'
import FieldCheckboxRead from './FieldCheckboxRead'

export type { FieldCheckboxProps, GroupProps } from './types'
export interface FieldCheckboxExpose {
  fetchData: (keyWord?: string) => void
}
export type CheckboxFieldProps = NonNullable<ProFieldFC<GroupProps>['__props']>

const FieldCheckbox = defineComponent<CheckboxFieldProps>({
  name: 'FieldCheckbox',
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
    'layout',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps
    const exposeTarget = ref<Record<string, never> | null>(null)
    const prefixCls = useProPrefixCls('pro-field-checkbox')
    const [loading, options, fetchData] = useFieldFetchData(props as Parameters<typeof useFieldFetchData>[0])
    const optionsValueEnum = computed(() => options.value?.length
      ? options.value.reduce((pre: any, cur: any) => {
          return { ...pre, [cur.value ?? '']: cur.label }
        }, {})
      : undefined)
    const mergedProps = computed<CheckboxFieldProps>(() => ({
      ...props,
      text: props.text ?? '',
      mode: props.mode ?? 'read',
      fieldProps: props.fieldProps ?? {},
      emptyText: props.emptyText ?? '-',
      layout: props.layout ?? 'horizontal',
    }))
    const statusContext = useFormItemInputContext()
    const { wrapSSR, hashId } = useStyle('Checkbox', token => ({
      [`.${prefixCls.value}`]: {
        '&-error': {
          span: {
            color: token.colorError,
          },
        },
        '&-warning': {
          span: {
            color: token.colorWarning,
          },
        },
        '&-vertical': {
          [`&${token.antCls}-checkbox-group`]: {
            display: 'inline-block',
          },
          [`${token.antCls}-checkbox-wrapper+${token.antCls}-checkbox-wrapper`]: {
            'margin-inline-start': '0  !important',
          },
          [`${token.antCls}-checkbox-group-item`]: {
            display: 'flex',
            marginInlineEnd: 0,
          },
        },
      },
    }))

    expose(createRefProxy<Record<string, never>, FieldCheckboxExpose>(exposeTarget, { fetchData }))

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
          status: statusContext.value,
        })
      }

      return null
    }
  },
})

export default FieldCheckbox
