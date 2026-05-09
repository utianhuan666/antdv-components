import type { PropType, VNodeChild } from 'vue'
import type { NamePath, ProFormUploadButtonProps } from '../../typing'
import { UploadOutlined } from '@antdv-next/icons'
import { Button, Image, Upload } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { useEditOrReadOnly } from '../../BaseForm'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

function getBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}

const ProFormUploadButton = defineComponent({
  name: 'ProFormUploadButton',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, default: undefined },
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    tooltip: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    rules: { type: Array as PropType<any[]>, default: undefined },
    required: { type: Boolean, default: undefined },
    initialValue: { type: null as unknown as PropType<ProFormUploadButtonProps['initialValue']>, default: undefined },
    transform: { type: Function as PropType<NonNullable<ProFormUploadButtonProps['transform']>>, default: undefined },
    convertValue: { type: Function as PropType<NonNullable<ProFormUploadButtonProps['convertValue']>>, default: undefined },
    formItemProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    value: { type: Array as PropType<any[]>, default: undefined },
    fileList: { type: Array as PropType<any[]>, default: undefined },
    action: { type: [String, Function] as PropType<any>, default: undefined },
    accept: { type: String, default: undefined },
    listType: { type: String, default: 'picture' },
    title: { type: [String, Number, Object] as PropType<VNodeChild>, default: '单击上传' },
    icon: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    max: { type: Number, default: undefined },
    buttonProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    imageProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    disabled: { type: Boolean, default: undefined },
    readonly: { type: Boolean, default: undefined },
    proFieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    ignoreFormItem: { type: Boolean, default: false },
  },
  emits: ['change'],
  setup(props, { emit, attrs }) {
    const fieldContext = useFieldContext()
    const editContext = useEditOrReadOnly()
    const previewOpen = ref(false)
    const previewImage = ref('')

    const finalReadonly = computed(() => Boolean(props.proFieldProps?.readonly ?? editContext.readonly ?? props.readonly))

    const fileList = computed<any[]>(() => {
      if (props.fileList)
        return props.fileList
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

    async function handlePreview(file: Record<string, any>) {
      if (!file.url && !file.preview && file.originFileObj)
        file.preview = await getBase64(file.originFileObj)
      previewImage.value = file.url || file.preview || file.thumbUrl || ''
      previewOpen.value = Boolean(previewImage.value)
    }

    function handleChange(info: Record<string, any>) {
      const nextFileList = info.fileList || []
      setCellValue(nextFileList)
      emit('change', info)
      props.fieldProps?.onChange?.(info)
    }

    const renderUpload = () => {
      const { id: _id, onChange: _onChange, onPreview: _onPreview, ...uploadFieldProps } = props.fieldProps || {}
      const listType = props.listType || uploadFieldProps.listType || 'picture'
      const showUploadButton = (props.max === undefined || fileList.value.length < props.max) && !finalReadonly.value
      const isPictureCard = listType === 'picture-card'

      const uploadNode = (
        <>
          <Upload
            {...attrs}
            {...uploadFieldProps}
            action={props.action ?? uploadFieldProps.action}
            accept={props.accept ?? uploadFieldProps.accept}
            listType={listType}
            fileList={fileList.value}
            name={uploadFieldProps.name ?? 'file'}
            onPreview={handlePreview}
            onChange={handleChange}
          >
            {showUploadButton
              ? isPictureCard
                ? (
                    <span>
                      {props.icon ?? <UploadOutlined />}
                      {' '}
                      {props.title}
                    </span>
                  )
                : (
                    <Button disabled={props.disabled ?? uploadFieldProps.disabled} {...props.buttonProps}>
                      {props.icon ?? <UploadOutlined />}
                      {props.title}
                    </Button>
                  )
              : null}
          </Upload>
          {previewImage.value
            ? (
                <Image
                  style={{ display: 'none' }}
                  {...props.imageProps}
                  preview={{
                    open: previewOpen.value,
                    onOpenChange: (open: boolean) => {
                      previewOpen.value = open
                      if (!open)
                        previewImage.value = ''
                    },
                    ...(props.imageProps.preview || {}),
                  }}
                  src={previewImage.value}
                />
              )
            : null}
        </>
      )

      if (props.ignoreFormItem)
        return uploadNode

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
          {uploadNode}
        </ProFormItem>
      )
    }

    return renderUpload
  },
})

export default ProFormUploadButton
