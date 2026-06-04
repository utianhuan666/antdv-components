import type { ButtonProps, ImageProps, UploadChangeParam, UploadFile, UploadProps } from 'antdv-next'
import type { FunctionalComponent } from 'vue'
import type { ProFormUploadButtonProps as BaseProFormUploadButtonProps } from '../../typing'
import { UploadOutlined } from '@antdv-next/icons'
import { Button, Image, Upload } from 'antdv-next'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
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

type UploadFileList = NonNullable<UploadProps['fileList']>

type ProFormUploadButtonComponentProps = BaseProFormUploadButtonProps<UploadProps> & {
  value?: UploadProps['fileList']
  fileList?: UploadProps['fileList']
  action?: UploadProps['action']
  accept?: UploadProps['accept']
  listType?: UploadProps['listType']
  buttonProps?: ButtonProps
  imageProps?: Omit<ImageProps, 'src'>
}

const uploadButtonPropNames = [
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
  'fileList',
  'action',
  'accept',
  'listType',
  'title',
  'icon',
  'max',
  'buttonProps',
  'imageProps',
  'disabled',
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

function getImagePreviewConfig(preview: ImageProps['preview']) {
  return typeof preview === 'object' && preview !== null ? preview : {}
}

const ProFormUploadButtonImpl = defineComponent({
  name: 'ProFormUploadButton',
  inheritAttrs: false,
  props: uploadButtonPropNames,
  emits: ['change'],
  setup(rawProps, { emit, attrs }) {
    const props = rawProps as unknown as ProFormUploadButtonComponentProps
    const fieldContext = useFieldContext()
    const editContext = useEditOrReadOnly()
    const previewOpen = ref(false)
    const previewImage = ref('')

    const finalReadonly = computed(() => isEnabledProp(props.proFieldProps?.readonly ?? editContext.readonly ?? props.readonly))
    const ignoreFormItem = computed(() => isEnabledProp(props.ignoreFormItem))

    const fileList = computed<UploadFileList>(() => {
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

    function applyInitialValue() {
      if (props.name === undefined || props.initialValue === undefined)
        return
      if (fileList.value.length === 0)
        setCellValue(props.initialValue as UploadProps['fileList'])
    }

    onMounted(applyInitialValue)
    watch(() => props.initialValue, applyInitialValue)

    async function handlePreview(file: UploadFile) {
      if (!file.url && !file.preview && file.originFileObj)
        file.preview = await getBase64(file.originFileObj)
      previewImage.value = file.url || file.preview || file.thumbUrl || ''
      previewOpen.value = Boolean(previewImage.value)
    }

    function handleChange(info: UploadChangeParam<UploadFile>) {
      const nextFileList = info.fileList || []
      setCellValue(nextFileList)
      emit('change', info)
      props.fieldProps?.onChange?.(info)
    }

    const renderUpload = () => {
      const { id: _id, onChange: _onChange, onPreview: _onPreview, ...uploadFieldProps } = props.fieldProps || {}
      const listType = props.listType || uploadFieldProps.listType || 'picture'
      const max = getNumberProp(props.max)
      const buttonProps = props.buttonProps || {}
      const imageProps = props.imageProps || {}
      const title = props.title ?? '单击上传'
      const icon = props.icon ?? <UploadOutlined />
      const showUploadButton = (max === undefined || fileList.value.length < max) && !finalReadonly.value
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
                      {icon}
                      {' '}
                      {title}
                    </span>
                  )
                : (
                    <Button disabled={isEnabledProp(props.disabled ?? uploadFieldProps.disabled)} {...buttonProps}>
                      {icon}
                      {title}
                    </Button>
                  )
              : null}
          </Upload>
          {previewImage.value
            ? (
                <Image
                  style={{ display: 'none' }}
                  {...imageProps}
                  preview={{
                    open: previewOpen.value,
                    onOpenChange: (open: boolean) => {
                      previewOpen.value = open
                      if (!open)
                        previewImage.value = ''
                    },
                    ...getImagePreviewConfig(imageProps.preview),
                  }}
                  src={previewImage.value}
                />
              )
            : null}
        </>
      )

      if (ignoreFormItem.value)
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

const ProFormUploadButton = ProFormUploadButtonImpl as unknown as FunctionalComponent<ProFormUploadButtonComponentProps>

export default ProFormUploadButton
