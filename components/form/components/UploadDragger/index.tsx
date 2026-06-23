import type { UploadProps } from 'antdv-next'
import type { ProFormFieldItemProps } from '../../typing'
import { InboxOutlined } from '@antdv-next/icons'
import { UploadDragger } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { omitKeys, renderFormItem } from '../_util'

export type ProFormUploadDraggerProps = ProFormFieldItemProps<UploadProps> & {
  icon?: any
  title?: any
  description?: any
  max?: number
  value?: UploadProps['fileList']
  onChange?: UploadProps['onChange']
  action?: UploadProps['action']
  accept?: UploadProps['accept']
}

const ProFormUploadDragger = defineComponent({
  name: 'ProFormUploadDragger',
  inheritAttrs: false,
  setup(props: ProFormUploadDraggerProps, { attrs, slots }) {
    const mode = computed(() => props.proFieldProps?.mode || props.mode || 'edit')
    return () => {
      const current = { ...attrs, ...props } as ProFormUploadDraggerProps
      const uploadFieldProps = omitKeys(current.fieldProps, ['id'])
      const AnyUploadDragger = UploadDragger as any
      const value = current.fileList ?? current.value
      const showUploadButton = (current.max === undefined || !value || value.length < current.max)
        && mode.value !== 'read'
        && current.proFieldProps?.readonly !== true
      const icon = current.icon ?? <InboxOutlined />
      const title = current.title ?? '单击或拖动文件到此区域进行上传'
      const description = current.description ?? '支持单次或批量上传'

      const dom = (
        <AnyUploadDragger
          name="files"
          action={current.action}
          accept={current.accept}
          fileList={value}
          {...uploadFieldProps}
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            ...uploadFieldProps.style,
            display: !showUploadButton ? 'none' : uploadFieldProps.style?.display || 'flex',
          }}
          onChange={(info: any) => {
            current.onChange?.(info)
            uploadFieldProps.onChange?.(info)
          }}
        >
          <p class="ant-upload-drag-icon">{icon}</p>
          <p class="ant-upload-text">{title}</p>
          <p class="ant-upload-hint">{description}</p>
          {slots.default
            ? <div class="ant-upload-extra" style={{ padding: 16 }}>{slots.default()}</div>
            : null}
        </AnyUploadDragger>
      )

      return renderFormItem(current, dom)
    }
  },
}) as any

ProFormUploadDragger.displayName = 'ProFormComponent'

export default ProFormUploadDragger
