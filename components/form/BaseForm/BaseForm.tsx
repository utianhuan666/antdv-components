import type { FormInstance, FormItemProps, FormProps } from 'antdv-next'
import type { Dayjs } from 'dayjs'
import type { PropType, Ref, VNodeChild } from 'vue'
import type { NamePath, ProFieldProps, ProFormInstanceType, ProRequestData } from '../../utils'
import type { FieldProps, ProFormGridConfig, ProFormGroupProps } from '../typing'
import type { SubmitterProps } from './Submitter'
import { get, set as namePathSet } from '@v-c/util'
import { Form, Spin } from 'antdv-next'
import { computed, defineComponent, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useStyle } from '../../provider'
import { useProPrefixCls } from '../../provider/useProPrefixCls'
import {
  conversionMomentValue,
  isDeepEqualReact,
  ProFormContext,
  transformKeySubmitValue,
} from '../../utils'
import FieldContext from '../FieldContext'
import { GridContext } from '../helpers'
import { EditOrReadOnlyContext } from './EditOrReadOnlyContext'
import Submitter from './Submitter'
import { useUrlSync } from './useUrlSync'

export type ProFormInstance<T = any> = FormInstance & ProFormInstanceType<T>

export type CommonFormProps<T = Record<string, any>, U = Record<string, any>> = {
  initialValues?: T
  submitter?: SubmitterProps<{ form?: FormInstance }> | false
  onFinish?: (formData: T) => Promise<boolean | void> | void
  loading?: boolean
  onLoadingChange?: (loading: boolean) => void
  formRef?: Ref<ProFormInstance<T> | undefined>
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
] as const

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

export const BaseForm = defineComponent({
  name: 'BaseForm',
  inheritAttrs: false,
  props: formPropNames as unknown as Record<string, PropType<any>>,
  emits: ['finish', 'finishFailed', 'valuesChange', 'loadingChange'],
  setup(rawProps, { attrs, emit, expose, slots }) {
    const props = rawProps as BaseFormProps
    const formRef = ref<ProFormInstance<any>>()
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

    const setFieldValueType = (name: NamePath, obj: { valueType?: any, dateFormat?: string, transform?: any }) => {
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

    const getCurrentValues = () => cloneValue(model.value)
    const transformValues = (values: any, omitNil = props.omitNil !== false, parentKey?: NamePath) => {
      const converted = conversionMomentValue(
        values,
        props.dateFormatter ?? 'string',
        fieldsValueType.value,
        omitNil,
        parentKey,
      )
      return transformKeySubmitValue(converted, transformKey.value)
    }

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
        await formRef.value?.validateFields?.(nameList as any)
        return transformValues(getCurrentValues(), omitNil)
      },
    }

    const submit = async () => {
      const values = transformValues(getCurrentValues())
      const result = await props.onFinish?.(values)
      if (result) {
        const allFieldKeys = Object.keys(transformValues(getCurrentValues(), false) || {})
        urlSync.onUrlSyncFinish(values, allFieldKeys, props.extraUrlParams)
      }
      return result
    }

    const reset = () => {
      const finalValues = transformValues(getCurrentValues())
      const resetValues = getMergedInitialValues(urlSync.urlParamsMergeInitialValues.value)
      urlSync.onUrlSyncReset(finalValues, props.extraUrlParams)
      formRef.value?.resetFields?.()
      replaceValues(model.value, resetValues)
      void nextTick(() => {
        formRef.value?.setFieldsValue?.(resetValues)
      })
    }

    const setFieldsValue = (values: Record<string, any>) => {
      mergeValues(model.value, values)
      formRef.value?.setFieldsValue?.(values)
    }

    const getFieldValue = (name: NamePath) => {
      const namePath = toNamePath(name)!
      return get(model.value, namePath)
    }

    const formInstance = computed<ProFormInstance<any>>(() => Object.assign({} as ProFormInstance<any>, formRef.value || {}, formatApi, {
      submit,
      resetFields: reset,
      setFieldsValue,
      getFieldValue,
      nativeElement: formRef.value?.nativeElement,
    }))
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
      onValuesChange: (changedValues: Record<string, any>, values: Record<string, any>) => {
        ;(attrs as any).onValuesChange?.(changedValues, values)
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

    const updateExternalFormRef = () => {
      const target = props.formRef as any
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
      target.current = formInstance.value
    }

    // mirror React：ref 在渲染期同步赋值。formInstance 的方法（submit/setFieldsValue 等）
    // 均为委托内部 form 的稳定闭包，故可在挂载前就把外部 formRef 指过去；否则测试在
    // render 后的同步 act 里读取 formRef.current 会得到 undefined（之前仅在 onMounted 异步赋值）。
    watch(formInstance, updateExternalFormRef, { immediate: true })

    watch(() => props.loading, (value) => {
      loading.value = Boolean(value)
    })

    watch(model, (next, prev) => {
      if (!isDeepEqualReact(next, prev))
        emit('valuesChange', next, next)
    }, { deep: true })

    onMounted(async () => {
      if (props.request) {
        loading.value = true
        emit('loadingChange', true)
        props.onLoadingChange?.(true)
        try {
          const data = await props.request(props.params as any, {} as any)
          if (data && typeof data === 'object') {
            replaceValues(model.value, data as Record<string, any>)
            await nextTick()
            formRef.value?.setFieldsValue?.(data as Record<string, any>)
          }
        }
        finally {
          loading.value = false
          emit('loadingChange', false)
          props.onLoadingChange?.(false)
        }
      }
      await nextTick()
      updateExternalFormRef()
      if (typeof props.onInit === 'function') {
        // mirror React BaseForm: onInit 接收格式化后的值（date→string 等），而非原始 model
        props.onInit(transformValues(getCurrentValues()) as any, formInstance.value)
      }
    })

    expose(Object.assign(formInstance.value, {
      submit,
      resetFields: reset,
    }))

    return () => {
      const submitter = props.submitter === false
        ? null
        : (
            <Submitter
              {...(typeof props.submitter === 'object' ? props.submitter : {})}
              form={formInstance.value}
              onSubmit={submit}
              onReset={reset}
            />
          )
      const children = slots.default?.() ?? []
      const content = props.contentRender
        ? props.contentRender(children, submitter, formInstance.value)
        : (
            <>
              {children}
              {submitter}
            </>
          )

      const className = [
        prefixCls.value,
        hashId,
        (attrs as any).class,
        (attrs as any).className,
        (attrs as any).rootClassName,
      ].filter(Boolean).join(' ')

      return wrapSSR(
        <Spin spinning={loading.value}>
          <Form
            {...attrs as FormProps}
            class={className}
            ref={formRef}
            model={model.value}
            onFinish={submit}
            onFinishFailed={(error: any) => emit('finishFailed', error)}
          >
            {content}
          </Form>
        </Spin>,
      )
    }
  },
})

export default BaseForm
