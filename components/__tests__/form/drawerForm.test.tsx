import { Button } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { DrawerForm, ProFormText } from '../../form'
import { act, render, waitForWaitTime } from '../testUtils'

describe('DrawerForm', () => {
  it('📦 trigger will simulate onOpenChange', async () => {
    const fn = vi.fn()
    const wrapper = render(
      <DrawerForm
        width={600}
        trigger={<Button id="new">新建</Button>}
        onOpenChange={(open: boolean) => fn(open)}
      >
        <ProFormText name="name" />
      </DrawerForm>,
    )
    await waitForWaitTime(100)

    await act(async () => {
      ;(await wrapper.findByText('新 建')).click()
    })

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('📦 DrawerForm first no render items', async () => {
    const wrapper = render(
      <DrawerForm width={600} trigger={<Button id="new">新建</Button>}>
        <ProFormText
          name="name"
          fieldProps={{
            id: 'test',
          }}
        />
      </DrawerForm>,
    )
    await waitForWaitTime(100)

    expect(wrapper.baseElement.querySelector('input#test')).toBeFalsy()

    await act(async () => {
      ;(await wrapper.findByText('新 建')).click()
    })

    await waitForWaitTime(200)
    expect(wrapper.baseElement.querySelector('input#test')).toBeTruthy()
  })

  it('📦 DrawerForm first render items', async () => {
    const wrapper = render(
      <DrawerForm
        width={600}
        drawerProps={{
          forceRender: true,
        }}
      >
        <ProFormText
          name="name"
          fieldProps={{
            id: 'test',
          }}
        />
      </DrawerForm>,
    )
    await waitForWaitTime(100)
    expect(wrapper.baseElement.querySelector('input#test')).toBeTruthy()
  })

  it('📦 DrawerForm support submitter is false', async () => {
    const wrapper = render(
      <DrawerForm open trigger={<Button id="new">新建</Button>} submitter={false}>
        <ProFormText name="name" />
      </DrawerForm>,
    )
    await waitForWaitTime(100)

    expect(
      wrapper.baseElement.querySelector('.ant-drawer-footer'),
    ).toBeFalsy()
  })
})
