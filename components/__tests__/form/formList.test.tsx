import { ProForm, ProFormList, ProFormText } from '@antdv/components'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountAttached, waitFor } from '../testUtils'

describe('proForm List', () => {
  it('submits initial list values', async () => {
    const onFinish = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={onFinish}>
          <ProFormList
            name="users"
            label="用户信息"
            initialValue={[{ name: '1111', nickName: '1111' }]}
          >
            <ProFormText name="name" />
            <ProFormText name="nickName" />
          </ProFormList>
        </ProForm>
      ),
    })

    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({
        users: [{ name: '1111', nickName: '1111' }],
      })
    })
  })

  it('supports creatorRecord, copy, delete, and creator button position', async () => {
    const onFinish = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={onFinish}>
          <ProFormList
            name="users"
            creatorRecord={{ name: '2222' }}
            creatorButtonProps={{ position: 'top', creatorButtonText: '新建' }}
            initialValue={[{ name: '1111' }]}
          >
            <ProFormText name="name" />
          </ProFormList>
        </ProForm>
      ),
    })

    await nextTick()
    expect(wrapper.find('.ant-pro-form-list-creator-button-top').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-form-list-creator-button-bottom').exists()).toBe(false)

    await wrapper.find('.ant-pro-form-list-creator-button-top').trigger('click')
    await nextTick()
    await wrapper.findAll('.action-copy')[0]!.trigger('click')
    await nextTick()
    await wrapper.findAll('.action-remove')[1]!.trigger('click')
    await nextTick()
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({
        users: [{ name: '2222' }, { name: '2222' }],
      })
    })
  })

  it('exposes row action and actionRef', async () => {
    const onFinish = vi.fn()
    const actionRef: { value?: any } = {}
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={onFinish}>
          <ProFormList
            name="users"
            actionRef={actionRef}
            initialValue={[{ name: '1111', nickName: '1111' }]}
          >
            {{
              default: ({ index, action }: {
                index: number
                action: { setCurrentRowData: (data: Record<string, unknown>) => void }
              }) => (
                <div>
                  <ProFormText name="name" />
                  <ProFormText name="nickName" />
                  <button
                    id="set-row"
                    type="button"
                    onClick={() => action.setCurrentRowData({ name: `New Name${index}` })}
                  >
                    设置此项
                  </button>
                </div>
              ),
            }}
          </ProFormList>
        </ProForm>
      ),
    })

    await waitFor(() => {
      expect(actionRef.value?.get(0)?.name).toBe('1111')
    })

    await wrapper.find('#set-row').trigger('click')
    expect(actionRef.value?.get(0)?.name).toBe('New Name0')

    await actionRef.value.add({ name: '2222' })
    await nextTick()
    expect(actionRef.value.getList()[1].name).toBe('2222')

    await wrapper.find('.ant-btn-primary').trigger('click')
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({
        users: [
          { name: 'New Name0', nickName: '1111' },
          { name: '2222' },
        ],
      })
    })
  })

  it('uses behavior guard and min/max limits', async () => {
    const beforeAddRow = vi.fn(() => false)
    const beforeRemoveRow = vi.fn(() => false)
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormList
            name="users"
            min={1}
            max={1}
            actionGuard={{ beforeAddRow, beforeRemoveRow }}
            initialValue={[{ name: '1111' }]}
          >
            <ProFormText name="name" />
          </ProFormList>
        </ProForm>
      ),
    })

    await nextTick()

    expect(wrapper.find('.ant-pro-form-list-creator-button-bottom').exists()).toBe(false)
    expect(wrapper.find('.action-copy').exists()).toBe(false)
    expect(wrapper.find('.action-remove').exists()).toBe(false)

    expect(beforeAddRow).not.toHaveBeenCalled()
    expect(beforeRemoveRow).not.toHaveBeenCalled()
  })
})
