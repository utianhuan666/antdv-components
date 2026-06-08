import type { PopoverProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProFieldEmptyText } from '../../field'
import type { ProFormFieldProps } from '../../form'
import type {
  ProFieldValueType,
  ProSchemaComponentTypes,
  UseEditableUtilType,
} from '../../utils'
import type { ContainerType } from '../Store/Provide'
import type { Key, ProColumnType } from '../typing'
import { get } from '@v-c/util'
import { computed, defineComponent, ref, watch } from 'vue'
import { ProFormField } from '../../form'
import { useFieldContext } from '../../form/FieldContext'
import {
  getFieldPropsOrFormItemProps,
  InlineErrorFormItem,
  isDeepEqualReact,
  runFunction,
  useProFormContext,
} from '../../utils'

const SHOW_EMPTY_TEXT_LIST = ['', null, undefined]

/**
 * 拼接用于编辑的 key
 *
 * @deprecated 请使用 buildNamePath，spellNamePath 是历史命名，保留以兼容外部引用
 */
export function spellNamePath(...rest: any[]): Key[] {
  return buildNamePath(...rest)
}

/**
 * 拼接用于编辑的表单字段路径（name path）
 */
export function buildNamePath(...rest: any[]): Key[] {
  return rest
    .filter(index => index !== undefined)
    .map((item) => {
      if (typeof item === 'number') {
        return item.toString()
      }
      return item
    })
    .flat(1)
}

export interface CellRenderFromItemProps<T extends Record<string, any>> {
  text: string | number | (string | number)[]
  valueType: ProColumnType['valueType']
  index: number
  rowData?: T
  columnEmptyText?: ProFieldEmptyText
  columnProps?: ProColumnType<T> & {
    entity: T
  }
  type?: ProSchemaComponentTypes
  // 行的唯一 key
  recordKey?: Key
  mode: 'edit' | 'read'
  /**
   * If there is, use EditableTable in the Form
   */
  prefixName?: string
  counter: ReturnType<ContainerType>
  proFieldProps: ProFormFieldProps
  subName: string[]
  editableUtils: UseEditableUtilType
}

const CellRenderFromItem = defineComponent({
  name: 'CellRenderFromItem',
  inheritAttrs: false,
  props: ['cellProps'],
  setup(rawProps) {
    const propsRef = computed(() => (rawProps as { cellProps: CellRenderFromItemProps<any> }).cellProps)

    const formContext = useFieldContext()
    const proFormContext = useProFormContext()
    // editableForm 对应 React 的 ProForm.useFormInstance()。
    // Vue 中通过 ProFormContext 注入的 formRef 暴露表单实例。
    const getEditableForm = () => proFormContext.formRef?.value

    const realIndex = computed(() => {
      const { editableUtils, rowData, index } = propsRef.value
      return editableUtils?.getRealIndex?.(rowData!) ?? index
    })

    const computeName = (): Key[] => {
      const { prefixName, subName, recordKey, index, columnProps } = propsRef.value
      const key = recordKey || index
      return buildNamePath(
        prefixName,
        prefixName ? subName : [],
        prefixName ? realIndex.value : key,
        columnProps?.key ?? (columnProps?.dataIndex as any) ?? index,
      )
    }

    const formItemName = ref<Key[]>(computeName())

    // 对应 React useEffect + functional update：name path 变化时才重算，
    // 用 join('-') 比较避免循环依赖（state 变 → effect 跑 → setName）。
    watch(
      () => {
        const { prefixName, subName, recordKey, index, columnProps } = propsRef.value
        return [
          columnProps?.dataIndex,
          columnProps?.key,
          index,
          recordKey,
          prefixName,
          recordKey || index,
          subName,
          realIndex.value,
        ]
      },
      () => {
        const nextName = computeName()
        if (nextName.join('-') !== formItemName.value.join('-'))
          formItemName.value = nextName
      },
      { deep: true },
    )

    const rowName = computed(() => formItemName.value.slice(0, -1))

    const needProps = computed(() => {
      const { columnProps, index } = propsRef.value
      return [
        getEditableForm(),
        {
          ...columnProps,
          rowKey: rowName.value,
          rowIndex: index,
          isEditable: true,
        },
      ] as const
    })

    const generateFormItem = (): VNodeChild => {
      const {
        columnProps,
        prefixName,
        text,
        counter,
        rowData,
        index,
        recordKey,
        proFieldProps,
      } = propsRef.value
      const key = recordKey || index
      const editableForm = getEditableForm()

      const formItemProps = {
        ...getFieldPropsOrFormItemProps(columnProps?.formItemProps, ...needProps.value),
      } as Record<string, any>
      formItemProps.messageVariables = {
        label: (columnProps?.title as string) || '此项',
        type: (columnProps?.valueType as string) || '文本',
        ...formItemProps?.messageVariables,
      }

      // 有 prefixName（EditableTable 嵌套场景）时不应强制覆盖 initialValue。
      formItemProps.initialValue = prefixName
        ? (formItemProps?.initialValue ?? columnProps?.initialValue)
        : (text ?? formItemProps?.initialValue ?? columnProps?.initialValue)

      let fieldDom: VNodeChild = (
        <ProFormField
          cacheForSwr
          key={formItemName.value.join('-')}
          name={formItemName.value}
          proFormFieldKey={key}
          ignoreFormItem
          fieldProps={getFieldPropsOrFormItemProps(
            columnProps?.fieldProps,
            ...needProps.value,
          )}
          {...proFieldProps}
        />
      )

      // 如果有自定义 formItemRender
      if (columnProps?.formItemRender) {
        fieldDom = columnProps.formItemRender(
          {
            ...columnProps,
            index,
            isEditable: true,
            type: 'table',
          },
          {
            defaultRender: () => <>{fieldDom}</>,
            type: 'form',
            recordKey,
            record: {
              ...rowData,
              ...editableForm?.getFieldValue?.([key]),
            },
            isEditable: true,
          },
          editableForm as any,
          propsRef.value.editableUtils,
        )
        // 如果需要完全自定义可以不要 name
        if (columnProps.ignoreFormItem)
          return <>{fieldDom}</>
      }

      return (
        <InlineErrorFormItem
          popoverProps={{
            getPopupContainer:
              (formContext.getPopupContainer as PopoverProps['getPopupContainer'])
              || (() => (counter.rootDomRef.value || document.body) as HTMLElement),
          }}
          key={formItemName.value.join('-')}
          errorType="popover"
          name={formItemName.value}
          {...formItemProps}
        >
          {fieldDom}
        </InlineErrorFormItem>
      )
    }

    return () => {
      const { columnProps } = propsRef.value
      if (formItemName.value.length === 0)
        return null

      if (
        typeof columnProps?.formItemRender === 'function'
        || typeof columnProps?.fieldProps === 'function'
        || typeof columnProps?.formItemProps === 'function'
      ) {
        // React 通过 <Form.Item shouldUpdate>{() => ...}</Form.Item> 在行数据变化时
        // 重新执行 generateFormItem。Vue 中表单 model 为响应式对象，读取行子路径即可
        // 建立依赖；用 isDeepEqualReact 做深比较的语义通过下面的 key 触发重渲染来对齐。
        const shouldName = [rowName.value].flat(1) as (string | number)[]
        const model = formContext.model
        // rowName 为空时（无法精确定位行数据）直接整体渲染，避免空路径取整个 values。
        const rowValue = shouldName.length === 0 ? undefined : get(model, shouldName)
        // 触碰 rowValue 建立响应式依赖；isDeepEqualReact 保持引用以对齐 React 行为。
        void isDeepEqualReact(rowValue, rowValue)
        return generateFormItem()
      }
      return generateFormItem()
    }
  },
})

/**
 * 根据不同的类型来转化数值
 *
 * @param text
 * @param valueType
 */
function cellRenderToFromItem<T extends Record<string, any>>(
  config: CellRenderFromItemProps<T>,
): VNodeChild {
  const { text, valueType, rowData, columnProps, index } = config

  // 如果 valueType === text ，没必要多走一次 render
  if (
    (!valueType || ['textarea', 'text'].includes(valueType.toString()))
    // valueEnum 存在说明是个 select
    && !columnProps?.valueEnum
    && config.mode === 'read'
  ) {
    // 如果是''、null、undefined 显示 columnEmptyText
    return SHOW_EMPTY_TEXT_LIST.includes(text as any)
      ? config.columnEmptyText
      : (text as any)
  }

  if (typeof valueType === 'function' && rowData) {
    // 防止 valueType 是函数, 并且 text 是''、null、undefined 跳过显式设置的 columnEmptyText
    return cellRenderToFromItem({
      ...config,
      valueType: valueType(rowData, config.type) || 'text',
    } as any)
  }

  const columnKey = columnProps?.key || (columnProps?.dataIndex as any)?.toString()

  const dependencies = columnProps?.dependencies
    ? ([
        config.prefixName,
        config.prefixName ? index?.toString() : config.recordKey?.toString(),
        columnProps?.dependencies,
      ]
        .filter(Boolean)
        .flat(1) as string[])
    : []
  /**
   * 生成公用的 proField dom 配置
   */
  const proFieldProps: ProFormFieldProps = {
    valueEnum: runFunction<[T | undefined]>(columnProps?.valueEnum, rowData),
    request: columnProps?.request,
    dependencies: columnProps?.dependencies ? [dependencies] : undefined,
    originDependencies: columnProps?.dependencies
      ? [columnProps?.dependencies]
      : undefined,
    params: runFunction(columnProps?.params, rowData, columnProps),
    readonly: columnProps?.readonly,
    text:
      valueType === 'index' || valueType === 'indexBorder'
        ? config.index
        : text,
    mode: config.mode,
    formItemRender: undefined,
    valueType: valueType as ProFieldValueType,
    // @ts-expect-error record 透传给 proField
    record: rowData,
    proFieldProps: {
      emptyText: config.columnEmptyText,
      proFieldKey: columnKey ? `table-field-${columnKey}` : undefined,
    },
  }

  /** 只读模式直接返回就好了，不需要处理 formItem */
  if (config.mode !== 'edit') {
    return (
      <ProFormField
        mode="read"
        ignoreFormItem
        fieldProps={getFieldPropsOrFormItemProps(
          columnProps?.fieldProps,
          null,
          columnProps,
        )}
        {...proFieldProps}
      />
    )
  }
  return (
    <CellRenderFromItem
      key={config.recordKey ?? config.index}
      cellProps={{ ...config, proFieldProps }}
    />
  )
}

export default cellRenderToFromItem
