import type { ButtonProps, ImageProps, UploadFile, UploadProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { UploadOutlined } from '@antdv-next/icons'
import { Button, Image, Upload } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { omitKeys, renderFormItem } from '../_util'

type PickUploadProps = Pick<UploadProps, 'listType' | 'action' | 'accept' | 'fileList' | 'onChange'>

export type ProFormUploadButtonProps = ProFormFieldItemProps<UploadProps> & {
  icon?: any
  title?: any
  max?: number
  value?: UploadProps['fileList']
  buttonProps?: ButtonProps
  disabled?: ButtonProps['disabled']
  imageProps?: Omit<ImageProps, 'src'>
} & PickUploadProps

function getBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

const ProFormUploadButton = defineComponent({
  name: 'ProFormUploadButton',
  inheritAttrs: false,
  setup(props: ProFormUploadButtonProps, { attrs }) {
    const previewOpen = ref(false)
    const previewImage = ref('')
    const mode = computed(() => props.proFieldProps?.mode || props.mode || 'edit')

    return () => {
      const current = { ...attrs, ...props } as ProFormUploadButtonProps
      const value = current.fileList ?? current.value
      const uploadFieldProps = omitKeys(current.fieldProps, ['id'])
      const AnyUpload = Upload as any
      const showUploadButton = (current.max === undefined || !value || value.length < current.max) && mode.value !== 'read'
      const isPictureCard = (current.listType ?? uploadFieldProps.listType) === 'picture-card'
      const icon = current.icon ?? <UploadOutlined />
      const title = current.title ?? '单击上传'

      const dom = (
        <>
          <AnyUpload
            action={current.action}
            accept={current.accept}
            listType={current.listType || 'picture'}
            fileList={value}
            {...uploadFieldProps}
            name={uploadFieldProps.name ?? 'file'}
            onPreview={async (file: UploadFile) => {
              const target = file as UploadFile & { preview?: string, originFileObj?: Blob }
              if (!target.url && !target.preview && target.originFileObj)
                target.preview = await getBase64(target.originFileObj)
              previewImage.value = target.url || target.preview || ''
              previewOpen.value = Boolean(previewImage.value)
            }}
            onChange={(info: any) => {
              current.onChange?.(info)
              uploadFieldProps.onChange?.(info)
            }}
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
                    <Button disabled={current.disabled || uploadFieldProps.disabled} {...current.buttonProps}>
                      {icon}
                      {title}
                    </Button>
                  )
              : null}
          </AnyUpload>
          {previewImage.value
            ? (
                <Image
                  style={{ display: 'none' }}
                  {...current.imageProps}
                  preview={{
                    open: previewOpen.value,
                    onOpenChange: (open: boolean) => {
                      previewOpen.value = open
                      if (!open)
                        previewImage.value = ''
                    },
                    ...((current.imageProps?.preview as any) || {}),
                  }}
                  src={previewImage.value}
                />
              )
            : null}
        </>
      )

      return renderFormItem(current, dom)
    }
  },
}) as any

ProFormUploadButton.displayName = 'ProFormComponent'

export default ProFormUploadButton
