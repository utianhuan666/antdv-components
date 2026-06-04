// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { Button } from 'antdv-next'
import { DrawerForm } from '../../form/layouts'
import { ProFormText } from '@antdv/components'
import { mountAttached, waitFor } from '../testUtils'

describe('DrawerForm', () => {
  it('opens from trigger and closes after successful submit', async () => {
    const onFinish = vi.fn().mockResolvedValue(true)
    const onOpenChange = vi.fn()

    const wrapper = mountAttached({
      render: () => (
        <DrawerForm
          title="Create"
          trigger={<Button class="drawer-trigger">Open</Button>}
          initialValues={{ name: 'drawer' }}
          onFinish={onFinish}
          onOpenChange={onOpenChange}
        >
          <ProFormText label="Name" name="name" />
        </DrawerForm>
      ),
    })

    expect(document.body.textContent).not.toContain('Name')

    await wrapper.find('.drawer-trigger').trigger('click')
    await nextTick()

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(document.body.textContent).toContain('Name')

    document.body.querySelector<HTMLButtonElement>('.ant-drawer .ant-btn-primary')?.click()

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ name: 'drawer' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('supports submitter=false', async () => {
    mountAttached({
      render: () => (
        <DrawerForm open submitter={false}>
          <ProFormText label="Name" name="name" />
        </DrawerForm>
      ),
    })

    await nextTick()

    expect(document.body.querySelector('.ant-drawer .ant-btn-primary')).toBeNull()
  })
})
