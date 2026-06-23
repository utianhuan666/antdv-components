import { Button } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import { ModalForm, ProFormText } from '../../form'
import { act, cleanup, fireEvent, render, waitFor, waitForWaitTime } from '../testUtils'

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.clearAllMocks()
})

describe('ModalForm', () => {
  it('📦 trigger will simulate onOpenChange', async () => {
    const fn = vi.fn()
    const wrapper = render(
      <ModalForm
        width={600}
        trigger={<Button id="new">新建</Button>}
        onOpenChange={(open: boolean) => fn(open)}
      >
        <ProFormText name="name" />
      </ModalForm>,
    )

    await act(async () => {
      const triggerButton = wrapper.getByText('新 建')
      fireEvent.click(triggerButton)
    })

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(true)
    })
  })

  it('📦 ModelForm get formRef when use request', async () => {
    const formRef = shallowRef<any>()
    const wrapper = render(
      <ModalForm
        open
        formRef={formRef}
        request={async (params: any) => {
          return params
        }}
        params={{
          name: 'test',
        }}
      >
        <ProFormText label="名称" name="name" />
      </ModalForm>,
    )

    await waitFor(() => {
      expect(wrapper.getByText('名称')).toBeTruthy()
    })

    expect(formRef.value?.getFieldValue('name')).toBe('test')
  })

  it('📦 form onFinish return true should close modal', async () => {
    const wrapper = render(
      <ModalForm
        width={600}
        trigger={<Button id="new">新建</Button>}
        onFinish={async () => {
          return true
        }}
      >
        <ProFormText name="name" />
      </ModalForm>,
    )

    await act(async () => {
      fireEvent.click(wrapper.getByText('新 建'))
    })

    await act(async () => {
      fireEvent.click(wrapper.getByText('确 认'))
    })

    await waitForWaitTime(100)
  })

  it('📦 ModalForm support submitter is false', async () => {
    const wrapper = render(
      <ModalForm
        width={600}
        submitter={false}
        trigger={<Button id="new">新建</Button>}
      >
        <ProFormText name="name" />
      </ModalForm>,
    )

    await act(async () => {
      fireEvent.click(wrapper.getByText('新 建'))
    })

    await waitFor(() => {
      expect(wrapper.queryByText('确 认')).toBeFalsy()
      expect(wrapper.queryByText('取 消')).toBeFalsy()
    })
  })
})
