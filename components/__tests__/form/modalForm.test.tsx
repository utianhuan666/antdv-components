// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { Button } from 'antdv-next'
import { ModalForm } from '../../form/layouts'
import { ProFormText } from '@antdv/components'
import { mountAttached, waitFor } from '../testUtils'

describe('ModalForm', () => {
  it('opens from trigger and closes after successful submit', async () => {
    const onFinish = vi.fn().mockResolvedValue(true)
    const onOpenChange = vi.fn()

    const wrapper = mountAttached({
      render: () => (
        <ModalForm
          title="Create"
          trigger={<Button class="modal-trigger">Open</Button>}
          initialValues={{ name: 'modal' }}
          onFinish={onFinish}
          onOpenChange={onOpenChange}
        >
          <ProFormText label="Name" name="name" />
        </ModalForm>
      ),
    })

    expect(document.body.textContent).not.toContain('Name')

    await wrapper.find('.modal-trigger').trigger('click')
    await nextTick()

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(document.body.textContent).toContain('Name')

    document.body.querySelector<HTMLButtonElement>('.ant-modal .ant-btn-primary')?.click()

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ name: 'modal' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('supports submitter=false', async () => {
    mountAttached({
      render: () => (
        <ModalForm open submitter={false}>
          <ProFormText label="Name" name="name" />
        </ModalForm>
      ),
    })

    await nextTick()

    expect(document.body.querySelector('.ant-modal .ant-btn-primary')).toBeNull()
  })
})
