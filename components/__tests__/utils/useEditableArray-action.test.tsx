import { flushPromises, mount } from '@vue/test-utils'
import { Form } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { useEditableArray } from '../../utils/useEditableArray'

interface Rec { id: number, name: string }

function makeComp(opts: Record<string, any>) {
  return defineComponent({
    setup() {
      const dataSource = ref<Rec[]>([{ id: 1, name: 't1' }])
      const editableUtils = useEditableArray<Rec>({
        get dataSource() {
          return dataSource.value
        },
        setDataSource: (next: any) =>
          (dataSource.value = typeof next === 'function' ? next(dataSource.value) : next),
        getRowKey: (r: Rec) => r.id,
        childrenColumnName: undefined,
        ...opts,
      })
      ;(window as any).__eu = editableUtils
      return { dataSource, editableUtils }
    },
    render(this: any) {
      const actions = this.editableUtils.actionRender({ id: 1, name: 't1', index: 0 })
      return (
        <Form>
          <div data-testid="acts">{actions}</div>
        </Form>
      )
    },
  })
}

describe('useEditableArray - action (Popconfirm / loading)', () => {
  it('🧩 删除按钮应包裹 Popconfirm，点击触发器不立即调用 onDelete', async () => {
    const onDelete = vi.fn(async () => Promise.resolve())
    const wrapper = mount(makeComp({ onDelete }))
    const eu = (window as any).__eu
    eu.startEditable(1)
    await nextTick()

    const del = wrapper.findAll('a').find(a => a.text() === '删除')
    expect(del).toBeTruthy()

    // 点击删除触发器只打开确认气泡，不应立即删除
    await del!.trigger('click')
    await flushPromises()
    await nextTick()
    expect(onDelete).not.toHaveBeenCalled()

    // 确认气泡的主按钮触发真正的删除（getPopupContainer 渲染在 wrapper 内）
    const okBtn = wrapper.find('.ant-popconfirm-buttons .ant-btn-primary')
    expect(okBtn.exists()).toBe(true)
    await okBtn.trigger('click')
    await flushPromises()
    expect(onDelete).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('🧩 保存进行中应展示 loading 图标', async () => {
    let resolveSave: () => void = () => {}
    const onSave = vi.fn(() => new Promise<void>((resolve) => {
      resolveSave = resolve
    }))
    const wrapper = mount(makeComp({ onSave }))
    const eu = (window as any).__eu
    eu.startEditable(1)
    await nextTick()

    const acts = wrapper.get('[data-testid="acts"]')
    expect(acts.findAll('.anticon').length).toBe(0)

    const save = wrapper.findAll('a').find(a => a.text() === '保存')
    expect(save).toBeTruthy()
    await save!.trigger('click')
    await nextTick()

    // onSave 处于 pending 状态时应展示 loading 图标
    expect(acts.findAll('.anticon').length).toBeGreaterThan(0)

    resolveSave()
    await flushPromises()
    await nextTick()
    expect(acts.findAll('.anticon').length).toBe(0)

    wrapper.unmount()
  })
})
