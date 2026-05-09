import type { PropType, VNodeChild } from 'vue'
import type { NamePath, ProFormUploadDraggerProps } from '../../typing'
import { InboxOutlined } from '@antdv-next/icons'
import { Upload } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useEditOrReadOnly } from '../../BaseForm'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

const UploadDragger = (Upload as any).Dragger

const ProFormUploadDragger = defineComponent({
  name: 'ProFormUploadDragger',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, default: undefined },
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    tooltip: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    rules: { type: Array as PropType<any[]>, default: undefined },
    required: { type: Boolean, default: undefined },
    initialValue: { type: null as unknown as PropType<ProFormUploadDraggerProps['initialValue']>, default: undefined },
    transform: { type: Function as PropType<NonNullable<ProFormUploadDraggerProps['transform']>>, default: undefined },
    convertValue: { type: Function as PropType<NonNullable<ProFormUploadDraggerProps['convertValue']>>, default: undefined },
    formItemProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    value: { type: Array as PropType<any[]>, default: undefined },
    action: { type: [String, Function] as PropType<any>, default: undefined },
    accept: { type: String, default: undefined },
    title: { type: [String, Number, Object] as PropType<VNodeChild>, default: '单击或拖动文件到此区域进行上传' },
    icon: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    description: { type: [String, Number, Object] as PropType<VNodeChild>, default: '支持单次或批量上传' },
    max: { type: Number, default: undefined },
    readonly: { type: Boolean, default: undefined },
    proFieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    ignoreFormItem: { type: Boolean, default: false },
  },
  emits: ['change'],
  setup(props, { emit, slots, attrs }) {
    const fieldContext = useFieldContext()
    const editContext = useEditOrReadOnly()

    const finalReadonly = computed(() => Boolean(props.proFieldProps?.readonly ?? editContext.readonly ?? props.readonly))

    const fileList = computed<any[]>(() => {
      if (props.value)
        return props.value
      if (props.name === undefined)
        return []
      const path = Array.isArray(props.name) ? props.name : [props.name]
      const value = path.reduce<any>((acc, key) => acc?.[key], fieldContext.model || {})
      return Array.isArray(value) ? value : []
    })

    function setCellValue(value: any[]) {
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

    function handleChange(info: Record<string, any>) {
      const nextFileList = info.fileList || []
      setCellValue(nextFileList)
      emit('change', info)
      props.fieldProps?.onChange?.(info)
    }

    const renderDragger = () => {
      const { id: _id, onChange: _onChange, style, ...uploadFieldProps } = props.fieldProps || {}
      const showUploadButton = (props.max === undefined || fileList.value.length < props.max) && !finalReadonly.value
      const draggerNode = (
        <UploadDragger
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
          <p class="ant-upload-drag-icon">{props.icon ?? <InboxOutlined />}</p>
          <p class="ant-upload-text">{props.title}</p>
          <p class="ant-upload-hint">{props.description}</p>
          {slots.default?.()?.length
            ? <div class="ant-upload-extra" style={{ padding: '16px' }}>{slots.default?.()}</div>
            : null}
        </UploadDragger>
      )

      if (props.ignoreFormItem)
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

export default ProFormUploadDragger
