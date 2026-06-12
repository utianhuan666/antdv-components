import type { ColProps, FormInstance, FormItemProps, FormProps, RowProps } from 'antdv-next'
import type { NamePath } from 'antdv-next/dist/form/types'
import type { Dayjs } from 'dayjs'

import type { HTMLAttributes, Ref, VNodeChild } from 'vue'
import type { ProFieldProps, ProFormInstanceType, ProRequestData, SearchTransformKeyFn } from '../../utils'
import type { ProFieldValueType } from '../../utils/typing'
import type { FieldProps, ProFormGridConfig, ProFormGroupProps } from '../typing'
import type { SubmitterProps } from './Submitter'
import { get, set as namePathSet, omit, warning as rcWarning } from '@v-c/util'
import { Form, Spin } from 'antdv-next'
import { computed, defineComponent, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useStyle } from '../../provider'
import { useProPrefixCls } from '../../provider/useProPrefixCls'
import {
  autoFocusToFirstChild,
  conversionMomentValue,
  isDeepEqualReact,
  ProFormContext,
  transformKeySubmitValue,
  usePrevious,
  useRefFunction,
} from '../../utils'
import FieldContext from '../FieldContext'
import { GridContext, useGridHelpers } from '../helpers'
import { EditOrReadOnlyContext } from './EditOrReadOnlyContext'
import Submitter from './Submitter'
import { useUrlSync } from './useUrlSync'

const { noteOnce } = rcWarning

export type ProFormInstance<T = any> = FormInstance & ProFormInstanceType<T>

export type CommonFormProps<T = Record<string, any>, U = Record<string, any>> = {
  initialValues?: T
  submitter?: SubmitterProps<{ form?: FormInstance }> | false
  onFinish?: (formData: T) => Promise<boolean | void> | void
  loading?: boolean
  onLoadingChange?: (loading: boolean) => void
  formRef?:
    | Ref<ProFormInstance<T> | undefined>
    | { current?: ProFormInstance<T> | undefined }
    | ((instance: ProFormInstance<T> | undefined | null) => void)
  syncToUrl?: boolean | ((values: T, type: 'get' | 'set') => T)
  syncToUrlAsImportant?: boolean
  extraUrlParams?: Record<string, any>
  syncToInitialValues?: boolean
  omitNil?: boolean
  dateFormatter?:
    | (string & {})
    | 'string'
    | 'number'
    | ((value: Dayjs, valueType: string) => string | number)
    | false
  onInit?: (values: T, form: ProFormInstance<any>) => void
  params?: U
  request?: ProRequestData<T, U>
  isKeyPressSubmit?: boolean
  formKey?: string
  autoFocusFirstInput?: boolean
  readonly?: boolean
} & ProFormGridConfig

export type BaseFormProps<T = Record<string, any>, U = Record<string, any>> = {
  contentRender?: (items: VNodeChild[], submitter: VNodeChild, form: ProFormInstance<any>) => VNodeChild
  fieldProps?: FieldProps<unknown>
  proFieldProps?: ProFieldProps
  formItemProps?: FormItemProps
  groupProps?: ProFormGroupProps
  formComponentType?: 'DrawerForm' | 'ModalForm' | 'QueryFilter' | 'LightFilter'
  class?: HTMLAttributes['class']
  className?: string
  rootClassName?: string
} & Omit<FormProps, 'onFinish'> & CommonFormProps<T, U>

const formPropNames = [
  'model',
  'initialValues',
  'submitter',
  'onFinish',
  'loading',
  'onLoadingChange',
  'formRef',
  'syncToUrl',
  'syncToUrlAsImportant',
  'extraUrlParams',
  'syncToInitialValues',
  'omitNil',
  'dateFormatter',
  'onInit',
  'params',
  'request',
  'isKeyPressSubmit',
  'formKey',
  'autoFocusFirstInput',
  'readonly',
  'contentRender',
  'fieldProps',
  'proFieldProps',
  'formItemProps',
  'groupProps',
  'formComponentType',
  'grid',
  'colProps',
  'rowProps',
  'layout',
  'labelCol',
  'wrapperCol',
  'rules',
  'name',
  'disabled',
  'validateTrigger',
  'hideRequiredMark',
  'labelAlign',
  'scrollToFirstError',
  'onValuesChange',
  'class',
  'className',
  'rootClassName',
]

const baseFormPropKeysToOmit = [
  'initialValues',
  'submitter',
  'loading',
  'onLoadingChange',
  'formRef',
  'syncToUrl',
  'syncToUrlAsImportant',
  'extraUrlParams',
  'syncToInitialValues',
  'omitNil',
  'dateFormatter',
  'onInit',
  'params',
  'request',
  'isKeyPressSubmit',
  'formKey',
  'autoFocusFirstInput',
  'readonly',
  'contentRender',
  'fieldProps',
  'proFieldProps',
  'formItemProps',
  'groupProps',
  'formComponentType',
  'grid',
  'colProps',
  'rowProps',
  'className',
  'rootClassName',
]

/**
 * It takes a name path and converts it to an array.
 * @param {NamePath} name - The name of the form.
 * @returns (string | number)[]
 *
 * a-> [a]
 * [a] -> [a]
 */
function toNamePath(name?: NamePath): (string | number)[] | undefined {
  if (name === undefined || name === null)
    return undefined
  return Array.isArray(name) ? name as (string | number)[] : [name as string | number]
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value))
    return value.map(item => cloneValue(item)) as T
  if (value && typeof value === 'object') {
    // 仅深拷贝「普通对象」：dayjs / moment / Date / 其他类实例必须按引用保留，
    // 否则会被拆成 { $L, $d, ... } 这种普通对象，丢失原型，导致
    // dayjs.isDayjs() 失效、日期值无法被 conversionMomentValue 正确格式化。
    const proto = Object.getPrototypeOf(value)
    if (proto !== Object.prototype && proto !== null)
      return value
    return Object.keys(value as Record<string, any>).reduce<Record<string, any>>((result, key) => {
      result[key] = cloneValue((value as Record<string, any>)[key])
      return result
    }, {}) as T
  }
  return value
}

function mergeValues(target: Record<string, any>, source: Record<string, any>) {
  Object.keys(source || {}).forEach((key) => {
    const value = source[key]
    // 仅对「普通对象」做深合并：dayjs / moment / Date / 其他类实例按引用保留，
    // 否则 { ...dayjs } 会拆成普通对象，丢失原型导致日期格式化失效。
    const isPlainObj
      = value
        && typeof value === 'object'
        && !Array.isArray(value)
        && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
    if (isPlainObj) {
      target[key] = mergeValues({ ...(target[key] || {}) }, value)
    }
    else {
      target[key] = value
    }
  })
  return target
}

function replaceValues(target: Record<string, any>, source: Record<string, any>) {
  Object.keys(target).forEach(key => delete target[key])
  Object.assign(target, cloneValue(source))
  return target
}

/**
 * BaseFormComponents 内部组件，负责渲染表单内容、提交按钮和处理表单实例
 */
function BaseFormComponents(
  props: {
    loading: boolean
    submitter?: SubmitterProps<{ form?: FormInstance }> | false
    contentRender?: (items: VNodeChild[], submitter: VNodeChild, form: ProFormInstance) => VNodeChild
    children: VNodeChild[]
    autoFocusFirstInput?: boolean
    grid?: boolean
    rowProps?: RowProps
    colProps?: ColProps
    onSubmit: () => Promise<boolean | void>
    onReset: () => void
  },
  formRef: Ref<ProFormInstance | undefined>,
) {
  const {
    submitter,
    contentRender,
    children,
    autoFocusFirstInput = true,
    grid,
    rowProps,
    colProps,
    onSubmit,
    onReset,
  } = props

  // 获取布局辅助工具
  const { RowWrapper } = useGridHelpers({ grid, rowProps, colProps })

  // 处理子节点，第一个子节点自动聚焦
  const items = (() => {
    const childArray = Array.isArray(children) ? children : [children]
    return childArray.map((item, index) => {
      if (index === 0 && autoFocusFirstInput) {
        return autoFocusToFirstChild(item, autoFocusFirstInput)
      }
      return item
    })
  })()

  // 渲染提交按钮与重置按钮
  const submitterNode = submitter === false
    ? null
    : (
        <Submitter
          {...(typeof submitter === 'object' ? submitter : {})}
          form={formRef.value}
          onSubmit={onSubmit}
          onReset={onReset}
        />
      )

  // 如果启用了 grid 布局，包装子节点
  const wrapItems = grid ? <RowWrapper>{items}</RowWrapper> : items

  // 自定义内容渲染
  const content = contentRender && formRef.value
    ? contentRender(Array.isArray(wrapItems) ? wrapItems : [wrapItems], submitterNode, formRef.value)
    : (
        <>
          {wrapItems}
          {submitterNode}
        </>
      )

  return content
}

export const BaseForm = defineComponent<BaseFormProps>({
  name: 'BaseForm',
  inheritAttrs: false,
  props: formPropNames,
  emits: ['finish', 'finishFailed', 'valuesChange', 'loadingChange'],
  setup(rawProps, { emit, expose, slots }) {
    const props = rawProps as BaseFormProps<any, any>
    const formRef = ref<ProFormInstance>()
    const urlSync = useUrlSync({
      syncToUrl: computed(() => props.syncToUrl),
      syncToInitialValues: computed(() => props.syncToInitialValues ?? true),
      extraUrlParams: computed(() => props.extraUrlParams),
    })
    // 记录各字段（列）通过 initialValue 注册的初始值。React/antd 里 resetFields 会同步把字段
    // 恢复到其 initialValue；本实现以 model 为单一数据源，故需把列级 initialValue 记录下来，
    // 供 reset 时合并恢复（见 protable-reset-params 第二段断言）。
    const fieldsInitialValues = ref<Record<string, any>>({})
    const getMergedInitialValues = (urlParams: Record<string, any>) => {
      // 列级 initialValue 优先级最低，被表单级 initialValues / url 覆盖。
      const initialValues = mergeValues(
        cloneValue(fieldsInitialValues.value),
        cloneValue((props.model || props.initialValues || {}) as Record<string, any>),
      )
      if (props.syncToUrlAsImportant)
        return mergeValues(initialValues, urlParams)
      return mergeValues(cloneValue(urlParams), initialValues)
    }
    const model = ref<Record<string, any>>(getMergedInitialValues(urlSync.urlParamsMergeInitialValues.value))
    const loading = ref(Boolean(props.loading))
    const fieldsValueType = ref<Record<string, any>>({})
    const transformKey = ref<Record<string, any>>({})
    const prefixCls = useProPrefixCls('pro-form')
    const { wrapSSR, hashId } = useStyle('ProForm', token => ({
      [`.${prefixCls.value}`]: {
        [`> div:not(${token.proComponentsCls}-form-light-filter)`]: {
          '.pro-field': {
            'maxWidth': '100%',
            '@media screen and (max-width: 575px)': {
              maxWidth: 'calc(93vw - 48px)',
            },
            '&-xs': {
              width: 104,
            },
            '&-s': {
              width: 216,
            },
            '&-sm': {
              width: 216,
            },
            '&-m': {
              width: 328,
            },
            '&-md': {
              width: 328,
            },
            '&-l': {
              width: 440,
            },
            '&-lg': {
              width: 440,
            },
            '&-xl': {
              width: 552,
            },
          },
        },
      },
    }))

    const setFieldValueType = (
      name: NamePath,
      obj: { valueType?: ProFieldValueType, dateFormat?: string, transform?: SearchTransformKeyFn },
    ) => {
      const namePath = toNamePath(name)
      if (!namePath)
        return
      const nextValueType = {
        valueType: obj.valueType ?? 'text',
        dateFormat: obj.dateFormat,
      }
      if (!isDeepEqualReact(get(fieldsValueType.value, namePath), nextValueType)) {
        fieldsValueType.value = namePathSet({ ...fieldsValueType.value }, namePath, nextValueType)
      }
      if (obj.transform && get(transformKey.value, namePath) !== obj.transform) {
        transformKey.value = namePathSet({ ...transformKey.value }, namePath, obj.transform)
      }
    }

    // 获取弹窗容器配置
    const getPopupContainer = computed(() => {
      if (typeof window === 'undefined')
        return undefined
      // 如果在 drawerForm 和 modalForm 里就渲染 dom 到父节点里
      // modalForm 可能高度太小不适合
      if (props.formComponentType && ['DrawerForm'].includes(props.formComponentType)) {
        return (e: HTMLElement) => e.parentNode || document.body
      }
      return undefined
    })

    const getCurrentValues = () => cloneValue(model.value)

    // 使用 useRefFunction 包装 transformValues，确保引用稳定
    const transformValues = useRefFunction(<T extends Record<string, any>>(
      values: T,
      omitNil = props.omitNil !== false,
      parentKey?: NamePath,
    ): T => {
      const converted = conversionMomentValue(
        values,
        props.dateFormatter ?? 'string',
        fieldsValueType.value,
        omitNil,
        parentKey,
      )
      return transformKeySubmitValue(converted, transformKey.value) as T
    })

    const formatApi = {
      getFieldsFormatValue: (_allData?: true, omitNil?: boolean) =>
        transformValues(getCurrentValues(), omitNil),
      getFieldFormatValue: (nameList?: NamePath, omitNil?: boolean) => {
        const value = getCurrentValues()
        if (!nameList)
          return transformValues(value, omitNil)
        const namePath = toNamePath(nameList)!
        return get(transformValues(value, omitNil), namePath)
      },
      getFieldFormatValueObject: (nameList?: NamePath, omitNil?: boolean) => {
        const value = getCurrentValues()
        if (!nameList)
          return transformValues(value, omitNil)
        const namePath = toNamePath(nameList)!
        const rawValue = get(value, namePath)
        const obj = namePathSet({}, namePath, rawValue)
        return transformValues(obj, omitNil)
      },
      validateFieldsReturnFormatValue: async (nameList?: NamePath[], omitNil?: boolean) => {
        await formRef.value?.validateFields?.(nameList as string[])
        return transformValues(getCurrentValues(), omitNil)
      },
    }

    const onFinish = useRefFunction(async () => {
      const values = transformValues(getCurrentValues())
      const result = await props.onFinish?.(values)
      if (result) {
        const allFieldKeys = Object.keys(transformValues(getCurrentValues(), false) || {})
        urlSync.onUrlSyncFinish(values, allFieldKeys, props.extraUrlParams)
      }
      return result
    })

    const reset = useRefFunction(() => {
      const finalValues = transformValues(getCurrentValues())
      const resetValues = getMergedInitialValues(urlSync.urlParamsMergeInitialValues.value)
      urlSync.onUrlSyncReset(finalValues, props.extraUrlParams)
      formRef.value?.resetFields?.()
      replaceValues(model.value, resetValues)
      void nextTick(() => {
        formRef.value?.setFieldsValue?.(resetValues)
      })
    })

    const setFieldsValue = (values: Record<string, any>) => {
      mergeValues(model.value, values)
      formRef.value?.setFieldsValue?.(values)
    }

    const getFieldValue = (name: NamePath) => {
      const namePath = toNamePath(name)!
      return get(model.value, namePath)
    }

    const formInstance = computed<ProFormInstance>(() => Object.assign(
      {} as ProFormInstance,
      formRef.value || {},
      formatApi,
      {
        submit: onFinish,
        resetFields: reset,
        setFieldsValue,
        getFieldValue,
        nativeElement: formRef.value?.nativeElement,
        /** 聚焦到表单的第一个输入框 */
        focus: () => {
          const firstInput = formRef.value?.nativeElement?.querySelector?.(
            'input, textarea, select',
          ) as HTMLElement | null
          firstInput?.focus?.()
        },
      },
    ))
    const fieldContextValue = computed(() => ({
      rootModel: model.value,
      model: model.value,
      fieldProps: props.fieldProps,
      proFieldProps: props.proFieldProps,
      formItemProps: props.formItemProps,
      groupProps: props.groupProps,
      setFieldValueType,
      setFieldValue: (name: NamePath, value: any) => {
        const namePath = toNamePath(name)
        if (namePath) {
          const nextModel = namePathSet(cloneValue(model.value), namePath, value)
          if (!isDeepEqualReact(model.value, nextModel))
            replaceValues(model.value, nextModel)
        }
      },
      // 字段注册 initialValue 时记录，供 reset 同步恢复列级初始值
      setFieldInitialValue: (name: NamePath, value: any) => {
        const namePath = toNamePath(name)
        if (namePath)
          fieldsInitialValues.value = namePathSet(cloneValue(fieldsInitialValues.value), namePath, value)
      },
      formComponentType: props.formComponentType,
      formKey: props.formKey,
      formRef,
      getPopupContainer: getPopupContainer.value,
      onValuesChange: (changedValues: Record<string, any>, values: Record<string, any>) => {
        props.onValuesChange?.(changedValues, values)
        emit('valuesChange', changedValues, values)
      },
      grid: props.grid,
      colProps: props.colProps,
      rowProps: props.rowProps,
    }))

    provide(ProFormContext, { formRef, ...formatApi })
    provide(FieldContext, fieldContextValue.value)
    provide(GridContext, { grid: props.grid, colProps: props.colProps, rowProps: props.rowProps })
    provide(EditOrReadOnlyContext, { mode: props.readonly ? 'read' : 'edit' })

    const updateExternalFormRef = useRefFunction(() => {
      const target = props.formRef
      if (!target)
        return
      if (typeof target === 'function') {
        target(formInstance.value)
        return
      }
      if ('value' in target) {
        target.value = formInstance.value
        return
      }
      // 兼容 React ref 的 current 属性
      if ('current' in target) {
        (target as { current: ProFormInstance }).current = formInstance.value
      }
    })

    // mirror React：ref 在渲染期同步赋值。formInstance 的方法（submit/setFieldsValue 等）
    // 均为委托内部 form 的稳定闭包，故可在挂载前就把外部 formRef 指过去；否则测试在
    // render 后的同步 act 里读取 formRef.current 会得到 undefined（之前仅在 onMounted 异步赋值）。
    watch(formInstance, updateExternalFormRef, { immediate: true })

    // 包装 setLoading，使用 queueMicrotask 延迟回调调用，避免在渲染阶段调用外部回调
    const setLoading = useRefFunction((value: boolean) => {
      loading.value = value
      queueMicrotask(() => {
        emit('loadingChange', value)
        props.onLoadingChange?.(value)
      })
    })

    watch(() => props.loading, (value) => {
      if (value !== undefined) {
        setLoading(Boolean(value))
      }
    })

    // 提示 initialValues 变化（开发环境友好提示）
    const preInitialValues = usePrevious(() => props.initialValues)
    watch(() => props.initialValues, (current) => {
      if (props.syncToUrl || !current || !preInitialValues.value || props.request)
        return
      const isEqual = isDeepEqualReact(current, preInitialValues.value)
      noteOnce(
        isEqual,
        'initialValues 只在 form 初始化时生效，如果你需要异步加载推荐使用 request，或者 initialValues ? <Form/> : null ',
      )
      noteOnce(
        isEqual,
        'The initialValues only take effect when the form is initialized, if you need to load asynchronously recommended request, or the initialValues ? <Form/> : null ',
      )
    })

    watch(model, (next, prev) => {
      if (!isDeepEqualReact(next, prev))
        emit('valuesChange', next, next)
    }, { deep: true })

    onMounted(async () => {
      if (props.request && props.params) {
        setLoading(true)
        try {
          const data = await props.request(props.params as any, {} as Record<string, any>)
          if (data && typeof data === 'object') {
            replaceValues(model.value, data as Record<string, any>)
            await nextTick()
            formRef.value?.setFieldsValue?.(data as Record<string, any>)
          }
        }
        finally {
          setLoading(false)
        }
      }
      await nextTick()
      updateExternalFormRef()
      if (typeof props.onInit === 'function') {
        // mirror React BaseForm: onInit 接收格式化后的值（date→string 等），而非原始 model
        props.onInit(transformValues(getCurrentValues()), formInstance.value)
      }
    })

    expose(Object.assign(formInstance.value, {
      submit: onFinish,
      resetFields: reset,
    }))

    return () => {
      const children = slots.default?.() ?? []
      const formProps = omit(
        props as Record<string, unknown>,
        baseFormPropKeysToOmit as readonly string[],
      ) as Omit<BaseFormProps, typeof baseFormPropKeysToOmit[number]>

      const className = [
        prefixCls.value,
        hashId,
        props.class,
        props.className,
        props.rootClassName,
      ].filter(Boolean).join(' ')

      return wrapSSR(
        <Spin spinning={loading.value}>
          <Form
            {...formProps}
            class={className}
            ref={formRef}
            model={model.value}
            onFinish={onFinish}
            onFinishFailed={(error: unknown) => emit('finishFailed', error)}
            // @ts-expect-error 暂无类型
            onKeydown={(event: KeyboardEvent) => {
              if (!props.isKeyPressSubmit)
                return
              if (event.key === 'Enter') {
                formInstance.value?.submit?.()
              }
            }}
          >
            {BaseFormComponents({
              loading: loading.value,
              submitter: props.submitter,
              contentRender: props.contentRender,
              children,
              autoFocusFirstInput: props.autoFocusFirstInput,
              grid: props.grid,
              rowProps: props.rowProps,
              colProps: props.colProps,
              onSubmit: onFinish,
              onReset: reset,
            }, formRef)}
          </Form>
        </Spin>,
      )
    }
  },
})

export default BaseForm
