// @ts-nocheck
import { Upload } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { ProForm, ProFormUploadButton, ProFormUploadDragger } from '@antdv/components'
import { mountAttached } from '../testUtils'

describe('ProFormUpload', () => {
  it('🏐 ProFormUploadButton support onChange', async () => {
    const onChange = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormUploadButton name="upload" fieldProps={{ onChange }} />
        </ProForm>
      ),
    })
    const uploads = wrapper.findAllComponents(Upload)
    const upload = uploads[uploads.length - 1]!
    const fileList = [{ uid: '1', name: 'a.png', status: 'done' }]

    upload.vm.$emit('change', { fileList })
    await nextTick()

    expect(onChange).toHaveBeenCalledWith({ fileList })
  })

  it('🏐 ProFormUploadButton hide when max', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormUploadButton
            name="upload"
            max={1}
            initialValue={[{ uid: '1', name: 'a.png', status: 'done' }]}
          />
        </ProForm>
      ),
    })

    await nextTick()

    expect(wrapper.text()).not.toContain('单击上传')
  })

  it('🏐 ProFormUploadDragger support children', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormUploadDragger name="upload">
            <span class="custom-upload-child">custom child</span>
          </ProFormUploadDragger>
        </ProForm>
      ),
    })

    expect(wrapper.find('.custom-upload-child').exists()).toBe(true)
  })
})
