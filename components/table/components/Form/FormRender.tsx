import type { FormItemProps } from 'antdv-next'
import type { PropType, Ref, VNodeChild } from 'vue'
import type { ProFormInstance, ProFormProps } from '../../../form'
import type { BaseQueryFilterProps } from '../../../form/layouts/QueryFilter'
import type { ProSchemaComponentTypes } from '../../../utils'
import type { ActionType, ProColumns, ProTableProps } from '../../typing'
import { omit } from '@v-c/util'
import { clsx } from '@v-c/util'
import { EXPAND_COLUMN, SELECTION_COLUMN } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent } from 'vue'
import { BetaSchemaForm } from '../../../form'
import { useProProviderContext } from '../../../provider'

function toLowerLine(str: string) {
  const result = str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
  return result.startsWith('-') ? result.slice(1) : result
}

export type SearchConfig = BaseQueryFilterProps & {
  filterType?: 'query' | 'light'
}

/**
 * 获取当前选择的 Form Layout 配置
 *
 * @returns LightFilter | QueryFilter | ProForm
 */
function getFormCompetent(
  isForm: boolean,
  searchConfig?: SearchConfig | false,
): 'Form' | 'LightFilter' | 'QueryFilter' {
  if (!isForm && searchConfig !== false) {
    if (searchConfig?.filterType === 'light')
      return 'LightFilter'

    return 'QueryFilter'
  }
  return 'Form'
}

/**
 * 获取需要传给相应表单的props
 */
function getFromProps(isForm: boolean, searchConfig: any, name: string) {
  if (!isForm && name === 'LightFilter') {
    // 传给轻量筛选表单的配置
    return omit(
      {
        ...searchConfig,
      },
      ['labelWidth', 'defaultCollapsed', 'filterType'],
    )
  }

  if (!isForm) {
    // 传给 QueryFilter 的配置
    return omit(
      {
        labelWidth: searchConfig ? searchConfig?.labelWidth : undefined,
        defaultCollapsed: true,
        ...searchConfig,
      },
      ['filterType'],
    )
  }
  return {}
}

/**
 * 从formConfig中获取传给相应表单的配置
 */
function getFormConfigs(isForm: boolean, formConfig: any) {
  if (isForm) {
    // 传给Form的配置
    return omit(formConfig, ['ignoreRules'])
  }
  // 传给Filter的配置
  return { ignoreRules: true, ...formConfig }
}

export type TableFormItem<T, U = any> = {
  onSubmit?: (value: T, firstLoad: boolean) => void
  onReset?: (value: T) => void
  form?: Omit<ProFormProps, 'form'>
  type?: ProSchemaComponentTypes
  dateFormatter?: ProTableProps<T, U, any>['dateFormatter']
  search?: false | SearchConfig
  columns: ProColumns<U, any>[]
  formRef: Ref<ProFormInstance | undefined>
  submitButtonLoading?: boolean
  manualRequest?: boolean
  bordered?: boolean
  action: Ref<ActionType | undefined>
  ghost?: boolean
} & Omit<FormItemProps, 'children' | 'onReset'>

/**
 * 这里会把 列配置转化为 form 表单
 */
const FormRender = defineComponent({
  name: 'TableFormRender',
  props: {
    onSubmit: { type: Function as PropType<(value: any, firstLoad: boolean) => void>, default: undefined },
    onReset: { type: Function as PropType<(value: any) => void>, default: undefined },
    formRef: { type: Object as PropType<Ref<ProFormInstance | undefined>>, default: undefined },
    dateFormatter: { type: [String, Function, Boolean] as PropType<TableFormItem<any>['dateFormatter']>, default: 'string' },
    type: { type: String as PropType<ProSchemaComponentTypes>, default: undefined },
    columns: { type: Array as PropType<ProColumns<any, any>[]>, default: () => [] },
    action: { type: Object as PropType<Ref<ActionType | undefined>>, required: true },
    ghost: { type: Boolean, default: undefined },
    manualRequest: { type: Boolean, default: undefined },
    submitButtonLoading: { type: Boolean, default: undefined },
    search: { type: [Object, Boolean] as PropType<false | SearchConfig>, default: undefined },
    form: { type: Object as PropType<Omit<ProFormProps, 'form'>>, default: undefined },
    bordered: { type: Boolean, default: undefined },
  },
  setup(props) {
    const { hashId } = useProProviderContext()
    const config = useConfig()

    const isForm = computed(() => props.type === 'form')

    const className = computed(() => config.value.getPrefixCls('pro-table-search'))
    const formClassName = computed(() => config.value.getPrefixCls('pro-table-form'))
    const proCardCls = computed(() => config.value.getPrefixCls('pro-card'))

    const competentName = computed(() => getFormCompetent(isForm.value, props.search))

    const columnsList = computed(() => {
      return props.columns
        .filter((item) => {
          if ((item as any) === EXPAND_COLUMN || (item as any) === SELECTION_COLUMN)
            return false

          if (item.search === false && props.type !== 'form')
            return false

          if (props.type === 'form' && item.hideInForm)
            return false

          return true
        })
        .map((item) => {
          const finalValueType
            = !item.valueType
              || (['textarea', 'jsonCode', 'code'].includes(item?.valueType as string)
                && props.type === 'table')
              ? 'text'
              : (item?.valueType as 'text')
          const columnKey = item?.key || item?.dataIndex?.toString()

          return {
            ...item,
            width: undefined,
            ...(item.search && typeof item.search === 'object'
              ? item.search
              : {}),
            valueType: finalValueType,
            proFieldProps: {
              ...(competentName.value === 'LightFilter'
                && (item.proFieldProps as any)?.light === undefined
                ? { light: true }
                : {}),
              ...item.proFieldProps,
              proFieldKey: columnKey ? `table-field-${columnKey}` : undefined,
            },
          }
        })
    })

    return () => {
      const searchConfig = props.search
      const formConfig = props.form

      // 传给每个表单的配置，理论上大家都需要
      const loadingProps: any = {
        submitter: {
          submitButtonProps: {
            loading: props.submitButtonLoading,
          },
        },
      }

      return (
        <div
          class={clsx(hashId, {
            [proCardCls.value]: true,
            [`${proCardCls.value}-border`]: !!props.bordered,
            [`${proCardCls.value}-bordered`]: !!props.bordered,
            [`${proCardCls.value}-ghost`]: !!props.ghost,
            [className.value]: true,
            [formClassName.value]: isForm.value,
            [config.value.getPrefixCls(`pro-table-search-${toLowerLine(competentName.value)}`)]: true,
            [`${className.value}-ghost`]: props.ghost,
            [(searchConfig as { className: string })?.className]:
              searchConfig !== false && searchConfig?.className,
          })}
        >
          <BetaSchemaForm
            layoutType={competentName.value}
            columns={columnsList.value as any}
            type={props.type}
            {...loadingProps}
            {...getFromProps(isForm.value, searchConfig, competentName.value)}
            {...getFormConfigs(isForm.value, formConfig || {})}
            formRef={props.formRef}
            action={props.action}
            dateFormatter={props.dateFormatter}
            onInit={(values: any, form: ProFormInstance) => {
              if (props.formRef)
                props.formRef.value = form
              // 触发一个 submit，之所以这里触发是为了保证 value 都被 format了
              if (props.type !== 'form') {
                // 修改 pageSize，变成从 url 中获取的
                const pageInfo = props.action.value?.pageInfo
                // 从 values 里获取是因为有时候要从 url中获取的 pageSize。
                const {
                  current = pageInfo?.current,
                  pageSize = pageInfo?.pageSize,
                } = values as any
                props.action.value?.setPageInfo?.({
                  ...pageInfo,
                  current: Number.parseInt(current, 10),
                  pageSize: Number.parseInt(pageSize, 10),
                })
                /** 如果是手动模式不需要提交 */
                if (props.manualRequest)
                  return
                props.onSubmit?.(values, true)
              }
            }}
            onReset={(values: any) => {
              props.onReset?.(values)
            }}
            onFinish={(values: any) => {
              props.onSubmit?.(values, false)
            }}
            initialValues={(formConfig as any)?.initialValues}
          />
        </div>
      ) as VNodeChild
    }
  },
})

export default FormRender
