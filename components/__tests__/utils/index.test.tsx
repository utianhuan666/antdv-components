import type { Dayjs } from 'dayjs'
import { CodeFilled } from '@antdv-next/icons'
import { mount } from '@vue/test-utils'
import { ConfigProvider, Form, Input } from 'antdv-next'
import dayjs from 'dayjs'
import { cloneDeep } from 'es-toolkit'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { defineComponent, h, nextTick, ref, toRef } from 'vue'
import {
  conversionSubmitValue,
  dateArrayFormatter,
  deleteValueByNamePath,
  DropdownFooter,
  FieldLabel,
  getValueByNamePath,
  InlineErrorFormItem,
  isDeepEqualReact,
  isDropdownValueType,
  isNil,
  isUrl,
  LabelIconTip,
  lighten,
  merge,
  namePathKey,
  nanoid,
  parseValueToDay,
  pickProProps,
  setAlpha,
  setValueByNamePath,
  stringify,
  transformKeySubmitValue,
  useDebounceFn,
  useDebounceValue,
  useDeepCompareEffect,
  useDeepCompareMemo,
  useFetchData,
  useLatest,
  useReactiveRef,
  useRefFunction,
  useUrlSearchParams,
} from '../../utils'
import { mountAttached } from '../testUtils'

describe('utils', () => {
  beforeAll(() => vi.useFakeTimers())
  afterEach(() => vi.clearAllMocks())
  afterAll(() => vi.useRealTimers())

  it('lighten', () => {
    const color = lighten('#000', 50)
    expect(color).toBe('#808080')
  })

  it('setAlpha', () => {
    const color = setAlpha('#fff', 0.5)
    expect(color).toBe('rgba(255, 255, 255, 0.5)')
  })

  it('uses getPrefixCls for pro core utility class names from antd config', () => {
    const wrapper = mount({
      render: () => (
        <ConfigProvider prefixCls="acme">
          <div>
            <FieldLabel label="Name" value="Antdv" />
            <DropdownFooter onConfirm={() => {}} />
            <LabelIconTip label="Name" tooltip="Tip" />
          </div>
        </ConfigProvider>
      ),
    })

    expect(wrapper.find('.acme-pro-core-field-label').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-core-dropdown-footer').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-core-label-tip').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-core-field-label').exists()).toBe(false)
  })

  it('📅 useDebounceValue', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const deps = ref(['name'])
        const value = useDebounceValue(() => deps.value[0], 200, [deps])
        return { deps, value }
      },
      render() {
        return <>{this.value}</>
      },
    }))

    expect(wrapper.text()).toBe('name')
    ;(wrapper.vm as any).deps = ['string']
    await nextTick()
    expect(wrapper.text()).toBe('name')
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(wrapper.text()).toBe('string')
  })

  it('📅 dateArrayFormatter', async () => {
    expect(dateArrayFormatter(
      [dayjs('2020-01-01'), dayjs('2020-01-01')],
      ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD'],
    )).toEqual('2020-01-01 00:00:00 ~ 2020-01-01')
  })

  it('📅 dateArrayFormatter support function', async () => {
    expect(dateArrayFormatter(
      [dayjs('2020-01-01'), dayjs('2020-01-01')],
      ['YYYY-MM-DD HH:mm:ss', (value: Dayjs) => value.format('YYYY-MM')],
    )).toEqual('2020-01-01 00:00:00 ~ 2020-01')
  })

  it('📅 dateArrayFormatter keeps missing end format as undefined', async () => {
    const end = dayjs('2020-01-02')
    expect(dateArrayFormatter(
      [dayjs('2020-01-01'), end],
      ['YYYY-MM-DD'],
    )).toEqual(`2020-01-01 ~ ${end.format()}`)
  })

  it('📅 dateArrayFormatter support moment function', async () => {
    expect(dateArrayFormatter(
      [dayjs('2020-01-01'), dayjs('2020-01-01')],
      ['YYYY-MM-DD HH:mm:ss', (value: Dayjs) => value.format('YYYY-MM')],
    )).toEqual('2020-01-01 00:00:00 ~ 2020-01')
  })

  it('📅 useDebounceValue without deps', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const deps = ref(['name'])
        const value = useDebounceValue(deps, 100)
        return { deps, value }
      },
      render() {
        return <>{this.value[0]}</>
      },
    }))

    expect(wrapper.text()).toBe('name')
    ;(wrapper.vm as any).deps = ['string']
    await nextTick()
    expect(wrapper.text()).toBe('name')
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.text()).toBe('string')
  })

  it('📅 useDebounceFn', async () => {
    pickProProps({
      fieldProps: {
        name: 'string',
      },
    })

    const fn = vi.fn()
    const wrapper = mount(defineComponent({
      props: { wait: Number },
      setup(props) {
        const fetchData = useDebounceFn(async () => fn(), toRef(props, 'wait'))
        fetchData.run()
        return { fetchData }
      },
      render() {
        return (
          <div
            id="test"
            onClick={() => {
              this.fetchData.run()
              this.fetchData.run()
            }}
          >
            test
          </div>
        )
      },
    }))

    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(1)
    await wrapper.find('#test').trigger('click')
    expect(fn).toHaveBeenCalledTimes(3)
    await wrapper.setProps({ wait: 80 })
    await wrapper.find('#test').trigger('click')
    vi.advanceTimersByTime(80)
    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(4)
    await wrapper.setProps({ wait: 160 })
    await wrapper.find('#test').trigger('click')
    vi.advanceTimersByTime(80)
    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(4)
    vi.advanceTimersByTime(80)
    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(5)
    wrapper.unmount()
    expect(fn).toHaveBeenCalledTimes(5)
  })

  it('📅 useDebounceFn supports isolated debounced instance', async () => {
    const fn = vi.fn()
    const debouncedWrapper = mount(defineComponent({
      setup() {
        const fetchData = useDebounceFn(async () => fn(), 80)
        return { fetchData }
      },
      render() {
        return (
          <div
            id="test"
            onClick={() => {
              this.fetchData.run()
              this.fetchData.run()
            }}
          >
            test
          </div>
        )
      },
    }))
    await debouncedWrapper.find('#test').trigger('click')
    vi.advanceTimersByTime(80)
    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(1)
    await debouncedWrapper.find('#test').trigger('click')
    vi.advanceTimersByTime(80)
    await Promise.resolve()
    expect(fn).toHaveBeenCalledTimes(2)
    debouncedWrapper.unmount()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('pickProProps filters internal pro props unless custom valueType', () => {
    const props = {
      id: 'field',
      valueType: 'text',
      fieldProps: { allowClear: true },
      formItemProps: { required: true },
      placeholder: 'input',
    }

    expect(pickProProps(props)).toEqual({
      id: 'field',
      placeholder: 'input',
    })
    expect(pickProProps(props, true)).toEqual(props)
  })

  it('name path helpers read write and delete nested values', () => {
    const model: Record<string, any> = {
      user: { name: 'Ada' },
      list: [{ id: 1 }],
    }

    expect(getValueByNamePath(model, ['user', 'name'])).toBe('Ada')
    expect(getValueByNamePath(model, ['missing', 'value'])).toBeUndefined()

    setValueByNamePath(model, ['user', 'age'], 37)
    setValueByNamePath(model, ['list', 0, 'title'], 'first')

    expect(model.user.age).toBe(37)
    expect(model.list[0].title).toBe('first')

    deleteValueByNamePath(model, ['user', 'name'])
    expect(model.user.name).toBeUndefined()
  })

  it('name-path helpers preserve numeric and empty-root semantics', () => {
    const model: any = { 0: 'zero', list: [{ id: 1 }], stale: true }

    expect(getValueByNamePath(model, 0)).toBe('zero')
    expect(getValueByNamePath(model, '0')).toBe('zero')
    expect(namePathKey(['list', 0, 'id'])).toBe(JSON.stringify(['list', 0, 'id']))

    setValueByNamePath(model, [], { next: true })
    expect(model).toEqual({ next: true })

    deleteValueByNamePath(model, ['missing', 'path'])
    expect(model).toEqual({ next: true })
  })

  it('cloneDeep handles missing Blob global', () => {
    const originalBlob = (globalThis as any).Blob
    try {
      ;(globalThis as any).Blob = undefined
      const source: any = { nested: { value: 1 } }
      const cloned = cloneDeep(source)
      cloned.nested.value = 2
      expect(source.nested.value).toBe(1)
    }
    finally {
      ;(globalThis as any).Blob = originalBlob
    }
  })

  it('📅 useDebounceFn execution has errors', async () => {
    pickProProps({
      fieldProps: {
        name: 'string',
      },
    })

    const error = new Error('debounce error')
    const catchFn = vi.fn()
    const wrapper = mount(defineComponent({
      setup() {
        const fetchData = useDebounceFn(async () => {
          throw error
        })
        return { fetchData }
      },
      render() {
        return <div />
      },
    }))
    await (wrapper.vm as any).fetchData.run().catch(catchFn)
    expect(catchFn).toHaveBeenCalledWith(error)
  })

  it('📅 useLatest exposes the latest current value', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const count = ref(1)
        const latest = useLatest(count)
        return { count, latest }
      },
      render() {
        return <span>{this.latest.current}</span>
      },
    }))

    expect(wrapper.text()).toBe('1')
    ;(wrapper.vm as any).count = 2
    await nextTick()

    expect((wrapper.vm as any).latest.current).toBe(2)
    expect(wrapper.text()).toBe('2')
  })

  it('📅 useRefFunction keeps a stable function and calls latest closure', async () => {
    const first = vi.fn()
    const second = vi.fn()
    let stableFn: any
    const wrapper = mount(defineComponent({
      props: {
        handler: {
          type: Function,
          required: true,
        },
      },
      setup(props) {
        const handler = useRefFunction((value: string) => props.handler(value))
        stableFn = handler
        return { handler }
      },
      render() {
        return <button onClick={() => this.handler('next')}>run</button>
      },
    }), {
      props: { handler: first },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.setProps({ handler: second })
    expect((wrapper.vm as any).handler).toBe(stableFn)

    await wrapper.find('button').trigger('click')
    expect(first).toHaveBeenCalledWith('next')
    expect(second).toHaveBeenCalledWith('next')
  })

  it('📅 useReactiveRef rerenders when current changes', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const inputRef = useReactiveRef('first')
        return { inputRef }
      },
      render() {
        return <span>{this.inputRef.current}</span>
      },
    }))

    expect(wrapper.text()).toBe('first')
    ;(wrapper.vm as any).inputRef.current = 'second'
    await nextTick()

    expect(wrapper.text()).toBe('second')
  })

  it('📅 useDeepCompareMemo only recomputes when deps deeply change', async () => {
    const factory = vi.fn((value: any) => ({ value: value.name }))
    const wrapper = mount(defineComponent({
      setup() {
        const deps = ref({ name: 'qixian' })
        const memo = useDeepCompareMemo(() => factory(deps.value), [deps])
        return { deps, memo }
      },
      render() {
        return <span>{this.memo.value}</span>
      },
    }))
    const firstMemo = (wrapper.vm as any).memo

    expect(wrapper.text()).toBe('qixian')
    expect(factory).toHaveBeenCalledTimes(1)

    ;(wrapper.vm as any).deps = { name: 'qixian' }
    await nextTick()
    expect((wrapper.vm as any).memo).toBe(firstMemo)
    expect(factory).toHaveBeenCalledTimes(1)

    ;(wrapper.vm as any).deps = { name: 'kiner' }
    await nextTick()
    expect(wrapper.text()).toBe('kiner')
    expect(factory).toHaveBeenCalledTimes(2)
  })

  it('📅 useDeepCompareEffect ignores deeply equal dependency updates', async () => {
    const effect = vi.fn()
    const cleanup = vi.fn()
    const wrapper = mount(defineComponent({
      setup() {
        const deps = ref({ name: 'qixian', ignoreMe: 1 })
        useDeepCompareEffect(() => {
          effect(deps.value.name)
          return cleanup
        }, [deps], ['ignoreMe'])
        return { deps }
      },
      render() {
        return <span>{this.deps.name}</span>
      },
    }))

    expect(effect).toHaveBeenCalledTimes(1)
    ;(wrapper.vm as any).deps = { name: 'qixian', ignoreMe: 2 }
    await nextTick()
    expect(effect).toHaveBeenCalledTimes(1)

    ;(wrapper.vm as any).deps = { name: 'kiner', ignoreMe: 2 }
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(effect).toHaveBeenCalledTimes(2)
  })

  it('📅 useFetchData caches by proFieldKey and aborts stale requests', async () => {
    async function settleFetchData() {
      await Promise.resolve()
      await vi.advanceTimersByTimeAsync(0)
      await Promise.resolve()
      await nextTick()
      await Promise.resolve()
      await nextTick()
    }

    const abortEvents: string[] = []
    const request = vi.fn(async (params: any, signal: AbortSignal) => {
      signal.addEventListener('abort', () => abortEvents.push(params.keyword))
      await Promise.resolve()
      return [{ label: params.keyword, value: params.keyword }]
    })
    const wrapper = mount(defineComponent({
      setup() {
        const params = ref({ keyword: 'first' })
        const [data, loading] = useFetchData({
          proFieldKey: 'shared-key',
          params,
          request,
        })
        return { params, data, loading }
      },
      render() {
        return <span>{this.loading ? 'loading' : this.data?.[0]?.label}</span>
      },
    }))

    await settleFetchData()
    expect(request).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toBe('first')

    ;(wrapper.vm as any).params = { keyword: 'second' }
    ;(wrapper.vm as any).params = { keyword: 'third' }
    await settleFetchData()

    expect(request).toHaveBeenCalledTimes(2)
    expect(abortEvents).toContain('first')
    expect(wrapper.text()).toBe('third')
  })

  it('📅 useFetchData separates cache by params under the same proFieldKey', async () => {
    async function settleFetchData() {
      await Promise.resolve()
      await vi.advanceTimersByTimeAsync(0)
      await Promise.resolve()
      await nextTick()
      await Promise.resolve()
      await nextTick()
    }

    const request = vi.fn(async (params: any) => {
      await Promise.resolve()
      return [{ label: params.keyword, value: params.keyword }]
    })
    const CacheProbe = defineComponent({
      props: {
        keyword: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        const [data, loading] = useFetchData({
          proFieldKey: 'same-key-different-params',
          params: toRef(props, 'keyword'),
          request: keyword => request({ keyword }),
        })
        return { data, loading }
      },
      render() {
        return <span>{this.loading ? 'loading' : this.data?.[0]?.label}</span>
      },
    })

    const first = mount(CacheProbe, { props: { keyword: 'first' } })
    await settleFetchData()
    expect(first.text()).toBe('first')
    first.unmount()

    const second = mount(CacheProbe, { props: { keyword: 'second' } })
    expect(second.text()).not.toBe('first')
    await settleFetchData()
    expect(second.text()).toBe('second')
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('🧩 useUrlSearchParams responds to popstate updates', async () => {
    window.history.replaceState({}, '', `${window.location.pathname}?keyword=first`)

    const wrapper = mount(defineComponent({
      setup() {
        const [params] = useUrlSearchParams({ keyword: 'default' })
        return { params }
      },
      render() {
        return <span>{this.params.keyword}</span>
      },
    }))

    expect(wrapper.text()).toBe('first')

    window.history.pushState({}, '', `${window.location.pathname}?keyword=second`)
    window.dispatchEvent(new PopStateEvent('popstate'))
    await nextTick()

    expect(wrapper.text()).toBe('second')
  })

  it('📅 conversionSubmitValue nil', async () => {
    const html = conversionSubmitValue(
      {
        name: 'qixian',
        money: null,
      },
      'string',
      {
        name: 'text',
        money: 'text',
      },
      true,
    )
    expect(html.money === undefined).toBeTruthy()
  })

  it('📅 merge values not change null', () => {
    const html = merge<{
      status: null
    }>({}, { status: null })
    expect(html.status).toEqual(null)
  })

  it('📅 conversionSubmitValue string with dateFormat', async () => {
    const html = conversionSubmitValue(
      {
        dataTime: dayjs('2019-11-16 12:50:26'),
        time: dayjs('2019-11-16 12:50:26'),
        name: 'qixian',
        money: 20,
        dateTimeRange: [
          dayjs('2019-11-16 12:50:26'),
          dayjs('2019-11-16 12:50:26'),
        ],
        dateRange: [
          dayjs('2019-11-16 12:50:26'),
          dayjs('2019-11-16 12:50:26'),
        ],
        timeRange: [
          dayjs('2019-11-16 12:50:26'),
          dayjs('2019-11-16 12:50:26'),
        ],
        timeRange2: [
          dayjs('2019-11-16 12:50:26'),
          dayjs('2019-11-16 12:50:26'),
        ],
        dateQuarter: dayjs('2019-11-16 12:50:26'),
      },
      'string',
      {
        dataTime: 'dataTime',
        time: 'time',
        name: 'text',
        dateRange: 'dateRange',
        timeRange: 'timeRange',
        dateQuarter: 'dateQuarter',
      },
    )
    expect(html.dataTime?.format('YYYY-MM-DD HH:mm:ss')).toBe(
      '2019-11-16 12:50:26',
    )
    expect(html.time).toBe('12:50:26')
    expect(html.name).toBe('qixian')
    expect(html.money).toBe(20)
    expect(html.dateTimeRange.join(',')).toBe(
      '2019-11-16 12:50:26,2019-11-16 12:50:26',
    )
    expect(html.dateRange.join(',')).toBe('2019-11-16,2019-11-16')
    expect(html.timeRange2.join(',')).toBe(
      '2019-11-16 12:50:26,2019-11-16 12:50:26',
    )
    expect(html.dateQuarter).toBe('2019-Q4')
  })

  it('📅 conversionSubmitValue string', async () => {
    const html = conversionSubmitValue(
      {
        dataTime: dayjs('2019-11-16 12:50:26'),
        time: dayjs('2019-11-16 12:50:26'),
      },
      'string',
      {
        dataTime: {
          valueType: 'dataTime',
          dateFormat: 'YY-MM',
        },
        time: 'time',
      },
    )
    expect(html.dataTime).toBe('19-11')
    expect(html.time).toBe('12:50:26')
  })

  it('📅 conversionSubmitValue namePath string', async () => {
    const html = conversionSubmitValue<any>(
      {
        date: {
          dataTime: dayjs('2019-11-16 12:50:26'),
          dateTimeRange: [
            dayjs('2019-11-16 12:50:26'),
            dayjs('2019-11-16 12:50:26'),
          ],
          dateRange: [
            dayjs('2019-11-16 12:50:26'),
            dayjs('2019-11-16 12:50:26'),
          ],
          timeRange: [
            dayjs('2019-11-16 12:50:26'),
            dayjs('2019-11-16 12:50:26'),
          ],
          timeRange2: [
            dayjs('2019-11-16 12:50:26'),
            dayjs('2019-11-16 12:50:26'),
          ],
        },
      },
      'string',
      {
        date: {
          dateTimeRange: 'dateTimeRange',
          dateRange: 'dateRange',
          timeRange: 'timeRange',
          dataTime: 'dateTime',
          timeRange2: 'dateTimeRange',
        },
      },
    )
    expect(html.date.dataTime).toBe('2019-11-16 12:50:26')
    expect(html.date.dateTimeRange.join(',')).toBe(
      '2019-11-16 12:50:26,2019-11-16 12:50:26',
    )
    expect(html.date.dateRange.join(',')).toBe('2019-11-16,2019-11-16')
    expect(html.date.timeRange2.join(',')).toBe(
      '2019-11-16 12:50:26,2019-11-16 12:50:26',
    )
  })

  it('📅 conversionSubmitValue number', async () => {
    const date = dayjs('2019-11-16 12:50:26')
    const html = conversionSubmitValue(
      {
        dataTime: date,
        time: date,
        name: 'qixian',
        money: 20,
        dateTimeRange: [date, date],
        dateRange: [date, date],
        timeRange: [date, date],
        timeRange2: [date, date],
      },
      'number',
      {
        dateTime: 'dataTime',
        time: 'time',
        name: 'text',
        dateRange: 'dateRange',
        timeRange: 'timeRange',
      },
    )
    expect(html.dataTime).toBe(date.valueOf())
    expect(html.time).toBe(date.valueOf())
    expect(html.name).toBe('qixian')
    expect(html.money).toBe(20)
    expect(html.dateTimeRange.join(',')).toBe(
      `${date.valueOf()},${date.valueOf()}`,
    )
    expect(html.dateRange.join(',')).toBe(
      `${date.valueOf()},${date.valueOf()}`,
    )
    expect(html.timeRange2.join(',')).toBe(
      `${date.valueOf()},${date.valueOf()}`,
    )
  })

  it('📅 conversionSubmitValue dayjs', async () => {
    const date = dayjs('2019-11-16 12:50:26')
    const html = conversionSubmitValue(
      {
        dataTime: date,
        time: date,
        name: 'qixian',
        money: 20,
        dateTimeRange: [date, date],
        dateRange: [date, date],
        timeRange: [date, date],
        timeRange2: [date, date],
      },
      false,
      {
        dateTime: 'dataTime',
        time: 'time',
        name: 'text',
        dateRange: 'dateRange',
        timeRange: 'timeRange',
      },
    )
    expect(html.dataTime.valueOf()).toBe(date.valueOf())
    expect(html.time.valueOf()).toBe(date.valueOf())
    expect(html.name).toBe('qixian')
    expect(html.money).toBe(20)
    expect(html.dateTimeRange.map((item: Dayjs) => item.valueOf()).join(',')).toBe(
      `${date.valueOf()},${date.valueOf()}`,
    )
  })

  it('📅 parseValueToMoment dayjs', async () => {
    const html = parseValueToDay(
      ['2019-11-16 12:50:26', '2019-11-16 12:50:26'],
      'YYYY-MM-DD',
    ) as Dayjs[]
    const expected = dayjs('2019-11-16', 'YYYY-MM-DD').valueOf()
    expect(html.map(item => item.valueOf()).join(',')).toBe(`${expected},${expected}`)
  })

  it('📅 parseValueToMoment moment to dayjs', async () => {
    const html = parseValueToDay(
      [dayjs(1573862400000), dayjs(1573862400000)] as any[],
      'YYYY-MM-DD',
    ) as Dayjs[]
    expect(html.map(item => item.valueOf()).join(',')).toBe('1573862400000,1573862400000')
  })

  it('📅 DropdownFooter click', async () => {
    const wrapper = mount(() => (
      <DropdownFooter>
        <Input {...({ id: 'test' } as any)} />
      </DropdownFooter>
    ))
    await wrapper.find('.ant-pro-core-dropdown-footer').trigger('click')
    expect(wrapper.find('.ant-pro-core-dropdown-footer').exists()).toBeTruthy()
  })

  it('📅 InlineErrorFormItem onValuesChange', async () => {
    const ruleMessage = {
      required: '必填项',
      min: '最小长度为12',
      numberRequired: '必须包含数字',
      alphaRequired: '必须包含字母',
    }
    const wrapper = mountAttached({
      data: () => ({
        model: {
          title: '',
        },
      }),
      render() {
        return (
          <Form model={this.model}>
            <span>text</span>
            <InlineErrorFormItem
              errorType="popover"
              rules={[
                {
                  required: true,
                  message: ruleMessage.required,
                },
                {
                  min: 12,
                  message: ruleMessage.min,
                },
                {
                  message: ruleMessage.numberRequired,
                  pattern: /[0-9]/,
                },
                {
                  message: ruleMessage.alphaRequired,
                  pattern: /[a-zA-Z]/,
                },
              ]}
              popoverProps={{ trigger: 'focus' }}
              name="title"
            >
              <Input {...({ id: 'test', role: 'test_input' } as any)} />
            </InlineErrorFormItem>
          </Form>
        )
      },
    })

    expect(wrapper.text()).toContain('text')
    const input = wrapper.find('input#test')
    expect(input.exists()).toBe(true)
    await input.trigger('focus')
    await nextTick()

    expect(document.body.querySelector('div.ant-popover')).toBeFalsy()

    await input.setValue('1')
    await nextTick()
    await Promise.resolve()
    await nextTick()

    const popoverContent = document.body.querySelector(
      'div.ant-popover .ant-popover-content',
    )
    expect(popoverContent).toBeTruthy()

    const errorText = Array.from(
      document.body.querySelectorAll(
        'div.ant-popover .ant-popover-content .ant-form-item-explain-error',
      ),
    )
      .map(el => el.textContent)
      .join(' ')
    expect(errorText).toContain(ruleMessage.min)
    expect(errorText).toContain(ruleMessage.alphaRequired)
    expect(errorText).not.toContain(ruleMessage.numberRequired)

    await input.setValue('12345678901AB')
    await nextTick()
    await Promise.resolve()
    await nextTick()

    expect((input.element as HTMLInputElement).value).toBe('12345678901AB')
    expect(
      document.body.querySelectorAll(
        'div.ant-popover .ant-popover-content .ant-form-item-explain-error',
      ).length,
    ).toBe(0)

    await input.setValue('.')
    await nextTick()
    await Promise.resolve()
    await nextTick()

    const dotErrorText = Array.from(
      document.body.querySelectorAll(
        'div.ant-popover .ant-popover-content .ant-form-item-explain-error',
      ),
    )
      .map(el => el.textContent)
      .join(' ')
    expect(dotErrorText).toContain(ruleMessage.min)
    expect(dotErrorText).toContain(ruleMessage.numberRequired)
    expect(dotErrorText).toContain(ruleMessage.alphaRequired)

    await input.setValue('')
    await nextTick()
    await Promise.resolve()
    await nextTick()

    const emptyErrorText = Array.from(
      document.body.querySelectorAll(
        'div.ant-popover .ant-popover-content .ant-form-item-explain-error',
      ),
    )
      .map(el => el.textContent)
      .join(' ')
    expect(emptyErrorText).toContain(ruleMessage.required)
  })

  it('📅 InlineErrorFormItem shows popover for warningOnly validation', async () => {
    const warningMessage = 'warning text'
    const wrapper = mountAttached({
      data: () => ({
        model: {
          count: undefined,
        },
      }),
      render() {
        return (
          <Form model={this.model}>
            <InlineErrorFormItem
              errorType="popover"
              rules={[
                {
                  warningOnly: true,
                  validator(_: any, value: any) {
                    if (value === 0 || value === '0')
                      return Promise.reject(new Error(warningMessage))
                    return Promise.resolve()
                  },
                },
              ]}
              popoverProps={{ trigger: ['click', 'focus'] }}
              name="count"
            >
              <Input {...({ id: 'warning_test', role: 'warning_test_input', type: 'number' } as any)} />
            </InlineErrorFormItem>
          </Form>
        )
      },
    })

    const input = wrapper.find('input#warning_test')
    expect(input.exists()).toBe(true)
    await input.setValue('0')
    await input.trigger('focus')
    await nextTick()
    await Promise.resolve()
    await nextTick()

    const popoverContent = document.body.querySelector(
      'div.ant-popover .ant-popover-content',
    )
    const warningEl = document.body.querySelector(
      '.ant-form-item-explain-warning',
    )
    expect(popoverContent).toBeTruthy()
    expect(warningEl).toBeTruthy()
    expect(warningEl?.textContent).toContain(warningMessage)
  })

  it('📅 transformKeySubmitValue return string', async () => {
    const html = await transformKeySubmitValue(
      {
        dataTime: '2019-11-16 12:50:26',
        time: '2019-11-16 12:50:26',
        name: 'qixian',
        money: 20,
        dateTimeRange: [
          '2019-11-16 12:50:26',
          '2019-11-16 12:55:26',
        ],
        dateRange: [
          '2019-11-16 12:50:26',
          '2019-11-16 12:55:26',
        ],
        dateRange2: [
          '2019-11-16 12:50:26',
          '2019-11-16 12:55:26',
        ],
      },
      {
        dataTime: value => ({ 'new-dataTime': value }),
        time: value => ({ 'new-time': value }),
        name: () => 'new-name',
        money: value => ({ 'new-money': value }),
        dateRange2: () => 'dateRange',
      },
    )
    const htmlKeys = Object.keys(html).sort()
    expect(htmlKeys).toEqual(
      [
        'new-dataTime',
        'new-time',
        'dateRange2',
        'name',
        'new-money',
        'dateTimeRange',
        'dateRange',
      ].sort(),
    )
    expect(htmlKeys).not.toEqual(
      [
        'dataTime',
        'time',
        'new-name',
        'dateRange2',
        'money',
        'dateTimeRange',
        'dateRange',
      ].sort(),
    )
    expect((html as any)['new-dataTime']).toBe('2019-11-16 12:50:26')
    expect((html as any)['new-time']).toBe('2019-11-16 12:50:26')
    expect((html as any).name).toBe('new-name')
    expect((html as any)['new-money']).toBe(20)
    expect(html.dateTimeRange.join(',')).toBe(
      '2019-11-16 12:50:26,2019-11-16 12:55:26',
    )
    expect(html.dateRange.join(',')).toBe(
      '2019-11-16 12:50:26,2019-11-16 12:55:26',
    )
  })

  it('📅 transformKeySubmitValue will return file', async () => {
    const html = await transformKeySubmitValue(
      false as any,
      {
        dataTime: () => 'new-dataTime',
        time: () => 'new-time',
        name: () => 'new-name',
        money: () => 'new-money',
      },
    )
    expect(html).toBe(false)
  })

  it('📅 transformKeySubmitValue return object', async () => {
    const html = await transformKeySubmitValue(
      {
        dataTime: '2019-11-16 12:50:26',
        time: '2019-11-16 12:50:26',
        name: 'qixian',
        money: 20,
        test: {
          name: 'test',
        },
        dateTimeRange: {
          time: [
            '2019-11-16 12:50:26',
            '2019-11-16 12:55:26',
          ],
        },
        dateRange: [
          '2019-11-16 12:50:26',
          '2019-11-16 12:55:26',
        ],
      },
      {
        dateTimeRange: {
          time: (value: any) => ({
            dateTimeRange1: value[0],
            dateTimeRange2: value[1],
          }),
        },
        dateRange: (value: any) => ({
          dateRange1: value[0],
          dateRange2: value[1],
        }),
      },
    )
    const htmlKeys = Object.keys(html).sort()
    expect(htmlKeys).toEqual(
      [
        'dateTimeRange1',
        'dateTimeRange2',
        'dateRange1',
        'dateRange2',
        'dataTime',
        'time',
        'name',
        'test',
        'money',
      ].sort(),
    )

    expect(htmlKeys).not.toEqual(
      [
        'dataTime',
        'time',
        'name',
        'money',
        'dateTimeRange',
        'dateRange',
      ].sort(),
    )
    expect(html.dataTime).toBe('2019-11-16 12:50:26')
    expect(html.time).toBe('2019-11-16 12:50:26')
    expect(html.name).toBe('qixian')
    expect(html.money).toBe(20)
    expect((html as any).dateTimeRange1).toBe('2019-11-16 12:50:26')
    expect((html as any).dateTimeRange2).toBe('2019-11-16 12:55:26')
    expect((html as any).dateRange1).toBe('2019-11-16 12:50:26')
    expect((html as any).dateRange2).toBe('2019-11-16 12:55:26')
  })

  it('📅 transformKeySubmitValue return nest object', async () => {
    const vnode = h('a')
    const html = await transformKeySubmitValue(
      {
        d: new Map(),
        e: new Set(),
        f: document.createElement('div'),
        c: /\//,
        g: vnode,
        a: {
          b: {
            name: 'test',
          },
        },
      },
      {
        a: {
          b: {
            name: (e: string) => ({
              a: {
                b: {
                  name: `qixian_${e}`,
                },
              },
            }),
          } as any,
        },
      },
    )
    expect(html.a.b.name).toBe('qixian_test')
  })

  it('📅 transformKeySubmitValue for array', async () => {
    const html = await transformKeySubmitValue(
      [
        {
          name: 1,
        },
        {
          name: 2,
        },
        {
          f: [1, 2, 4],
        },
      ],
      {
        1: {
          name: (e: string) => {
            return {
              name: 2,
              name2: `qixian_${e}`,
            }
          },
        },
      },
    )
    expect((html as any)[1].name2).toBe('qixian_2')
  })

  it('📅 transformKeySubmitValue ignore empty transform', async () => {
    const dataIn = {
      dataTime: '2019-11-16 12:50:26',
      time: '2019-11-16 12:50:26',
      name: 'qixian',
      money: 20,
      dateTimeRange: [
        '2019-11-16 12:50:26',
        '2019-11-16 12:55:26',
      ],
      dateRange: [
        '2019-11-16 12:50:26',
        '2019-11-16 12:55:26',
      ],
    }
    const html = await transformKeySubmitValue(dataIn, {
      dataTime: undefined,
      time: undefined,
    })
    expect(html).toBe(dataIn)
  })

  it('📅 transformKeySubmitValue ignore React element', async () => {
    const labelInValue = { label: h('div', 'test'), value: 'LABEL' }
    const dataIn = {
      dataTime: '2019-11-16 12:50:26',
      time: '2019-11-16 12:50:26',
      tag: labelInValue,
      money: 20,
      dateTimeRange: [
        '2019-11-16 12:50:26',
        '2019-11-16 12:55:26',
      ],
      dateRange: [
        '2019-11-16 12:50:26',
        '2019-11-16 12:55:26',
      ],
    }
    const html = await transformKeySubmitValue(dataIn, {
      dataTime: value => ({ 'new-dataTime': value }),
      time: undefined,
    })
    expect((html as any)['new-dataTime']).toBe('2019-11-16 12:50:26')
    expect((html as any).tag).not.toBe(labelInValue)
    expect((html as any).tag.label.type).toBe('div')
    expect((html as any).tag.label.children).toBe('test')
  })

  it('📅 transformKeySubmitValue ignore Blob', async () => {
    const file = new Blob(['foo'], { type: 'application/octet-stream' })
    const dataIn = {
      dataTime: '2019-11-16 12:50:26',
      time: '2019-11-16 12:50:26',
      file,
      files: [file],
    }
    const html = await transformKeySubmitValue(dataIn, {
      dataTime: value => ({ 'new-dataTime': value }),
      time: undefined,
    })
    expect((html as any)['new-dataTime']).toBe('2019-11-16 12:50:26')
    expect((html as any).file.type).toBe('application/octet-stream')
    expect((html as any).files[0].type).toBe('application/octet-stream')
  })

  it('📅 transformKeySubmitValue ignore null', async () => {
    const dataIn = {
      dataTime: '2019-11-16 12:50:26',
      time: '2019-11-16 12:50:26',
      file: null,
    }
    const html = await transformKeySubmitValue(dataIn, {
      dataTime: value => ({ 'new-dataTime': value }),
      time: undefined,
    })
    expect((html as any)['new-dataTime']).toBe('2019-11-16 12:50:26')
    expect(html.file).toBe(undefined)
  })

  it('📅 isNil', async () => {
    expect(isNil(null)).toBe(true)
    expect(isNil(undefined)).toBe(true)
    expect(isNil(0)).toBe(false)
    expect(isNil('')).toBe(false)
    expect(isNil({})).toBe(false)
    expect(isNil(true)).toBe(false)
  })

  it('🪓 isUrl', async () => {
    expect(isUrl('https://procomponents.ant.design/components/layout')).toBe(true)
    expect(isUrl('https://procomponents.ant.design/en-US/components/layout#basic-usage')).toBe(true)
    expect(isUrl('http://')).toBe(false)
    expect(isUrl('https://')).toBe(false)
    expect(isUrl('ftp://procomponents.ant.design')).toBe(false)
    expect(isUrl('procomponents.ant.design/en-US/components/layout')).toBe(false)
    expect(isUrl('https:://procomponents.ant.design/en-US/components/layout')).toBe(false)
  })

  it('🪓 isDropdownValueType', async () => {
    expect(isDropdownValueType('date')).toBeTruthy()
    expect(isDropdownValueType('dateRange')).toBeFalsy()
    expect(isDropdownValueType('dateTimeRange')).toBeFalsy()
    expect(isDropdownValueType('timeRange')).toBeFalsy()
    expect(isDropdownValueType('select')).toBeTruthy()
  })

  it('🪓 LabelIconTip', async () => {
    const wrapper = mount(() => (
      <LabelIconTip
        label="xxx"
        subTitle="xxx"
        tooltip={{
          icon: <CodeFilled />,
          overlay: 'tetx',
        }}
      />
    ))
    await wrapper.find('div.ant-pro-core-label-tip').trigger('mousedown')
    await wrapper.find('div.ant-pro-core-label-tip').trigger('mouseleave')
    await wrapper.find('div.ant-pro-core-label-tip').trigger('mousemove')
    expect(wrapper.text()).toContain('xxx')
    expect(wrapper.find('.ant-pro-core-label-tip-title').text()).toBe('xxx')
    expect(wrapper.find('.ant-pro-core-label-tip-subtitle').text()).toBe('xxx')
    expect(wrapper.find('.ant-pro-core-label-tip').exists()).toBeTruthy()
    expect(wrapper.find('.anticon').exists()).toBeTruthy()
  })

  it('🪓 isDeepEqualReact', async () => {
    const CustomComponent = (props: any) => h('div', props)

    class Deep {
      constructor() {

      }

      a() {}

      b() {}
    }

    const a = h(CustomComponent, {
      array: [
        1,
        2,
        3,
        4,
        { deep: true, nested: { deep: true, ignoreKey: false } },
      ],
      map: new Map([
        ['key', 'value'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ]),
      set: new Set([1, 2, 3, 4, 5]),
      regexp: /test/gi,
      arrayBuffer: new Int8Array([1, 2, 3, 4, 5]),
      string: 'compare',
      number: 0,
      null: null,
      nan: Number.NaN,
      class: Deep,
      classInstance: new Deep(),
      className: 'class-name',
    })

    const b = h(CustomComponent, {
      array: [
        1,
        2,
        3,
        4,
        { deep: true, nested: { deep: true, ignoreKey: true } },
      ],
      map: new Map([
        ['key', 'value'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ]),
      set: new Set([1, 2, 3, 4, 5]),
      regexp: /test/gi,
      arrayBuffer: new Int8Array([1, 2, 3, 4, 5]),
      string: 'compare',
      number: 0,
      null: null,
      nan: Number.NaN,
      class: Deep,
      classInstance: new Deep(),
      className: 'class-name',
    })

    expect(isDeepEqualReact(a, b)).toBe(false)
  })

  it('🪓 nanoid', () => {
    const cryptoSpy = vi.spyOn(window.crypto, 'randomUUID')
    nanoid()
    expect(cryptoSpy).toHaveBeenCalled()
  })

  it('🪓 stringify', () => {
    expect(stringify({ name: 'kiner', age: 28, liked: false, favs: ['Reading', 'Running'], userInfo: { fullName: 'kinertang' } }))
      .toBe('{"name":"kiner","age":28,"liked":false,"favs":["Reading","Running"],"userInfo":{"fullName":"kinertang"}}')
    const json: any = { name: 'kiner', age: 28 }
    json.detail = json
    expect(stringify(json)).toBe('{"name":"kiner","age":28,"detail":"Magic circle!"}')
    expect(stringify({ name: 'kiner', age: BigInt(999) })).toBe('{"name":"kiner","age":999}')
    const vnodeString = stringify({
      name: 'kiner',
      age: BigInt(99999),
      node: h('div', 'aaaa'),
      fn() {
        return 1
      },
    })
    expect(JSON.parse(vnodeString)).toMatchObject({
      name: 'kiner',
      age: 99999,
      node: {
        type: 'div',
        children: 'aaaa',
      },
    })
    expect(JSON.parse(vnodeString)).not.toHaveProperty('fn')
    expect(stringify({
      object: { a: { b: { c: { d: 1 } } } },
      array: [[[[[1]]]]],
    })).toBe('{"object":{"a":{"b":{"c":"[Object]"}}},"array":[[["[Array]"]]]}')
  })
})
