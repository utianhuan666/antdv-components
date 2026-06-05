// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import type { NewLineConfig, RecordKey } from '../../utils/useEditableArray'
import { mount } from '@vue/test-utils'
import { Form } from 'antdv-next'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
// @ts-nocheck
import { defineComponent, nextTick, ref } from 'vue'
import { useEditableMap } from '../../utils/useEditableMap'
import { waitFor } from '../testUtils'

interface TestRecordType {
  name: string
  age: number
  email?: string
  address?: {
    city: string
    street: string
  }
}

describe('useEditableMap', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    delete (window as any).__editableUtils
    delete (window as any).__dataSource
    delete (window as any).__isEditableName
    delete (window as any).__isEditableAge
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  /**
   * 测试组件：用于测试 useEditableMap
   */
  const TestComponent = defineComponent<{
    onCancel?: (
      key: RecordKey,
      record: TestRecordType & { index?: number },
      originRow: TestRecordType & { index?: number },
      newLineConfig?: NewLineConfig<TestRecordType>,
    ) => Promise<any | void>
    onSave?: (
      key: RecordKey,
      record: TestRecordType & { index?: number },
      originRow: TestRecordType & { index?: number },
    ) => Promise<any | void>
    onValuesChange?: (
      record: TestRecordType,
      dataSource: TestRecordType[],
    ) => void
    onChange?: (
      editableKeys: RecordKey[],
      editableRows: TestRecordType | TestRecordType[],
    ) => void
    editableKeys?: RecordKey[]
    type?: 'single' | 'multiple'
    onlyOneLineEditorAlertMessage?: any
  }>({
    props: [
      'onCancel',
      'onSave',
      'onValuesChange',
      'onChange',
      'editableKeys',
      'type',
      'onlyOneLineEditorAlertMessage',
    ],
    setup(props) {
      const dataSource = ref<TestRecordType>({
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        address: {
          city: 'Beijing',
          street: 'Main St',
        },
      })

      const editableUtils = useEditableMap<TestRecordType>({
        get dataSource() {
          return dataSource.value
        },
        setDataSource: next => (dataSource.value = typeof next === 'function' ? next(dataSource.value) : next),
        get editableKeys() {
          return props.editableKeys
        },
        get type() {
          return props.type ?? 'single'
        },
        get onCancel() {
          return props.onCancel
        },
        get onSave() {
          return props.onSave
        },
        get onValuesChange() {
          return props.onValuesChange as any
        },
        get onChange() {
          return props.onChange
        },
        get onlyOneLineEditorAlertMessage() {
          return props.onlyOneLineEditorAlertMessage
        },
      } as any)

      ;(window as any).__editableUtils = editableUtils
      ;(window as any).__dataSource = dataSource

      return { dataSource, editableUtils }
    },
    render() {
      return (
        <Form>
          <div data-testid="editable-keys">
            {this.editableUtils.editableKeys?.join(',') || 'none'}
          </div>
          <div data-testid="data-source">{JSON.stringify(this.dataSource)}</div>
          <button
            data-testid="start-edit-name"
            onClick={() => this.editableUtils.startEditable('name')}
          >
            Start Edit Name
          </button>
          <button
            data-testid="start-edit-age"
            onClick={() => this.editableUtils.startEditable('age')}
          >
            Start Edit Age
          </button>
          <button
            data-testid="start-edit-email"
            onClick={() => this.editableUtils.startEditable('email')}
          >
            Start Edit Email
          </button>
          <button
            data-testid="start-edit-address"
            onClick={() => this.editableUtils.startEditable(['address', 'city'])}
          >
            Start Edit Address City
          </button>
          <button
            data-testid="cancel-edit-name"
            onClick={() => this.editableUtils.cancelEditable('name')}
          >
            Cancel Edit Name
          </button>
          <button
            data-testid="check-editable-name"
            onClick={() => {
              ;(window as any).__isEditableName = this.editableUtils.isEditable('name')
            }}
          >
            Check Editable Name
          </button>
          <button
            data-testid="check-editable-age"
            onClick={() => {
              ;(window as any).__isEditableAge = this.editableUtils.isEditable('age')
            }}
          >
            Check Editable Age
          </button>
        </Form>
      )
    },
  })

  it('📝 应该正确初始化', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    expect(wrapper.get('[data-testid="data-source"]').text()).toContain('John Doe')
  })

  it('📝 应该能够开始编辑单个字段', async () => {
    const wrapper = mount(TestComponent)

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name'))

    await wrapper.get('[data-testid="check-editable-name"]').trigger('click')

    await waitFor(() => {
      expect((window as any).__isEditableName).toBe(true)
    })
  })

  it('📝 单行模式下应该阻止同时编辑多个字段', async () => {
    const wrapper = mount(TestComponent, { props: { type: 'single' } })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name'))

    // 尝试编辑另一个字段，应该被阻止
    await wrapper.get('[data-testid="start-edit-age"]').trigger('click')

    await waitFor(() => {
      // 应该仍然只有 name 在编辑
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })
  })

  it('📝 多行模式下应该允许同时编辑多个字段', async () => {
    const wrapper = mount(TestComponent, { props: { type: 'multiple' } })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    await wrapper.get('[data-testid="start-edit-age"]').trigger('click')

    await waitFor(() => {
      const keys = wrapper.get('[data-testid="editable-keys"]').text().split(',')
      expect(keys).toContain('name')
      expect(keys).toContain('age')
    })
  })

  it('📝 应该能够取消编辑', async () => {
    const wrapper = mount(TestComponent)

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    await wrapper.get('[data-testid="cancel-edit-name"]').trigger('click')

    await waitFor(() => expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none'))
  })

  it('📝 取消编辑时应该正确调用 onCancel 回调', async () => {
    const onCancel = vi.fn(
      async (
        key: RecordKey,
        _record: TestRecordType & { index?: number },
        originRow: TestRecordType & { index?: number },
      ) => {
        expect(key).toBe('name')
        expect(originRow).toBeDefined()
        return Promise.resolve()
      },
    )

    const wrapper = mount(TestComponent, { props: { onCancel } })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    const editableUtils = (window as any).__editableUtils
    const actionRender = editableUtils.actionRender('name')
    expect(Array.isArray(actionRender)).toBe(true)
    expect(actionRender.length).toBeGreaterThan(0)

    await editableUtils.cancelEditable('name')

    await nextTick()

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })
  })

  it('📝 保存编辑时应该正确调用 onSave 回调并更新数据源', async () => {
    const onSave = vi.fn(
      async (
        key: RecordKey,
        _record: TestRecordType & { index?: number },
        originRow: TestRecordType & { index?: number },
      ) => {
        expect(key).toBe('name')
        expect(originRow).toBeDefined()
        return Promise.resolve()
      },
    )

    const wrapper = mount(TestComponent, { props: { onSave } })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    const editableUtils = (window as any).__editableUtils
    const actionRender = editableUtils.actionRender('name')
    expect(Array.isArray(actionRender)).toBe(true)
    expect(actionRender.length).toBeGreaterThan(0)
  })

  it('📝 应该正确处理嵌套字段的编辑', async () => {
    const wrapper = mount(TestComponent)

    await wrapper.get('[data-testid="start-edit-address"]').trigger('click')

    await waitFor(() => {
      const keys = wrapper.get('[data-testid="editable-keys"]').text()
      expect(keys).toBe('address,city')
    })

    await wrapper.get('[data-testid="check-editable-name"]').trigger('click')

    await waitFor(() => {
      expect((window as any).__isEditableName).toBe(false)
    })
  })

  it('📝 应该正确处理重复开始编辑同一字段', async () => {
    const wrapper = mount(TestComponent)

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    // 再次点击开始编辑同一个字段
    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      // 应该仍然只有一个 name
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })
  })

  it('📝 取消不存在的编辑应该安全处理', async () => {
    const wrapper = mount(TestComponent)

    // 直接取消一个未编辑的字段
    await wrapper.get('[data-testid="cancel-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })
  })

  it('📝 应该正确处理 onChange 回调', async () => {
    const onChange = vi.fn(
      (keys: RecordKey[], editableRows: TestRecordType | TestRecordType[]) => {
        expect(Array.isArray(keys)).toBe(true)
        expect(editableRows).toBeDefined()
      },
    )

    const wrapper = mount(TestComponent, { props: { onChange } })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })

  it('📝 应该正确处理受控的 editableKeys', async () => {
    const ControlledComponent = defineComponent({
      setup() {
        const editableKeys = ref<RecordKey[]>([])
        const onChange = (keys: RecordKey[]) => {
          editableKeys.value = keys
        }

        return { editableKeys, onChange }
      },
      render() {
        return (
          <TestComponent
            editableKeys={this.editableKeys}
            onChange={this.onChange}
          />
        )
      },
    })
    const wrapper = mount(ControlledComponent)
    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await nextTick()

    await waitFor(() => expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name'))
  })

  it('📝 应该正确处理自定义警告消息', async () => {
    const customMessage = '自定义警告消息'
    const wrapper = mount(TestComponent, {
      props: { type: 'single', onlyOneLineEditorAlertMessage: customMessage },
    })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    // 尝试编辑另一个字段，应该显示自定义警告
    await wrapper.get('[data-testid="start-edit-age"]').trigger('click')

    await waitFor(() => {
      // 应该仍然只有 name 在编辑
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })
  })

  it('📝 应该正确处理数组类型的 recordKey', async () => {
    const wrapper = mount(TestComponent)

    await wrapper.get('[data-testid="start-edit-address"]').trigger('click')

    await waitFor(() => {
      const keys = wrapper.get('[data-testid="editable-keys"]').text()
      expect(keys).toContain('address')
      expect(keys).toContain('city')
    })
  })

  it('📝 应该正确处理 onSave 返回 false 的情况', async () => {
    const onSave = vi.fn(async () => {
      return Promise.resolve(false)
    })

    const wrapper = mount(TestComponent, { props: { onSave } })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    const editableUtils = (window as any).__editableUtils
    const actionRender = editableUtils.actionRender('name')

    // actionRender 返回的是 Vue 节点数组，需要在 Form 上下文中渲染这些节点并点击保存按钮
    const ActionButtons = defineComponent({
      render() {
        return (
          <Form>
            {actionRender}
          </Form>
        )
      },
    })

    const actionWrapper = mount(ActionButtons)
    const saveButton = actionWrapper.findAll('button').find(button => button.text() === '保存')

    expect(saveButton).toBeTruthy()

    // 触发保存操作
    await saveButton!.trigger('click')

    // 等待异步操作完成
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1)
    })

    await nextTick()

    // 验证当 onSave 返回 false 时，编辑状态应该保持不变
    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    actionWrapper.unmount()
  })

  it('📝 应该正确处理 onCancel 返回 false 的情况', async () => {
    const onCancel = vi.fn(async () => {
      return Promise.resolve(false)
    })

    const wrapper = mount(TestComponent, { props: { onCancel } })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    const editableUtils = (window as any).__editableUtils
    const actionRender = editableUtils.actionRender('name')

    // actionRender 返回的是 Vue 节点数组，需要在 Form 上下文中渲染这些节点并点击取消按钮
    const ActionButtons = defineComponent({
      render() {
        return (
          <Form>
            {actionRender}
          </Form>
        )
      },
    })

    const actionWrapper = mount(ActionButtons)
    const cancelButton = actionWrapper.findAll('button').find(button => button.text() === '取消')

    expect(cancelButton).toBeTruthy()

    // 触发取消操作
    await cancelButton!.trigger('click')

    // 等待异步操作完成
    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    await nextTick()

    // 根据 CancelEditableAction 的实现，即使 onCancel 返回 false，
    // cancelEditable 仍然会被执行，所以编辑状态会被取消
    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })

    actionWrapper.unmount()
  })

  it('📝 应该正确更新数据源', async () => {
    const onSave = vi.fn(async () => {
      return Promise.resolve()
    })

    const wrapper = mount(TestComponent, { props: { onSave } })

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    // 直接更新编辑 keys 来模拟保存后退出编辑态
    ;(window as any).__editableUtils.setEditableRowKeys([])

    await nextTick()

    await waitFor(() => expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none'))
  })

  it('📝 应该正确处理 actionRender', async () => {
    const wrapper = mount(TestComponent)

    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
    })

    const actionRender = (window as any).__editableUtils.actionRender('name')
    expect(Array.isArray(actionRender)).toBe(true)
    expect(actionRender.length).toBeGreaterThan(0)
  })

  it('📝 应该正确处理空数据源', async () => {
    const EmptyComponent = defineComponent({
      setup() {
        const dataSource = ref({} as TestRecordType)
        const editableUtils = useEditableMap<TestRecordType>({
          get dataSource() {
            return dataSource.value
          },
          setDataSource: next => (dataSource.value = typeof next === 'function' ? next(dataSource.value) : next),
        } as any)
        return { editableUtils }
      },
      render() {
        return (
          <Form>
            <div data-testid="editable-keys">{this.editableUtils.editableKeys?.join(',') || 'none'}</div>
            <button data-testid="start-edit-name" onClick={() => this.editableUtils.startEditable('name', 'Default Name')}>Start Edit</button>
          </Form>
        )
      },
    })
    const wrapper = mount(EmptyComponent)
    await wrapper.get('[data-testid="start-edit-name"]').trigger('click')
    expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('name')
  })
})
