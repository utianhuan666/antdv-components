import type { ProFieldMoneyProps } from '@antdv/components'
import type { GroupProps as CheckboxGroupProps } from '../../field/components/Checkbox'
import type { GroupProps as RadioGroupProps } from '../../field/components/Radio'
import type { FieldDigitProps as FieldSecondDigitProps } from '../../field/components/Second'
import type { KeyLabel as SearchSelectKeyLabel } from '../../field/components/Select/SearchSelect'
import {
  FieldSelect,
  FieldStatus,
  FieldTimePicker,
  ProField,
  ProFieldBadgeColor,
  proFieldParsingValueEnumToArray,
} from '@antdv/components'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mountAttached, waitFor } from '../testUtils'
import { TreeSelectDemo } from './fixtures/treeSelectDemo'

const Button = defineComponent({
  name: 'FieldTestButton',
  setup(_, { slots }) {
    return () => <button>{slots.default?.()}</button>
  },
})

describe('field', () => {
  const statusValueEnum = {
    default: { text: '关闭', status: 'Default' },
    processing: { text: '运行中', status: 'Processing' },
    success: { text: '已上线', status: 'Success' },
    error: { text: '异常', status: 'Error' },
  }

  const requestOptions = [
    { label: '全部', value: 'all' },
    { label: '未解决', value: 'open' },
    { label: '已解决', value: 'closed' },
    { label: '解决中', value: 'processing' },
  ]

  async function settle() {
    await flushPromises()
    await nextTick()
  }

  const CompatProField = ProField as any
  const CompatFieldSelect = FieldSelect as any
  type MoneyPropsAlias = ProFieldMoneyProps
  type CheckboxGroupPropsAlias = CheckboxGroupProps
  type RadioGroupPropsAlias = RadioGroupProps
  type SearchSelectKeyLabelAlias = SearchSelectKeyLabel
  type FieldSecondDigitPropsAlias = FieldSecondDigitProps
  const moneyPropsAliasSmoke: Partial<MoneyPropsAlias> = { moneySymbol: false }
  const checkboxGroupPropsSmoke: Partial<CheckboxGroupPropsAlias> = { layout: 'horizontal' }
  const radioGroupPropsSmoke: Partial<RadioGroupPropsAlias> = { radioType: 'button' }
  const searchSelectKeyLabelSmoke: Partial<SearchSelectKeyLabelAlias> = { value: 'open' }
  const fieldSecondDigitPropsSmoke: Partial<FieldSecondDigitPropsAlias> = { placeholder: '请输入' }

  it('🐴 base use', () => {
    expect(moneyPropsAliasSmoke.moneySymbol).toBe(false)
    expect(checkboxGroupPropsSmoke.layout).toBe('horizontal')
    expect(radioGroupPropsSmoke.radioType).toBe('button')
    expect(searchSelectKeyLabelSmoke.value).toBe('open')
    expect(fieldSecondDigitPropsSmoke.placeholder).toBe('请输入')
    expect(proFieldParsingValueEnumToArray).toEqual(expect.any(Function))

    const wrapper = mount({
      render: () => <ProField text="100" valueType="money" mode="edit" />,
    })

    expect(wrapper.find('.ant-input-number').exists()).toBe(true)
    expect(wrapper.find('.ant-input-number-input').exists()).toBe(true)
  })

  it('🐴 percent=0', () => {
    const wrapper = mount({
      render: () => <ProField text={0} valueType="percent" mode="read" />,
    })

    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('%')
  })

  it('🐴 render 关闭 when text=0', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={0}
          valueType="select"
          valueEnum={{
            0: '关闭',
            1: '打开',
          }}
          mode="read"
        />
      ),
    })

    expect(wrapper.text()).toContain('关闭')
  })

  it('🐴 select valueEnum key is undefined', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="default"
          valueType="select"
          valueEnum={{
            default: undefined,
          }}
          mode="read"
        />
      ),
    })

    expect(wrapper.text()).toBe('default')
  })

  it('🐴 should trigger onChange function provided when change', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => <ProField text="hello" valueType="text" mode="edit" onChange={onChange} />,
    })

    await wrapper.find('input').setValue('changed')

    expect(onChange).toHaveBeenCalled()
  })

  it('🐴 money moneySymbol=false, no render moneySymbol', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="100"
          valueType="money"
          mode="read"
          fieldProps={{ moneySymbol: false, precision: 0 }}
        />
      ),
    })

    expect(wrapper.text()).toBe('100')
    expect(wrapper.text()).not.toContain('¥')
  })

  it('🐴 money onchange values', async () => {
    const wrapper = mount({
      render: () => <CompatProField text="100" numberPopoverRender valueType="money" mode="edit" />,
    })

    await wrapper.find('input').setValue('1000')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('¥ 1,000')

    await wrapper.find('input').setValue('¥ 100')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('¥ 100')
  })

  it('🐴 money onchange values, when no moneySymbol', async () => {
    const wrapper = mount({
      render: () => <CompatProField text="100" moneySymbol={false} valueType="money" mode="edit" />,
    })

    await wrapper.find('input').setValue('1000')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('1000')

    await wrapper.find('input').setValue('100')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('100')
  })

  it('🐴 money numberPopoverRender onchange values', async () => {
    const numberPopoverRender = vi.fn(() => '1234')
    const wrapper = mount({
      render: () => (
        <CompatProField
          text="100"
          numberPopoverRender={numberPopoverRender}
          valueType="money"
          mode="edit"
        />
      ),
    })

    await wrapper.find('input').setValue('1000')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('¥ 1,000')
  })

  it('🐴 money valueType object supports read and edit', () => {
    const editWrapper = mount({
      render: () => (
        <ProField
          text="100"
          valueType={{ type: 'money', locale: 'en-US' }}
          mode="edit"
        />
      ),
    })

    expect(editWrapper.find('.ant-input-number').exists()).toBe(true)

    const readWrapper = mount({
      render: () => (
        <ProField
          text="100"
          valueType={{ type: 'money', moneySymbol: false, locale: 'en-US' }}
          mode="read"
        />
      ),
    })

    expect(readWrapper.text()).toContain('100')
    expect(readWrapper.find('.ant-input-number').exists()).toBe(false)
  })

  it('🐴 password support open', async () => {
    const wrapper = mount({
      render: () => <ProField text="secret" valueType="password" mode="read" />,
    })

    expect(wrapper.text()).not.toContain('secret')
    const icon = wrapper.find('.anticon-eye-invisible')
    if (icon.exists())
      await icon.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('secret')
  })

  it('🐴 options support dom list', () => {
    const wrapper = mount({
      render: () => <ProField text={['编辑', '删除']} valueType="option" mode="read" />,
    })

    expect(wrapper.text()).toContain('编辑')
    expect(wrapper.text()).toContain('删除')
  })

  it('🐴 progress support string number', () => {
    const wrapper = mount({
      render: () => <ProField text="80" valueType="progress" mode="read" />,
    })

    expect(wrapper.find('.ant-progress').exists()).toBe(true)
  })

  it('🐴 progress support no number', () => {
    const wrapper = mount({
      render: () => <ProField text="qixian" valueType="progress" mode="read" />,
    })

    expect(wrapper.find('.ant-progress').exists()).toBe(true)
  })

  it('🐴 valueType={}', () => {
    const wrapper = mount({
      render: () => <ProField text="qixian" valueType={{} as any} mode="read" />,
    })

    expect(wrapper.text()).toBe('qixian')
  })

  it('🐴 valueType digitRange read use', () => {
    const wrapper = mount({
      render: () => <ProField text={[12.34, 56.78]} valueType="digitRange" mode="read" />,
    })

    expect(wrapper.text()).toContain('12.34')
    expect(wrapper.text()).toContain('56.78')
  })

  it('🐴 valueType digitRange placeholder array use', () => {
    const wrapper = mount({
      render: () => <ProField valueType="digitRange" mode="edit" placeholder={['Min', 'Max']} />,
    })

    const inputs = wrapper.findAll('.ant-input-number-input')
    expect(inputs[0]!.attributes('placeholder')).toBe('Min')
    expect(inputs[1]!.attributes('placeholder')).toBe('Max')
  })

  it('🐴 valueType digitRange will exchange when value1 > value2', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => (
        <ProField
          valueType="digitRange"
          mode="edit"
          fieldProps={{ onChange }}
        />
      ),
    })

    const inputs = wrapper.findAll('.ant-input-number-input')
    await inputs[0]!.setValue('56.78')
    await inputs[1]!.setValue('12.34')
    await wrapper.find('.ant-space-compact').trigger('blur')
    await settle()

    expect(onChange).toHaveBeenLastCalledWith([12.34, 56.78])
  })

  it('🐴 valueType digit support formatter', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={10000}
          mode="read"
          valueType="digit"
          fieldProps={{ formatter: (value: string) => `$${value}` }}
        />
      ),
    })

    expect(wrapper.text()).toBe('$10,000')
  })

  it('🐴 valueType digit support precision', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="1000.3"
          mode="read"
          valueType="digit"
          fieldProps={{ precision: 2 }}
        />
      ),
    })

    expect(wrapper.text()).toBe('1,000.30')
  })

  it('🐴 readonly and mode is edit use fieldProps.value', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          mode="edit"
          readonly
          valueType="text"
          fieldProps={{ value: 'readonly text' }}
        />
      ),
    })

    expect(wrapper.text()).toContain('readonly text')
  })

  it('🐴 render select form option', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="default"
          valueType="select"
          mode="read"
          fieldProps={{
            options: [
              { label: '关闭', value: 'default' },
              { label: '运行中', value: 'processing' },
            ],
          }}
        />
      ),
    })

    expect(wrapper.text()).toBe('关闭')
  })

  it('🐴 checkbox read mode keeps boolean false for valueEnum lookup', () => {
    const wrapper = mount({
      render: () => (
        <CompatProField
          text={false as any}
          valueType="checkbox"
          mode="read"
          valueEnum={{
            false: { text: '关闭' },
            true: { text: '开启' },
          }}
        />
      ),
    })

    expect(wrapper.text()).toContain('关闭')
  })

  ;(['select', 'checkbox', 'radio', 'radioButton', 'cascader', 'treeSelect', 'segmented'] as const).forEach((valueType) => {
    it(`🐴 ${valueType} read mode support render valueEnum`, () => {
      const wrapper = mount({
        render: () => (
          <CompatProField
            text="default"
            valueType={valueType as any}
            mode="read"
            render={(_text: any, _props: any, dom: any) => (
              <span>
                pre
                {dom}
              </span>
            )}
            valueEnum={statusValueEnum}
          />
        ),
      })

      expect(wrapper.text()).toContain('pre')
      expect(wrapper.text()).toContain('关闭')
    })

    it(`🐴 ${valueType} edit mode support formItemRender function`, () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text="default"
            valueType={valueType as any}
            mode="edit"
            formItemRender={() => <input id="select" value="default" />}
            valueEnum={statusValueEnum}
          />
        ),
      })

      expect(wrapper.find('#select').exists()).toBe(true)
    })

    it(`🐴 ${valueType} edit mode support formItemRender return null`, () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text="default"
            valueType={valueType as any}
            mode="edit"
            formItemRender={() => undefined as any}
            valueEnum={statusValueEnum}
          />
        ),
      })

      expect(wrapper.text()).toBe('')
    })

    it(`🐴 ${valueType} edit mode support formItemRender return 0`, () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text="default"
            valueType={valueType as any}
            mode="edit"
            formItemRender={() => 0 as any}
            valueEnum={statusValueEnum}
          />
        ),
      })

      expect(wrapper.text()).toBe('0')
    })
  })

  ;(['select', 'cascader', 'treeSelect'] as const).forEach((valueType) => {
    it(`🐴 ${valueType} read mode support request function`, async () => {
      const request = vi.fn(async () => requestOptions)
      const wrapper = mount(ProField as any, {
        props: {
          text: 'default',
          valueType,
          mode: 'read',
          request,
          proFieldKey: `request-${valueType}-${Date.now()}`,
        },
      })

      await settle()
      expect(request).toHaveBeenCalledTimes(1)
      ;(wrapper.vm as any).fetchData('test')
      await settle()
      expect(request).toHaveBeenCalledTimes(2)
    })

    it(`🐴 ${valueType} options fieldNames`, async () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text={['0-0', '0-0-0']}
            valueType={valueType as any}
            mode="read"
            fieldProps={{
              fieldNames: { label: 'title', options: 'children' },
              options: [
                {
                  title: 'Node1',
                  value: '0-0',
                  children: [{ title: 'Child Node1', value: '0-0-0' }],
                },
              ],
            }}
          />
        ),
      })

      await settle()
      expect(wrapper.text()).toBe('Node1,Child Node1')
    })

    it(`🐴 ${valueType} request loading without request`, () => {
      const wrapper = mount({
        render: () => (
          <CompatProField
            text="default"
            valueType={valueType as any}
            mode="read"
            options={[]}
          />
        ),
      })

      expect(wrapper.text()).toBe('default')
    })
  })

  it('🐴 select valueEnum and request=null ', () => {
    const wrapper = mount({
      render: () => <ProField text="default" valueType="select" mode="read" />,
    })

    expect(wrapper.text()).toBe('default')
  })

  it('🐴 select labelInValue use label in read mode', () => {
    const wrapper = mount({
      render: () => (
        <CompatProField
          text={{ label: '不解决', value: 'test' }}
          fieldProps={{ labelInValue: true }}
          valueType="select"
          mode="read"
          options={requestOptions}
        />
      ),
    })

    expect(wrapper.text()).toBe('不解决')
  })

  it('🐴 select labelInValue use label in light edit mode', async () => {
    const wrapper = mount({
      render: () => (
        <CompatProField
          fieldProps={{
            labelInValue: true,
            value: { label: '不解决', value: 'test' },
          }}
          light
          valueType="select"
          mode="edit"
          options={requestOptions}
        />
      ),
    })

    await settle()
    expect(wrapper.find('.ant-pro-core-field-label').text()).toContain('不解决')
  })

  it('🐴 select text=null & valueEnum=null ', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={null as any}
          valueEnum={null as any}
          valueType="select"
          mode="read"
        />
      ),
    })

    expect(wrapper.text()).toBe('-')
  })

  it('🐴 select options should change text', async () => {
    const Demo = defineComponent({
      data: () => ({
        options: [{ label: '全部', value: 'all' }],
      }),
      render() {
        return (
          <ProField
            text="all"
            fieldProps={{ options: this.options }}
            valueType="select"
            mode="read"
          />
        )
      },
    })
    const wrapper = mount(Demo)

    expect(wrapper.text()).toBe('全部')
    await wrapper.setData({ options: [] })
    expect(wrapper.text()).toBe('all')
  })

  const valueTypes = [
    'password',
    'money',
    'textarea',
    'date',
    'fromNow',
    'dateRange',
    'dateTimeRange',
    'dateTime',
    'time',
    'timeRange',
    'switch',
    'text',
    'progress',
    'percent',
    'digit',
    'digitRange',
    'second',
    'code',
    'jsonCode',
    'rate',
    'image',
    'color',
    'slider',
    'cascader',
    'treeSelect',
  ] as const

  valueTypes.forEach((valueType) => {
    it(`🐴 valueType support render ${valueType}`, () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text="1994-07-29 12:00:00"
            mode="read"
            valueType={valueType as any}
            render={() => <span>qixian</span>}
          />
        ),
      })

      expect(wrapper.text()).toBe('qixian')
    })

    it(`🐴 valueType render ${valueType} when text is null`, async () => {
      const wrapper = mount({
        render: () => <ProField text={null as any} valueType={valueType as any} />,
      })

      await settle()
      expect(wrapper.text()).toBe('-')
    })

    it(`🐴 valueType support render ${valueType} when text is null`, async () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text={null as any}
            valueType={valueType as any}
            render={() => <>qixian</>}
          />
        ),
      })

      await settle()
      expect(wrapper.text()).toBe('qixian')
    })

    it(`🐴 valueType formItemRender ${valueType}`, () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text={Date.parse('2019-11-16T12:50:26')}
            mode="edit"
            valueType={valueType as any}
            formItemRender={() => <span>qixian</span>}
          />
        ),
      })

      expect(wrapper.text()).toBe('qixian')
    })

    it(`🐴 ${valueType} mode="error"`, () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text="2019-11-16 12:50:26"
            mode={'error' as any}
            valueType={valueType as any}
          />
        ),
      })

      expect(wrapper.text()).toBe('')
    })
  })

  it('🐴 percent support unit string in read mode', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="100%"
          valueType={{ type: 'percent', showSymbol: true }}
          mode="read"
        />
      ),
    })

    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('%')
  })

  it('🐴 percent valueType is Object', () => {
    const wrapper = mount({
      render: () => (
        <CompatProField
          text="100"
          valueType={{ type: 'percent', showSymbol: true, precision: 1 }}
          mode="read"
          showColor
        />
      ),
    })

    expect(wrapper.text()).toBe('+ 100.0%')
  })

  it('🐴 percent prefix onchange values', async () => {
    const wrapper = mount({
      render: () => (
        <CompatProField
          text="100"
          valueType={{ type: 'percent' }}
          prefix="???"
          mode="edit"
        />
      ),
    })

    await wrapper.find('.ant-input-number-input').setValue('123456')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('??? 123,456')
  })

  it('🐴 percent magic prefix onchange values', async () => {
    const magicPrefix = '1234567890 ~!@#$%^&*()_+{}:"?> <?>L:'
    const wrapper = mount({
      render: () => (
        <CompatProField
          text="100"
          valueType={{ type: 'percent' }}
          prefix={magicPrefix}
          mode="edit"
        />
      ),
    })

    await wrapper.find('.ant-input-number-input').setValue('123456')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe(`${magicPrefix} 123,456`)
  })

  it('🐴 password support controlled open', async () => {
    const onOpenChange = vi.fn()
    const wrapper = mount({
      render: () => (
        <ProField
          text={123456}
          valueType="password"
          mode="read"
          open
          onOpenChange={onOpenChange}
        />
      ),
    })

    expect(wrapper.text()).toContain('123456')
    await wrapper.find('.anticon-eye').trigger('click')
    expect(wrapper.text()).toContain('123456')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('🐴 options support empty dom', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          render={() => [] as any}
          text={[]}
          valueType="option"
          mode="read"
        />
      ),
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('🐴 options support no text', () => {
    const wrapper = mount({
      render: () => <ProField text="qixian" valueType="option" mode="read" />,
    })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('🐴 options support dom text', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={['新建', <Button key="edit">修改</Button>]}
          valueType="option"
          mode="read"
        />
      ),
    })

    expect(wrapper.text()).toContain('新建')
    expect(wrapper.findAll('button')).toHaveLength(1)
  })

  it('🐴 options support one dom', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={[<Button key="add">新建</Button>]}
          valueType="option"
          mode="read"
        />
      ),
    })

    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.find('button').text()).toContain('新建')
  })

  it('🐴 keypress simulate', async () => {
    const Demo = defineComponent({
      data: () => ({ mode: 'edit' as 'edit' | 'read' }),
      render() {
        return <ProField text="qixian" valueType="textarea" mode={this.mode} />
      },
    })
    const wrapper = mount(Demo)

    await wrapper.find('textarea').trigger('keypress', { key: 'Enter', keyCode: 13 })
    await wrapper.setData({ mode: 'read' })
    expect(wrapper.text()).toBe('qixian')
  })

  it('🐴 valueType formItemRender return number', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={Date.parse('2019-11-16T12:50:26')}
          mode="edit"
          formItemRender={() => 2 as any}
        />
      ),
    })

    expect(wrapper.text()).toBe('2')
  })

  it('🐴 valueType digit support precision when change with stringMode', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => (
        <ProField
          text={1000.3}
          mode="edit"
          valueType="digit"
          onChange={onChange}
          fieldProps={{
            precision: 20,
            stringMode: true,
          }}
        />
      ),
    })

    await wrapper.find('input').setValue('1.00000000000007')
    expect(onChange).toHaveBeenCalledWith('1.00000000000007')
  })

  ;(['Success', 'Processing', 'Default', 'Error', 'Warning', 'success', 'processing', 'default', 'error', 'warning'] as const).forEach((item) => {
    it(`🐴 FieldStatus status ${item}`, () => {
      const Component = FieldStatus[item]
      const wrapper = mount({ render: () => <Component /> })

      expect(wrapper.find('.ant-badge-status').exists()).toBe(true)
      expect(wrapper.find('.ant-badge-status-dot').classes().join(' ').toLowerCase()).toContain(item.toLowerCase())
    })
  })

  it('🐴 FieldTimePicker text support is null', () => {
    const wrapper = mount({
      render: () => <FieldTimePicker mode="read" text={null as any} />,
    })

    expect(wrapper.text()).toContain('-')
  })

  it('🐴 ProFieldBadgeColor status', () => {
    const wrapper = mount({
      render: () => <ProFieldBadgeColor color="#1890ff" />,
    })

    expect(wrapper.find('.ant-badge-status-dot').exists()).toBe(true)
    expect((wrapper.find('.ant-badge-status-dot').element as HTMLElement).style.background).toBeTruthy()
  })

  it('🐴 text render null', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={10000}
          mode="read"
          render={() => undefined as any}
          emptyText="-"
        />
      ),
    })

    expect(wrapper.text()).toBe('-')
  })

  it('🐴 dateRange support placeholder', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={[new Date('2024-01-01'), new Date('2024-01-02')]}
          valueType="dateRange"
          mode="edit"
          placeholder="test"
        />
      ),
    })

    expect(wrapper.findAll('input').every(input => input.attributes('placeholder') === 'test')).toBe(true)
  })

  it('🐴 select request debounceTime', async () => {
    vi.useFakeTimers()
    const request = vi.fn(async (params?: any) => {
      return [{ label: params?.keyWords || '全部', value: params?.keyWords || 'all' }]
    })
    const wrapper = mount(ProField as any, {
      props: {
        text: 'default',
        debounceTime: 200,
        valueType: 'select',
        mode: 'edit',
        request,
      },
    })

    await vi.runOnlyPendingTimersAsync()
    await settle()
    expect(request).toHaveBeenCalledTimes(1)

    for (let index = 0; index < 10; index++)
      (wrapper.vm as any).fetchData(String(index))

    await vi.advanceTimersByTimeAsync(199)
    expect(request).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    await settle()
    expect(request).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('🐴 FieldSelect support clear', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => (
        <CompatFieldSelect
          light
          mode="edit"
          valueEnum={{
            clear: '清空',
            all: '全部',
            open: '未解决',
          }}
          fieldProps={{
            value: 'open',
            onChange,
            allowClear: true,
          }}
          text="open"
        />
      ),
    })

    await settle()
    expect(wrapper.text()).toContain('未解决')
    const clear = wrapper.find('.ant-pro-core-field-label-close')
    expect(clear.exists()).toBe(true)
    await clear.trigger('click')
    expect(onChange).toHaveBeenCalled()
  })

  {
    const CompatProField = ProField as any

    const requestOptions = [
      { label: '全部', value: 'all' },
      { label: '未解决', value: 'open' },
      { label: '已解决', value: 'closed' },
      { label: '解决中', value: 'processing' },
    ]

    async function settle() {
      await flushPromises()
      await nextTick()
    }

    function inputValues(wrapper: ReturnType<typeof mount>) {
      return wrapper
        .findAll<HTMLInputElement>('.ant-input-number-input')
        .map(input => input.element.value)
    }

    function getSearchInput(): HTMLInputElement {
      const input = document.body.querySelector<HTMLInputElement>('input.ant-select-input')
      expect(input).toBeTruthy()
      return input!
    }

    function getTreeTitles() {
      return Array.from(document.body.querySelectorAll<HTMLSpanElement>('.ant-select-tree-title'))
    }

    function getClosedSwitchers() {
      return Array.from(document.body.querySelectorAll<HTMLSpanElement>('.ant-select-tree-switcher_close'))
    }

    function last<T>(items: T[]) {
      return items[items.length - 1]
    }

    async function searchTree(value: string) {
      const input = getSearchInput()
      input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      await settle()
    }

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('🐴 valueType digitRange placeholder use', () => {
      const wrapper = mount({
        render: () => <ProField mode="edit" valueType="digitRange" />,
      })

      const inputs = wrapper.findAll('.ant-input-number-input')
      expect(inputs[0]!.attributes('placeholder')).toBe('请输入')
      expect(inputs[1]!.attributes('placeholder')).toBe('请输入')
    })

    it('🐴 valueType digitRange normal input simulate', async () => {
      const wrapper = mount({
        render: () => <ProField mode="edit" valueType="digitRange" />,
      })

      const inputs = wrapper.findAll('.ant-input-number-input')
      await inputs[0]!.setValue('12.34')
      await inputs[1]!.setValue('56.78')
      await settle()

      expect(inputValues(wrapper)).toEqual(['12.34', '56.78'])
    })

    it('🐴 digitRange support placeholder', async () => {
      const onChange = vi.fn()
      const wrapper = mount({
        render: () => (
          <ProField
            text={[10000, 20000]}
            valueType="digitRange"
            emptyText="-"
            mode="edit"
            placeholder="test"
            fieldProps={{
              value: [30000, 20000],
            }}
            onChange={onChange}
          />
        ),
      })

      const inputs = wrapper.findAll('.ant-input-number-input')
      expect(inputs[0]!.attributes('placeholder')).toBe('test')
      expect(inputs[1]!.attributes('placeholder')).toBe('test')
      expect(inputValues(wrapper)).toEqual(['30000', '20000'])

      await wrapper.find('.ant-space-compact').trigger('blur')
      await inputs[0]!.trigger('blur')
      await settle()

      expect(onChange).toHaveBeenCalledWith([20000, 30000])
    })

    ;(['select', 'cascader', 'treeSelect'] as const).forEach((valueType) => {
      it(`🐴 ${valueType} request loading with request`, () => {
        const request = vi.fn(
          () => new Promise<typeof requestOptions>(() => {}),
        )

        const wrapper = mount({
          render: () => (
            <CompatProField
              text="default"
              valueType={valueType}
              mode="read"
              request={request}
            />
          ),
        })

        expect(wrapper.text()).toBe('default')
      })
    })

    it('🐴 select mode=null', () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text="default"
            valueType="select"
            mode="edit"
            fieldProps={{
              mode: null,
              options: requestOptions,
            }}
          />
        ),
      })

      expect(wrapper.find('.ant-select').exists()).toBe(true)
      expect(wrapper.find('.ant-select-multiple').exists()).toBe(false)
    })

    it('🐴 treeSelect searchValue control mode', async () => {
      const onSearch = vi.fn()
      const wrapper = mountAttached({
        render: () => (
          <TreeSelectDemo
            multiple={false}
            labelInValue={false}
            showSearch={{
              onSearch,
            }}
          />
        ),
      })

      await settle()
      await searchTree('test')

      expect(onSearch).toHaveBeenLastCalledWith('test')

      const showSearch = {
        searchValue: undefined as string | undefined,
        onSearch,
      }
      const controlled = defineComponent({
        data: () => ({ showSearch }),
        render() {
          return (
            <TreeSelectDemo
              showSearch={this.showSearch}
              multiple={false}
              labelInValue={false}
            />
          )
        },
      })

      wrapper.unmount()
      const controlledWrapper = mountAttached(controlled)
      await settle()
      await controlledWrapper.setData({
        showSearch: {
          searchValue: 'ProComponents',
          onSearch,
        },
      })
      await settle()

      expect(getSearchInput().value).toBe('ProComponents')

      controlledWrapper.unmount()
    })

    it('🐴 treeSelect options single value', async () => {
      const onChangeFn = vi.fn()
      const TreeSelectChangeDemo = defineComponent({
        setup() {
          const value = ref()
          return () => (
            <TreeSelectDemo
              multiple={false}
              labelInValue={false}
              onChange={(res: any) => {
                onChangeFn(Array.isArray(res))
                value.value = res
              }}
            />
          )
        },
      })

      const wrapper = mountAttached(TreeSelectChangeDemo)

      await waitFor(() => {
        expect(document.body.textContent).toContain('Node2')
      }, 2000)

      await searchTree('Node5')

      getClosedSwitchers().forEach(item => item.click())
      await settle()

      await waitFor(() => {
        expect(document.body.textContent).toContain('Child Node5')
      })

      last(getTreeTitles())?.click()
      await settle()

      expect(document.body.textContent).toContain('Child Node5')
      expect(onChangeFn).toHaveBeenCalledWith(false)

      wrapper.unmount()
    })

    it('🐴 treeSelect support request function and search, asynchronously loadData', async () => {
      const requestFn = vi.fn()
      const onSearchFn = vi.fn()
      const onBlurFn = vi.fn()
      const loadDataFn = vi.fn()
      const onClearFn = vi.fn()

      const TreeSelectChangeDemo = defineComponent({
        setup() {
          const value = ref()
          return () => (
            <TreeSelectDemo
              showSearch={{
                onSearch: onSearchFn,
              }}
              onBlur={onBlurFn}
              onClear={onClearFn}
              loadData={async (node: any) => {
                loadDataFn(!!node)
              }}
              value={value.value}
              request={requestFn}
              onChange={(res: any) => {
                value.value = res
              }}
            />
          )
        },
      })

      const wrapper = mountAttached(TreeSelectChangeDemo)

      await waitFor(() => {
        expect(requestFn).toHaveBeenCalledTimes(1)
      }, 2000)

      await waitFor(() => {
        expect(document.body.textContent).toContain('Node2')
      }, 2000)

      last(getClosedSwitchers())?.click()
      await settle()
      last(getClosedSwitchers())?.click()
      await settle()

      await waitFor(() => {
        expect(getSearchInput()).toBeTruthy()
      })

      await searchTree('Node5')

      await waitFor(() => {
        expect(onSearchFn).toHaveBeenCalled()
      })

      getClosedSwitchers().forEach(item => item.click())
      await settle()

      await waitFor(() => {
        expect(getTreeTitles()).toHaveLength(2)
      }, 2000)

      getTreeTitles()[0]?.click()
      await settle()

      last(getTreeTitles())?.click()
      await settle()

      await waitFor(() => {
        expect(document.body.textContent).toContain('Child Node5')
        expect(document.body.textContent).toContain('Node2')
      })

      expect(getSearchInput().value).toBe('')

      const clearBtn = document.body.querySelector<HTMLElement>('.ant-select-clear')
      if (clearBtn) {
        clearBtn.click()
        clearBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        await waitFor(() => {
          expect(onClearFn).toHaveBeenCalled()
        })
      }

      onBlurFn.mockClear()
      getSearchInput().dispatchEvent(new FocusEvent('blur', { bubbles: true }))
      await settle()

      expect(onBlurFn).toHaveBeenCalled()
      expect(loadDataFn).toHaveBeenCalledWith(true)

      wrapper.unmount()
    })

    it('🐴 money show Popover', async () => {
      const wrapper = mount({
        render: () => (
          <CompatProField
            text="100"
            numberPopoverRender
            fieldProps={{ open: true }}
            valueType="money"
            mode="edit"
          />
        ),
      })

      await wrapper.find<HTMLInputElement>('.ant-input-number-input').setValue('111111111')
      await settle()

      const input = wrapper.find<HTMLInputElement>('.ant-input-number-input')
      expect(input.element.value).toBe('¥ 111,111,111')

      await input.trigger('click')
      await input.trigger('focus')
      await input.trigger('mouseenter')
      await input.trigger('mousedown')
    })

    it('🐴 light select dropdown toggle', async () => {
      const wrapper = mountAttached({
        render: () => (
          <ProField
            text="default"
            valueType="select"
            mode="edit"
            light
            fieldProps={{
              value: 'all',
              options: [
                { label: '全部', value: 'all' },
                { label: '未解决', value: 'open' },
                { label: '已解决', value: 'closed' },
                { label: '解决中', value: 'processing' },
              ],
            }}
          />
        ),
      })

      await settle()
      const label = wrapper.find('.ant-pro-core-field-label')
      expect(label.exists()).toBe(true)
      expect(wrapper.find('.ant-select').exists()).toBe(true)

      await label.trigger('click')
      expect(label.exists()).toBe(true)
    })
  }
})
