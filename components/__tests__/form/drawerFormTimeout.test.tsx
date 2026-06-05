import { ProFormText } from '@antdv/components'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { DrawerForm } from '../../form/layouts'
import { mountAttached, waitFor } from '../testUtils'

function getDrawerSubmitButton() {
  return document.body.querySelector<HTMLButtonElement>('.ant-drawer .ant-btn-primary')
}

function getDrawerCancelButton() {
  return document.body.querySelector<HTMLButtonElement>('.ant-drawer .ant-btn-default')
}

describe('drawerForm submitTimeout', () => {
  it('📦 DrawerForm submitTimeout is number will disabled close button when submit', async () => {
    const onClose = vi.fn()
    let resolveFinish: ((value: boolean) => void) | undefined

    mountAttached({
      render: () => (
        <DrawerForm
          open
          submitTimeout={3000}
          drawerProps={{ onClose }}
          onFinish={() => new Promise<boolean>(resolve => (resolveFinish = resolve))}
        >
          <ProFormText name="text" />
        </DrawerForm>
      ),
    })

    await nextTick()
    getDrawerSubmitButton()?.click()
    await nextTick()

    await waitFor(() => {
      expect(getDrawerCancelButton()?.disabled).toBe(true)
    })

    getDrawerCancelButton()?.click()
    expect(onClose).not.toHaveBeenCalled()

    resolveFinish?.(true)
    await nextTick()

    await waitFor(() => {
      expect(getDrawerCancelButton()?.disabled).toBe(false)
    })

    getDrawerCancelButton()?.click()
    expect(onClose).toHaveBeenCalled()
  })

  it('📦 DrawerForm submitTimeout is null no disable close button when submit', async () => {
    const onClose = vi.fn()

    mountAttached({
      render: () => (
        <DrawerForm
          open
          drawerProps={{ onClose }}
          onFinish={() => new Promise<boolean>(() => {})}
        >
          <ProFormText name="text" />
        </DrawerForm>
      ),
    })

    await nextTick()
    getDrawerSubmitButton()?.click()
    await nextTick()

    expect(getDrawerCancelButton()?.disabled).toBe(false)

    getDrawerCancelButton()?.click()
    expect(onClose).toHaveBeenCalled()
  })
})
