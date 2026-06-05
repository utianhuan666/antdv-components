// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import type { NewLineConfig, RecordKey } from '../../utils/useEditableArray'
import { flushPromises, mount } from '@vue/test-utils'
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
import { defineComponent, ref } from 'vue'
import {

  useEditableArray,
} from '../../utils/useEditableArray'
import { waitFor } from '../testUtils'

interface TestRecordType {
  id: number
  name: string
  value?: string
}

async function runTimers() {
  vi.runAllTimers()
  await flushPromises()
}

describe('useEditableArray - Cancel Operation', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    delete (window as any).__editableUtils
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  /**
   * 测试组件：用于测试取消操作
   */
  const TestComponent = defineComponent<{
    onCancel?: (
      key: RecordKey,
      record: TestRecordType & { index?: number },
      originRow: TestRecordType & { index?: number },
      newLineConfig?: NewLineConfig<TestRecordType>,
    ) => Promise<any | void>
    onDelete?: (
      key: RecordKey,
      row: TestRecordType & { index?: number },
    ) => Promise<any | void>
    onSave?: (
      key: RecordKey,
      record: TestRecordType & { index?: number },
      originRow: TestRecordType & { index?: number },
      newLineConfig?: NewLineConfig<TestRecordType>,
    ) => Promise<any | void>
    onValuesChange?: (
      record: TestRecordType,
      dataSource: TestRecordType[],
    ) => void
    tableName?: string
  }>({
    props: ['onCancel', 'onDelete', 'onSave', 'onValuesChange', 'tableName'],
    setup(props) {
      const dataSource = ref<TestRecordType[]>([
        { id: 1, name: 'test1', value: 'value1' },
        { id: 2, name: 'test2', value: 'value2' },
      ])

      const editableUtils = useEditableArray<TestRecordType>({
        get dataSource() {
          return dataSource.value
        },
        setDataSource: next => (dataSource.value = typeof next === 'function' ? next(dataSource.value) : next),
        getRowKey: record => record.id,
        childrenColumnName: undefined,
        onCancel: props.onCancel,
        onDelete: props.onDelete,
        onSave: props.onSave,
        onValuesChange: props.onValuesChange,
        tableName: props.tableName,
      })

      // 暴露到 window 上以便测试访问
      ;(window as any).__editableUtils = editableUtils

      return { dataSource, editableUtils }
    },
    render() {
      return (
        <Form>
          <div data-testid="editable-keys">
            {this.editableUtils.editableKeys?.join(',') || 'none'}
          </div>
          <button
            data-testid="start-edit-1"
            onClick={() => this.editableUtils.startEditable(1)}
          >
            Start Edit 1
          </button>
          <button
            data-testid="start-edit-2"
            onClick={() => this.editableUtils.startEditable(2)}
          >
            Start Edit 2
          </button>
          <button
            data-testid="cancel-edit-1"
            onClick={() => this.editableUtils.cancelEditable(1)}
          >
            Cancel Edit 1
          </button>
          <button
            data-testid="cancel-edit-2"
            onClick={() => this.editableUtils.cancelEditable(2)}
          >
            Cancel Edit 2
          </button>
          <div data-testid="data-source">
            {this.dataSource.map(item => `${item.id}:${item.name}`).join(',')}
          </div>
        </Form>
      )
    },
  })

  it('📝 取消编辑时应该正确调用 onCancel 回调', async () => {
    const onCancel = vi.fn(
      async (
        key: RecordKey,
        record: TestRecordType & { index?: number },
        originRow: TestRecordType & { index?: number },
      ) => {
        expect(key).toBe(1)
        expect(originRow).toEqual({ id: 1, name: 'test1', value: 'value1', index: 0 })
        return Promise.resolve()
      },
    )

    const wrapper = mount(TestComponent, {
      props: { onCancel, tableName: 'testTable' },
    })

    // 开始编辑
    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    // 取消编辑
    await wrapper.get('[data-testid="cancel-edit-1"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })
  })

  it('📝 取消编辑时 onCancel 回调应该接收到正确的参数', async () => {
    const onCancel = vi.fn(
      async (
        key: RecordKey,
        record: TestRecordType & { index?: number },
        originRow: TestRecordType & { index?: number },
      ) => {
        expect(key).toBe(2)
        expect(originRow).toEqual({ id: 2, name: 'test2', value: 'value2', index: 1 })
        expect(record).toBeDefined()
        return Promise.resolve()
      },
    )

    const wrapper = mount(TestComponent, {
      props: { onCancel, tableName: 'testTable' },
    })

    await wrapper.get('[data-testid="start-edit-2"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('2')
    })

    await wrapper.get('[data-testid="cancel-edit-2"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(onCancel).toHaveBeenCalledWith(
        2,
        expect.any(Object),
        { id: 2, name: 'test2', value: 'value2', index: 1 },
        undefined,
      )
    })
  })

  it('📝 取消新行编辑时不应该调用 onDelete（如果 preEditRowRef 为 null）', async () => {
    const onDelete = vi.fn()
    const onCancel = vi.fn(async () => Promise.resolve())

    const wrapper = mount(TestComponent, {
      props: { onCancel, onDelete },
    })

    // 开始编辑
    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    // 取消编辑
    await wrapper.get('[data-testid="cancel-edit-1"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
      // 对于已存在的行，不应该调用 onDelete
      expect(onDelete).not.toHaveBeenCalled()
    })
  })

  it('📝 取消编辑时应该正确清理编辑状态', async () => {
    const onCancel = vi.fn(async () => Promise.resolve())

    const wrapper = mount(TestComponent, {
      props: { onCancel, tableName: 'testTable' },
    })

    // 开始编辑第一行
    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    // 取消编辑
    await wrapper.get('[data-testid="cancel-edit-1"]').trigger('click')
    await flushPromises()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })

    // 验证可以再次开始编辑
    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })
  })

  it('📝 取消编辑时不应该丢失数据源数据', async () => {
    const onCancel = vi.fn(async () => Promise.resolve())

    const wrapper = mount(TestComponent, {
      props: { onCancel, tableName: 'testTable' },
    })

    const initialDataSource = wrapper.get('[data-testid="data-source"]').text()

    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    await wrapper.get('[data-testid="cancel-edit-1"]').trigger('click')
    await flushPromises()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
      // 数据源不应该改变
      expect(wrapper.get('[data-testid="data-source"]').text()).toBe(
        initialDataSource,
      )
    })
  })

  it('📝 快速连续取消多个编辑时应该正确处理所有回调', async () => {
    const onCancel1 = vi.fn(async () => Promise.resolve())
    const onCancel2 = vi.fn(async () => Promise.resolve())

    const TestComponentMultiple = defineComponent<{
      onCancel?: (
        key: RecordKey,
        record: TestRecordType & { index?: number },
        originRow: TestRecordType & { index?: number },
      ) => Promise<any | void>
      tableName?: string
    }>({
      props: ['onCancel', 'tableName'],
      setup(props) {
        const dataSource = ref<TestRecordType[]>([
          { id: 1, name: 'test1', value: 'value1' },
          { id: 2, name: 'test2', value: 'value2' },
        ])

        const editableUtils = useEditableArray<TestRecordType>({
          get dataSource() {
            return dataSource.value
          },
          setDataSource: next => (dataSource.value = typeof next === 'function' ? next(dataSource.value) : next),
          getRowKey: record => record.id,
          childrenColumnName: undefined,
          onCancel: props.onCancel,
          tableName: props.tableName,
          type: 'multiple',
        })

        return { editableUtils }
      },
      render() {
        return (
          <Form>
            <div data-testid="editable-keys">
              {this.editableUtils.editableKeys?.join(',') || 'none'}
            </div>
            <button
              data-testid="start-edit-1"
              onClick={() => this.editableUtils.startEditable(1)}
            >
              Start Edit 1
            </button>
            <button
              data-testid="start-edit-2"
              onClick={() => this.editableUtils.startEditable(2)}
            >
              Start Edit 2
            </button>
            <button
              data-testid="cancel-edit-1"
              onClick={() => this.editableUtils.cancelEditable(1)}
            >
              Cancel Edit 1
            </button>
            <button
              data-testid="cancel-edit-2"
              onClick={() => this.editableUtils.cancelEditable(2)}
            >
              Cancel Edit 2
            </button>
          </Form>
        )
      },
    })

    const wrapper = mount(TestComponentMultiple, {
      props: {
        onCancel: async (
          key: RecordKey,
          _record: TestRecordType & { index?: number },
          _originRow: TestRecordType & { index?: number },
        ) => {
          if (key === 1) {
            await onCancel1()
          }
          else if (key === 2) {
            await onCancel2()
          }
        },
        tableName: 'testTable',
      },
    })

    // 同时开始编辑两行
    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      const keys = wrapper.get('[data-testid="editable-keys"]').text()
      expect(keys).toContain('1')
    })

    await wrapper.get('[data-testid="start-edit-2"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      const keys = wrapper.get('[data-testid="editable-keys"]').text()
      expect(keys).toContain('1')
      expect(keys).toContain('2')
    })

    // 快速连续取消
    await wrapper.get('[data-testid="cancel-edit-1"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(onCancel1).toHaveBeenCalledTimes(1)
    })

    await wrapper.get('[data-testid="cancel-edit-2"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(onCancel1).toHaveBeenCalledTimes(1)
      expect(onCancel2).toHaveBeenCalledTimes(1)
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })
  })

  it('📝 取消编辑时 onCancel 抛出异常不应该阻止状态清理', async () => {
    const onCancel = vi.fn(async () => {
      throw new Error('Cancel error')
    })

    const wrapper = mount(TestComponent, {
      props: { onCancel, tableName: 'testTable' },
    })

    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    // 即使 onCancel 抛出异常，状态也应该被清理
    await (window as any).__editableUtils.cancelEditable(1).catch(() => {})
    await flushPromises()

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
      // 状态应该被清理，即使回调失败
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })
  })

  it('📝 取消编辑时应该正确处理 key 映射（tableName 场景）', async () => {
    const onCancel = vi.fn(
      async (
        key: RecordKey,
        record: TestRecordType & { index?: number },
        originRow: TestRecordType & { index?: number },
      ) => {
        expect(key).toBe(1)
        expect(originRow).toEqual({ id: 1, name: 'test1', value: 'value1', index: 0 })
        return Promise.resolve()
      },
    )

    const wrapper = mount(TestComponent, {
      props: { onCancel, tableName: 'testTable' },
    })

    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    // 使用字符串 key 取消
    await wrapper.get('[data-testid="cancel-edit-1"]').trigger('click')
    await flushPromises()

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })
  })

  it('📝 取消编辑时 onValuesChange 不应该被错误触发', async () => {
    const onValuesChange = vi.fn()
    const onCancel = vi.fn(async () => Promise.resolve())

    const wrapper = mount(TestComponent, {
      props: {
        onCancel,
        onValuesChange,
        tableName: 'testTable',
      },
    })

    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    await wrapper.get('[data-testid="cancel-edit-1"]').trigger('click')
    await flushPromises()

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
      // onValuesChange 不应该在取消时被调用
      expect(onValuesChange).not.toHaveBeenCalled()
    })
  })

  it('📝 取消新行编辑时应该正确处理 newLineConfig', async () => {
    const onCancel = vi.fn(
      async (
        key: RecordKey,
        record: TestRecordType & { index?: number },
        originRow: TestRecordType & { index?: number },
        newLineConfig?: NewLineConfig<TestRecordType>,
      ) => {
        expect(newLineConfig).toBeDefined()
        return Promise.resolve()
      },
    )

    const wrapper = mount(TestComponent, {
      props: { onCancel, tableName: 'testTable' },
    })

    // 添加新行
    const editableUtils = (window as any).__editableUtils
    if (editableUtils) {
      editableUtils.addEditRecord(
        { id: 3, name: 'test3' },
        { recordKey: 3, newRecordType: 'cache' },
      )
      await runTimers()

      await waitFor(() => {
        const keys = wrapper.get('[data-testid="editable-keys"]').text()
        expect(keys).toContain('3')
      })

      // 取消新行编辑
      await editableUtils.cancelEditable(3)
      await runTimers()

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledTimes(1)
        expect(onCancel).toHaveBeenCalledWith(
          3,
          expect.any(Object),
          expect.any(Object),
          expect.objectContaining({
            options: expect.objectContaining({ recordKey: 3 }),
          }),
        )
      })
    }
  })

  it('📝 取消编辑时 preEditRowRef 应该被正确清理', async () => {
    const onCancel = vi.fn(async () => Promise.resolve())

    const TestComponentWithRef = defineComponent({
      setup() {
        const dataSource = ref<TestRecordType[]>([
          { id: 1, name: 'test1', value: 'value1' },
        ])

        const editableUtils = useEditableArray<TestRecordType>({
          get dataSource() {
            return dataSource.value
          },
          setDataSource: next => (dataSource.value = typeof next === 'function' ? next(dataSource.value) : next),
          getRowKey: record => record.id,
          childrenColumnName: undefined,
          onCancel,
          tableName: 'testTable',
        })

        return { editableUtils }
      },
      render() {
        // 通过 actionRender 访问 preEditRowRef
        const actionConfig = this.editableUtils.actionRender({
          id: 1,
          name: 'test1',
          index: 0,
        })

        return (
          <Form>
            <div data-testid="editable-keys">
              {this.editableUtils.editableKeys?.join(',') || 'none'}
            </div>
            <button
              data-testid="start-edit"
              onClick={() => this.editableUtils.startEditable(1)}
            >
              Start Edit
            </button>
            <button
              data-testid="cancel-edit"
              onClick={() => this.editableUtils.cancelEditable(1)}
            >
              Cancel Edit
            </button>
            <span style={{ display: 'none' }}>{actionConfig}</span>
          </Form>
        )
      },
    })

    const wrapper = mount(TestComponentWithRef)

    await wrapper.get('[data-testid="start-edit"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    await wrapper.get('[data-testid="cancel-edit"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })
  })

  it('🐛 多行编辑依次点击取消时不应误删后续行', async () => {
    const onDelete = vi.fn(async () => Promise.resolve())
    const onCancel = vi.fn(async () => Promise.resolve())

    const MultiEditActionComponent = defineComponent({
      setup() {
        const dataSource = ref<TestRecordType[]>([
          { id: 1, name: 'test1', value: 'value1' },
          { id: 2, name: 'test2', value: 'value2' },
        ])

        const editableUtils = useEditableArray<TestRecordType>({
          get dataSource() {
            return dataSource.value
          },
          setDataSource: next => (dataSource.value = typeof next === 'function' ? next(dataSource.value) : next),
          getRowKey: record => record.id,
          childrenColumnName: undefined,
          onCancel,
          onDelete,
          type: 'multiple',
          tableName: 'testTable',
        })

        return { dataSource, editableUtils }
      },
      render() {
        const actions1 = this.editableUtils.actionRender({
          ...this.dataSource[0],
          index: 0,
        })
        const actions2 = this.editableUtils.actionRender({
          ...this.dataSource[1],
          index: 1,
        })

        return (
          <Form>
            <div data-testid="editable-keys">
              {this.editableUtils.editableKeys?.join(',') || 'none'}
            </div>
            <div data-testid="data-source">
              {this.dataSource.map(item => `${item.id}:${item.name}`).join(',')}
            </div>

            <button
              data-testid="start-edit-1"
              onClick={() => this.editableUtils.startEditable(1, this.dataSource[0])}
            >
              Start Edit 1
            </button>
            <button
              data-testid="start-edit-2"
              onClick={() => this.editableUtils.startEditable(2, this.dataSource[1])}
            >
              Start Edit 2
            </button>

            <span data-testid="cancel-action-1">{actions1?.[2]}</span>
            <span data-testid="cancel-action-2">{actions2?.[2]}</span>
          </Form>
        )
      },
    })

    const wrapper = mount(MultiEditActionComponent)

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
    })

    await wrapper.get('[data-testid="start-edit-1"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('1')
    })

    await wrapper.get('[data-testid="start-edit-2"]').trigger('click')
    await runTimers()

    await waitFor(() => {
      const keysText = wrapper.get('[data-testid="editable-keys"]').text() || ''
      expect(keysText.split(',').sort().join(',')).toBe('1,2')
    })

    const cancel1 = wrapper.get('[data-testid="cancel-action-1"]').get('button')
    const cancel2 = wrapper.get('[data-testid="cancel-action-2"]').get('button')

    expect(cancel1.text()).toBe('取消')
    expect(cancel2.text()).toBe('取消')

    await cancel1.trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('2')
      expect(onDelete).not.toHaveBeenCalled()
    })

    await cancel2.trigger('click')
    await runTimers()

    await waitFor(() => {
      expect(wrapper.get('[data-testid="editable-keys"]').text()).toBe('none')
      expect(onDelete).not.toHaveBeenCalled()
      expect(wrapper.get('[data-testid="data-source"]').text()).toBe(
        '1:test1,2:test2',
      )
    })
  })
})
