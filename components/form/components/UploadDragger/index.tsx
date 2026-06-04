import type { UploadDraggerProps as AntUploadDraggerProps, UploadChangeParam, UploadFile, UploadProps } from 'antdv-next'
import type { FunctionalComponent, VNode } from 'vue'
import type { ProFormUploadDraggerProps as BaseProFormUploadDraggerProps } from '../../typing'
import { InboxOutlined } from '@antdv-next/icons'
import { UploadDragger } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useEditOrReadOnly } from '../../BaseForm'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

const UploadDraggerComponent = UploadDragger as unknown as (
  props: AntUploadDraggerProps & {
    style?: Record<string, unknown>
    onChange?: (info: UploadChangeParam<UploadFile>) => void
  },
) => VNode

type UploadFileList = NonNullable<UploadProps['fileList']>

type ProFormUploadDraggerComponentProps = BaseProFormUploadDraggerProps<AntUploadDraggerProps> & {
  value?: UploadProps['fileList']
  action?: UploadProps['action']
  accept?: UploadProps['accept']
}

const uploadDraggerPropNames = [
  'name',
  'label',
  'tooltip',
  'rules',
  'required',
  'initialValue',
  'transform',
  'convertValue',
  'formItemProps',
  'fieldProps',
  'value',
  'action',
  'accept',
  'title',
  'icon',
  'description',
  'max',
  'readonly',
  'proFieldProps',
  'ignoreFormItem',
]

function isEnabledProp(value: unknown) {
  return value === true || value === ''
}

function getNumberProp(value: unknown) {
  if (value === undefined)
    return undefined
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? undefined : numberValue
}

const ProFormUploadDraggerImpl = defineComponent({
  name: 'ProFormUploadDragger',
  inheritAttrs: false,
  props: uploadDraggerPropNames,
  emits: ['change'],
  setup(rawProps, { emit, slots, attrs }) {
    const props = rawProps as unknown as ProFormUploadDraggerComponentProps
    const fieldContext = useFieldContext()
    const editContext = useEditOrReadOnly()

    const finalReadonly = computed(() => isEnabledProp(props.proFieldProps?.readonly ?? editContext.readonly ?? props.readonly))
    const ignoreFormItem = computed(() => isEnabledProp(props.ignoreFormItem))

    const fileList = computed<UploadFileList>(() => {
      if (props.value)
        return props.value
      if (props.name === undefined)
        return []
      const path = Array.isArray(props.name) ? props.name : [props.name]
      const value = path.reduce<any>((acc, key) => acc?.[key], fieldContext.model || {})
      return Array.isArray(value) ? value : []
    })

    function setCellValue(value: UploadProps['fileList']) {
      if (props.name === undefined)
        return
      const path = Array.isArray(props.name) ? props.name : [props.name]
      const last = path[path.length - 1]
      if (last === undefined)
        return
      const parent = path.slice(0, -1).reduce<Record<string, any>>((acc, key) => {
        if (!acc[key] || typeof acc[key] !== 'object')
          acc[key] = {}
        return acc[key]
      }, fieldContext.model || {})
      parent[last] = value
    }

    function handleChange(info: UploadChangeParam<UploadFile>) {
      const nextFileList = info.fileList || []
      setCellValue(nextFileList)
      emit('change', info)
      props.fieldProps?.onChange?.(info)
    }

    const renderDragger = () => {
      const { id: _id, onChange: _onChange, style, ...uploadFieldProps } = props.fieldProps || {}
      const max = getNumberProp(props.max)
      const showUploadButton = (max === undefined || fileList.value.length < max) && !finalReadonly.value
      const title = props.title ?? '单击或拖动文件到此区域进行上传'
      const icon = props.icon ?? <InboxOutlined />
      const description = props.description ?? '支持单次或批量上传'
      const draggerNode = (
        <UploadDraggerComponent
          {...attrs}
          {...uploadFieldProps}
          name={uploadFieldProps.name ?? 'files'}
          action={props.action ?? uploadFieldProps.action}
          accept={props.accept ?? uploadFieldProps.accept}
          fileList={fileList.value}
          onChange={handleChange}
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            ...(style || {}),
            display: showUploadButton ? style?.display || 'flex' : 'none',
          }}
        >
          <p class="ant-upload-drag-icon">{icon}</p>
          <p class="ant-upload-text">{title}</p>
          <p class="ant-upload-hint">{description}</p>
          {slots.default?.()?.length
            ? <div class="ant-upload-extra" style={{ padding: '16px' }}>{slots.default?.()}</div>
            : null}
        </UploadDraggerComponent>
      )

      if (ignoreFormItem.value)
        return draggerNode

      return (
        <ProFormItem
          name={props.name}
          label={props.label}
          tooltip={props.tooltip}
          rules={props.rules}
          required={props.required}
          initialValue={props.initialValue}
          transform={props.transform}
          convertValue={props.convertValue}
          formItemProps={{
            ...(fieldContext.formItemProps || {}),
            ...(props.formItemProps || {}),
          }}
        >
          {draggerNode}
        </ProFormItem>
      )
    }

    return renderDragger
  },
})

const ProFormUploadDragger = ProFormUploadDraggerImpl as unknown as FunctionalComponent<ProFormUploadDraggerComponentProps>

export default ProFormUploadDragger
