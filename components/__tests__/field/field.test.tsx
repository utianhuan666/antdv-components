import type { ProFieldMoneyProps } from '@antdv/components'
import type { GroupProps as CheckboxGroupProps } from '../../field/components/Checkbox'
import type { GroupProps as RadioGroupProps } from '../../field/components/Radio'
import type { FieldDigitProps as FieldSecondDigitProps } from '../../field/components/Second'
import type { KeyLabel as SearchSelectKeyLabel } from '../../field/components/Select/SearchSelect'
import {
  createIntl,
  FieldCascader,
  FieldSelect,
  FieldStatus,
  FieldTimePicker,
  FieldTreeSelect,
  ProConfigProvider,
  ProField,
  ProFieldBadgeColor,
  proFieldParsingValueEnumToArray,
  PureProField,
} from '@antdv/components'
import { flushPromises, mount } from '@vue/test-utils'
import { Cascader as AntCascader, InputNumber as AntInputNumber, Popover as AntPopover, Select as AntSelect, ConfigProvider, Form, FormItem } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import InputNumberPopover from '../../field/components/Money/InputNumberPopover'
import { useFieldFetchData } from '../../field/components/Select'
import LightSelect from '../../field/components/Select/LightSelect'
import SearchSelect from '../../field/components/Select/SearchSelect'
import ProFieldLightWrapper from '../../field/internal/ProFieldLightWrapper'
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
  const CompatSearchSelect = SearchSelect as any
  const CompatLightSelect = LightSelect as any
  const CompatInputNumberPopover = InputNumberPopover as any
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

  it('uses getPrefixCls for field class names from antd config', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ConfigProvider prefixCls="acme">
          <div>
            <ProField text={1} valueType="index" mode="read" />
            <ProField text={1} valueType="indexBorder" mode="read" />
            <ProField text="#1677ff" valueType="color" mode="read" />
            <ProField text="line one" valueType="textarea" mode="read" />
            <ProField text={[<a>Action</a>]} valueType="option" mode="read" />
            <ProField
              text="open"
              valueType="select"
              mode="edit"
              light
              valueEnum={{ open: 'Open' }}
            />
          </div>
        </ConfigProvider>
      ),
    })

    await nextTick()

    expect(wrapper.find('.acme-pro-field-index-column').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-field-index-column-border').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-field-color-picker').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-field-readonly-textarea').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-field-option').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-field-select-light-select').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-field-index-column').exists()).toBe(false)
  })

  it('uses React-compatible pro-filed-search-select prefix from antd config', async () => {
    mountAttached({
      render: () => (
        <ConfigProvider prefixCls="acme">
          <CompatSearchSelect
            open
            value="open"
            options={[{ label: 'Open', value: 'open' }]}
          />
        </ConfigProvider>
      ),
    })

    await nextTick()

    expect(document.body.querySelector('.acme-pro-filed-search-select-option')).not.toBeNull()
    expect(document.body.querySelector('.ant-pro-filed-search-select-option')).toBeNull()
  })

  it('cascader update mode follows React edit-only branch', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="open"
          valueType="cascader"
          mode="update"
          valueEnum={{ open: 'Open' }}
        />
      ),
    })

    expect(wrapper.text()).toBe('')
  })

  it('treeSelect read render receives raw text and parsed dom', () => {
    const render = vi.fn((_text: any, _props: any, dom: any) => <span class="tree-render">{dom}</span>)
    const wrapper = mount({
      render: () => (
        <ProField
          text="open"
          valueType="treeSelect"
          mode="read"
          valueEnum={{ open: 'Open' }}
          render={render}
        />
      ),
    })

    expect(render.mock.calls[0]?.[0]).toBe('open')
    expect(wrapper.find('.tree-render').text()).toBe('Open')
  })

  it('cascader read render undefined falls through to null', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="open"
          valueType="cascader"
          mode="read"
          valueEnum={{ open: 'Open' }}
          emptyText="EMPTY"
          render={() => undefined as any}
        />
      ),
    })

    expect(wrapper.text()).toBe('')
  })

  it('field edit placeholders read ProConfigProvider intl', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProConfigProvider
          intl={createIntl('en', {
            tableForm: {
              inputPlaceholder: 'Type custom',
              selectPlaceholder: 'Pick custom',
            },
          })}
        >
          <div>
            <ProField text="" valueType="text" mode="edit" />
            <ProField text={0} valueType="digit" mode="edit" />
            <ProField text="" valueType="select" mode="edit" valueEnum={{ open: 'Open' }} />
            <ProField
              text=""
              valueType="cascader"
              mode="edit"
              options={[{ label: 'Open', value: 'open' }]}
            />
          </div>
        </ProConfigProvider>
      ),
    })

    await settle()

    expect(wrapper.html()).toContain('Type custom')
    expect(wrapper.html()).toContain('Pick custom')
  })

  it('text edit autoFocus focuses input', async () => {
    mountAttached({
      render: () => <ProField text="" valueType="text" mode="edit" fieldProps={{ autoFocus: true }} />,
    })

    await settle()
    await new Promise<void>(resolve => queueMicrotask(() => resolve()))

    expect(document.activeElement?.tagName).toBe('INPUT')
  })

  it('field refs expose fetchData and focus when available', async () => {
    const selectRef = ref<any>()
    const cascaderRef = ref<any>()
    const treeSelectRef = ref<any>()
    const request = vi.fn(async () => [{ label: 'Open', value: 'open' }])

    mountAttached({
      render: () => (
        <div>
          <FieldSelect ref={selectRef} mode="edit" request={request} />
          <FieldCascader ref={cascaderRef} mode="edit" request={request} />
          <FieldTreeSelect ref={treeSelectRef} mode="edit" request={request} />
        </div>
      ),
    })

    await settle()

    for (const fieldRef of [selectRef, cascaderRef, treeSelectRef]) {
      expect(fieldRef.value?.fetchData).toEqual(expect.any(Function))
      expect(fieldRef.value?.focus).toEqual(expect.any(Function))
    }
  })

  ;(['radio', 'checkbox'] as const).forEach((valueType) => {
    it(`${valueType} edit mode reflects FormItem status and vertical layout`, async () => {
      const wrapper = mountAttached({
        render: () => (
          <Form>
            <FormItem validateStatus="error">
              <ProField
                text="open"
                valueType={valueType}
                mode="edit"
                layout={valueType === 'checkbox' ? 'vertical' : undefined}
                fieldProps={valueType === 'radio' ? { layout: 'vertical' } : undefined}
                options={[{ label: 'Open', value: 'open' }]}
              />
            </FormItem>
          </Form>
        ),
      })

      await settle()

      expect(wrapper.find(`.ant-pro-field-${valueType}-error`).exists()).toBe(true)
      expect(wrapper.find(`.ant-pro-field-${valueType}-vertical`).exists()).toBe(true)
    })
  })

  it('cascader read and edit branches keep rest props and open callbacks', async () => {
    const readRender = vi.fn((text: any, config: any, dom: any) => <span class="cascader-read">{dom}</span>)
    const readWrapper = mount({
      render: () => (
        <FieldCascader
          text="open"
          mode="read"
          valueEnum={{ open: 'Open' }}
          fieldProps={{ className: 'read-extra' }}
          render={readRender}
        />
      ),
    })

    expect(readWrapper.find('.cascader-read').text()).toBe('Open')
    expect(readRender.mock.calls[0]?.[0]).toBe('open')
    expect(readRender.mock.calls[0]?.[1]).toMatchObject({ mode: 'read', className: 'read-extra' })

    const onOpenChange = vi.fn()
    const request = vi.fn(async () => [{ label: 'Open', value: 'open' }])
    const cascaderRef = ref<any>()
    const editWrapper = mountAttached({
      render: () => (
        <FieldCascader
          ref={cascaderRef}
          text={['open']}
          mode="edit"
          request={request}
          fieldProps={{ value: ['open'], onOpenChange }}
        />
      ),
    })

    await settle()
    expect(request).toHaveBeenCalledTimes(1)

    const cascader = editWrapper.findComponent(AntCascader)
    expect(cascader.exists()).toBe(true)
    cascader.vm.$emit('openChange', true)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(cascaderRef.value?.fetchData).toEqual(expect.any(Function))
  })

  it('money input number popover preserves controlled value and open events', async () => {
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    const contentRender = vi.fn((props: any) => <span class="money-popover">{props.value}</span>)
    const wrapper = mount({
      render: () => (
        <CompatInputNumberPopover
          defaultValue={100}
          open={false}
          onChange={onChange}
          onOpenChange={onOpenChange}
          contentRender={contentRender}
        />
      ),
    })

    await settle()
    expect(contentRender).toHaveBeenLastCalledWith(expect.objectContaining({ value: 100 }))
    wrapper.findComponent(AntInputNumber).vm.$emit('change', 200)
    expect(onChange).toHaveBeenCalledWith(200)
    wrapper.findComponent(AntPopover).vm.$emit('openChange', true)
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('light select renders hidden select and clear only emits change', async () => {
    const fetchData = vi.fn()
    const onChange = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <CompatLightSelect
          label="Status"
          value="open"
          options={[{ label: 'Open', value: 'open' }]}
          fetchData={fetchData}
          onChange={onChange}
        />
      ),
    })

    await settle()
    expect(wrapper.find('.ant-select').exists()).toBe(true)
    expect(wrapper.classes()).toContain('ant-pro-field-select-light-select')
    expect(wrapper.classes()).toContain('ant-pro-field-select-light-select-container-bottomLeft')

    await wrapper.find('.ant-pro-core-field-label-close').trigger('click')
    expect(onChange).toHaveBeenCalledWith(undefined, undefined)
    expect(fetchData).not.toHaveBeenCalled()

    const emptyWrapper = mountAttached({
      render: () => (
        <CompatLightSelect
          label="Status"
          options={[{ label: 'Open', value: 'open' }]}
          fetchData={vi.fn()}
          open
        />
      ),
    })

    await settle()
    expect(emptyWrapper.find('.ant-select').exists()).toBe(true)
    expect(emptyWrapper.findComponent(AntSelect).props('open')).toBe(true)
  })

  it('search select uses explicit defaults and supports autoFocus', async () => {
    const fetchData = vi.fn()
    const onSearch = vi.fn()
    const resetData = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <CompatSearchSelect
          showSearch
          autoFocus
          fetchData={fetchData}
          resetData={resetData}
          onSearch={onSearch}
          options={[{ label: 'Open', value: 'open' }]}
        />
      ),
    })

    await settle()
    await new Promise<void>(resolve => queueMicrotask(() => resolve()))

    const select = wrapper.findComponent(AntSelect)
    expect(select.props('allowClear')).toBe(true)
    expect(select.props('optionFilterProp')).toBe('label')
    expect(select.props('optionLabelProp')).toBe('label')
    ;(select.props('onSearch') as (value: string) => void)('abc')
    expect(fetchData).toHaveBeenCalledWith('abc')
    expect(onSearch).toHaveBeenCalledWith('abc')
    expect(document.activeElement?.tagName).toBe('INPUT')

    const disabledClearWrapper = mount({
      render: () => (
        <CompatSearchSelect
          allowClear={false}
          fetchData={vi.fn()}
          resetData={vi.fn()}
          options={[]}
        />
      ),
    })

    expect(disabledClearWrapper.findComponent(AntSelect).props('allowClear')).toBe(false)
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

  it('🐴 money fieldProps onChange and onBlur values', async () => {
    const onChange = vi.fn()
    const onBlur = vi.fn()
    const wrapper = mount({
      render: () => (
        <ProField
          text="100"
          valueType="money"
          mode="edit"
          fieldProps={{ onChange, onBlur }}
        />
      ),
    })

    await wrapper.find('input').setValue('1000')
    expect(onChange).toHaveBeenCalled()

    await wrapper.find('input').trigger('blur')
    expect(onBlur).toHaveBeenCalled()
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

  it('🐴 valueType digitRange base use', () => {
    const wrapper = mount({
      render: () => <ProField text={[1, 10]} valueType="digitRange" mode="edit" />,
    })

    expect(wrapper.findAll('.ant-input-number-input')).toHaveLength(2)
  })

  it('🐴 valueType digitRange read use', () => {
    const wrapper = mount({
      render: () => <ProField text={[12.34, 56.78]} valueType="digitRange" mode="read" />,
    })

    expect(wrapper.text()).toContain('12.34')
    expect(wrapper.text()).toContain('56.78')
  })

  it('🐴 valueType digitRange placeholder use', () => {
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
    await wrapper.find('span[style*="inline-flex"]').trigger('blur')
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

  it('🐴 readonly and mode is edit updates with fieldProps.value', async () => {
    const Demo = defineComponent({
      data: () => ({ value: 2000 }),
      render() {
        return (
          <ProField
            text={10000}
            mode="edit"
            readonly
            fieldProps={{ value: this.value }}
          />
        )
      },
    })
    const wrapper = mount(Demo)

    expect(wrapper.text()).toBe('2000')
    await wrapper.setData({ value: 20000 })
    expect(wrapper.text()).toBe('20000')
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

  it('🐴 select valueEnum value is undefined falls back to text', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="default"
          valueType="select"
          mode="read"
          valueEnum={{ default: undefined, processing: { text: '运行中' } }}
        />
      ),
    })

    expect(wrapper.text()).toBe('default')
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

    it(`🐴 ${valueType} invalid mode renders empty`, () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text="default"
            valueType={valueType as any}
            mode={'test' as any}
            valueEnum={statusValueEnum}
          />
        ),
      })

      expect(wrapper.text()).toBe('')
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

  it('🐴 select read render receives parsed dom and respects null return', () => {
    const render = vi.fn((dom: any) => <span class="parsed-dom">{dom}</span>)
    const wrapper = mount({
      render: () => (
        <ProField
          text="open"
          valueType="select"
          mode="read"
          valueEnum={{ open: 'Open' }}
          render={render}
        />
      ),
    })

    expect(wrapper.find('.parsed-dom').text()).toBe('Open')
    expect(render.mock.calls[0]![0]).not.toBe('open')

    const nullWrapper = mount({
      render: () => (
        <ProField
          text="open"
          valueType="select"
          mode="read"
          valueEnum={{ open: 'Open' }}
          render={() => null as any}
        />
      ),
    })
    expect(nullWrapper.text()).toBe('')
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

  it('🐴 percent supports precision variants', () => {
    const make = (text: any, precision: number) => mount({
      render: () => (
        <ProField
          text={text}
          valueType={{ type: 'percent', showSymbol: true, precision }}
          mode="read"
        />
      ),
    })

    expect(make('100', 0).text()).toBe('+ 100%')
    expect(make('100.01', 0).text()).toBe('+ 100%')
    expect(make('100', -1).text()).toBe('+ 100%')
    expect(make(-100, 1).text()).toBe('- 100.0%')
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

  it('🐴 valueType formItemRender clone vnode with merged fieldProps', async () => {
    const fieldOnChange = vi.fn()
    const propOnChange = vi.fn()
    const wrapper = mount({
      render: () => (
        <ProField
          value="merged"
          mode="edit"
          valueType="text"
          onChange={propOnChange}
          fieldProps={{
            'data-field': 'field',
            'onChange': fieldOnChange,
          }}
          formItemRender={() => <input id="clone-target" />}
        />
      ),
    })

    const input = wrapper.find<HTMLInputElement>('#clone-target')
    expect(input.attributes('data-field')).toBe('field')
    expect(input.element.value).toBe('merged')

    await input.trigger('change')
    expect(fieldOnChange).toHaveBeenCalledTimes(1)
    expect(propOnChange).toHaveBeenCalledTimes(1)
  })

  it('🐴 valueType formItemRender returned vnode props override merged fieldProps', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          value="merged"
          mode="edit"
          valueType="text"
          fieldProps={{
            'data-field': 'field',
          }}
          formItemRender={() => <input id="clone-own" data-field="own" value="own" />}
        />
      ),
    })

    const input = wrapper.find<HTMLInputElement>('#clone-own')
    expect(input.attributes('data-field')).toBe('own')
    expect(input.element.value).toBe('own')
  })

  it('🐴 custom valueTypeMap render is not wrapped by field render', () => {
    const valueTypeMap = {
      custom: {
        render: (_text: any, _props: any, dom: any) => <span class="custom-render">{dom}</span>,
        formItemRender: (_text: any, _props: any, dom: any) => <span class="custom-edit">{dom}</span>,
      },
    }
    const wrapper = mount({
      render: () => (
        <ProConfigProvider valueTypeMap={valueTypeMap}>
          <ProField
            text="custom text"
            valueType={'custom' as any}
            mode="read"
            render={() => <span class="outer-render">outer</span>}
          />
        </ProConfigProvider>
      ),
    })

    expect(wrapper.find('.custom-render').exists()).toBe(true)
    expect(wrapper.find('.outer-render').exists()).toBe(false)
    expect(wrapper.text()).toBe('custom text')
  })

  it('🐴 empty text render respects null return', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={null as any}
          valueType="text"
          mode="read"
          render={() => null as any}
        />
      ),
    })

    expect(wrapper.text()).toBe('')
  })

  it('🐴 custom valueTypeMap render props omit ref and emptyText', () => {
    const render = vi.fn((_text, _props, dom) => <span class="custom-render">{dom}</span>)
    const formItemRender = vi.fn((_text, _props, dom) => <span class="custom-edit">{dom}</span>)
    const valueTypeMap = {
      custom: {
        render,
        formItemRender,
      },
    }

    mount({
      render: () => (
        <ProConfigProvider valueTypeMap={valueTypeMap}>
          <ProField
            text="custom read"
            valueType={'custom' as any}
            mode="read"
            emptyText="EMPTY"
          />
          <ProField
            text="custom edit"
            valueType={'custom' as any}
            mode="edit"
            emptyText="EMPTY"
          />
          <PureProField
            text="pure read"
            valueType={'custom' as any}
            mode="read"
            emptyText="EMPTY"
          />
        </ProConfigProvider>
      ),
    })

    expect(render).toHaveBeenCalledTimes(2)
    expect(formItemRender).toHaveBeenCalledTimes(1)
    for (const call of [...render.mock.calls, ...formItemRender.mock.calls]) {
      expect(call[1]).not.toHaveProperty('ref')
      expect(call[1]).not.toHaveProperty('emptyText')
    }
  })

  it('🐴 built-in text render receives fieldProps without text prop', () => {
    const render = vi.fn((_text, props, dom) => <span>{dom}</span>)
    const wrapper = mount({
      render: () => (
        <ProField
          text="qixian"
          mode="read"
          valueType="text"
          fieldProps={{ prefix: 'pre-', suffix: '-post' }}
          render={render}
        />
      ),
    })

    expect(wrapper.text()).toBe('pre-qixian-post')
    expect(render).toHaveBeenCalled()
    expect(render.mock.calls[0]![1]).toEqual({
      mode: 'read',
      prefix: 'pre-',
      suffix: '-post',
      onChange: expect.any(Function),
    })
  })

  it('🐴 avatar only renders image in read mode with string text', () => {
    const readWrapper = mount({
      render: () => <ProField text="https://example.test/avatar.png" valueType="avatar" mode="read" />,
    })
    expect(readWrapper.find('.ant-avatar').exists()).toBe(true)

    const editWrapper = mount({
      render: () => <ProField text="https://example.test/avatar.png" valueType="avatar" mode="edit" />,
    })
    expect(editWrapper.find('.ant-avatar').exists()).toBe(false)
    expect(editWrapper.find('input').exists()).toBe(true)

    const objectWrapper = mount({
      render: () => <ProField text={{ src: 'https://example.test/avatar.png' }} valueType="avatar" mode="read" />,
    })
    expect(objectWrapper.find('.ant-avatar').exists()).toBe(false)
  })

  it('🐴 light wrapper mousedown on clear area does not trigger label', async () => {
    const Probe = defineComponent({
      props: ['lightLabel', 'labelTrigger'],
      setup(props) {
        return () => (
          <div>
            <span
              class="probe-label"
              ref={(el: any) => {
                if (props.lightLabel)
                  props.lightLabel.labelRef.value = el
              }}
            >
              label
            </span>
            <span
              class="probe-clear"
              ref={(el: any) => {
                if (props.lightLabel)
                  props.lightLabel.clearRef.value = el
              }}
            >
              clear
            </span>
            <span class="probe-state">{String(props.labelTrigger)}</span>
          </div>
        )
      },
    })

    const wrapper = mount({
      render: () => (
        <ProFieldLightWrapper isLight>
          <Probe />
        </ProFieldLightWrapper>
      ),
    })

    await wrapper.find('.probe-label').trigger('mousedown')
    await nextTick()
    expect(wrapper.find('.probe-state').text()).toBe('true')

    await wrapper.find('.probe-label').trigger('mouseup')
    await nextTick()
    expect(wrapper.find('.probe-state').text()).toBe('false')

    await wrapper.find('.probe-clear').trigger('mousedown')
    await nextTick()
    expect(wrapper.find('.probe-state').text()).toBe('false')
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

  it('🐴 select request cacheForSwr reuses cached data', async () => {
    const request = vi.fn(async () => [{ label: 'Cached option', value: 'cached' }])
    const proFieldKey = `field-cache-${Date.now()}`
    const Demo = defineComponent({
      setup() {
        const [, options] = useFieldFetchData({
          request,
          proFieldKey,
          cacheForSwr: true,
        } as any)

        return () => <div>{options.value.map(item => item.label).join(',')}</div>
      },
    })

    const first = mount(Demo)
    await flushPromises()
    await nextTick()

    expect(request).toHaveBeenCalledTimes(1)
    expect(first.text()).toContain('Cached option')

    first.unmount()
    const second = mount(Demo)
    await flushPromises()
    await nextTick()

    expect(request).toHaveBeenCalledTimes(1)
    expect(second.text()).toContain('Cached option')
  })

  {
    async function settle() {
      await flushPromises()
      await nextTick()
    }

    describe('field enum request compatibility', () => {
      const CompatProField = ProField as any
      const enumValueTypes = ['select', 'checkbox', 'radio', 'radioButton', 'cascader', 'treeSelect', 'segmented'] as const

      enumValueTypes.forEach((valueType) => {
        it(`🐴 ${valueType} read mode support request function`, async () => {
          const request = vi.fn(async () => [
            { label: '全部', value: 'all' },
            { label: '未解决', value: 'open' },
            { label: '已解决', value: 'closed' },
            { label: '解决中', value: 'processing' },
          ])
          const wrapper = mount(CompatProField, {
            props: {
              text: 'default',
              proFieldKey: `enum-request-${valueType}`,
              valueType,
              mode: 'read',
              request,
            },
          })

          await settle()
          expect(wrapper.text()).toContain('default')
          expect(request).toHaveBeenCalledTimes(1)

          ;(wrapper.vm as any).fetchData?.('test')
          await settle()

          expect(request).toHaveBeenCalledTimes(2)
        })

        it(`🐴 ${valueType} request loading without request`, () => {
          const wrapper = mount({
            render: () => (
              <CompatProField
                text="default"
                valueType={valueType}
                mode="read"
                options={[]}
              />
            ),
          })

          expect(wrapper.text()).toBe('default')
        })

        it(`🐴 ${valueType} edit mode support formItemRender display value`, () => {
          const wrapper = mount({
            render: () => (
              <CompatProField
                text="default"
                valueType={valueType}
                mode="edit"
                formItemRender={() => <input id="select" value="default" />}
              />
            ),
          })

          expect((wrapper.find('#select').element as HTMLInputElement).value).toBe('default')
        })
      })

      it('🐴 render 关闭 when text=0 without explicit valueType', () => {
        const wrapper = mount({
          render: () => (
            <ProField
              text={0}
              mode="read"
              valueEnum={{
                0: { text: '关闭', status: 'Default' },
                1: { text: '运行中', status: 'Processing' },
              }}
            />
          ),
        })

        expect(wrapper.text()).toBe('关闭')
      })

      ;['en-US', 'ru-RU', 'ms-MY', 'sr-RS'].forEach((locale) => {
        it(`🐴 money valueType object locale ${locale}`, () => {
          const editWrapper = mount({
            render: () => (
              <ProField
                text="100"
                valueType={{ type: 'money', locale }}
                mode="edit"
              />
            ),
          })

          expect(editWrapper.find('.ant-input-number').exists()).toBe(true)

          const readWrapper = mount({
            render: () => (
              <ProField
                text="100"
                valueType={{ type: 'money', locale }}
                mode="read"
              />
            ),
          })

          expect(readWrapper.text()).toContain('100')
          expect(readWrapper.find('.ant-input-number').exists()).toBe(false)

          const noSymbolWrapper = mount({
            render: () => (
              <ProField
                text="100"
                valueType={{ type: 'money', locale, moneySymbol: false }}
                mode="read"
              />
            ),
          })

          expect(noSymbolWrapper.text()).toContain('100')
          expect(noSymbolWrapper.text()).not.toContain('¥')
          expect(noSymbolWrapper.find('.ant-input-number').exists()).toBe(false)
        })
      })
    })
  }

  describe('field digitRange', () => {
    async function settle() {
      await flushPromises()
      await nextTick()
    }

    function inputValues(wrapper: ReturnType<typeof mount>) {
      return wrapper
        .findAll<HTMLInputElement>('.ant-input-number-input')
        .map(input => input.element.value)
    }

    it('🐴 valueType digitRange placeholder use', () => {
      const wrapper = mount({
        render: () => <ProField mode="edit" valueType="digitRange" />,
      })

      const inputs = wrapper.findAll('.ant-input-number-input')
      expect(inputs[0]!.attributes('placeholder')).toBe('请输入')
      expect(inputs[1]!.attributes('placeholder')).toBe('请输入')
    })

    it('🐴 valueType digitRange placeholder array use', () => {
      const wrapper = mount({
        render: () => <ProField mode="edit" valueType="digitRange" placeholder={['Min', 'Max']} />,
      })

      const inputs = wrapper.findAll('.ant-input-number-input')
      expect(inputs[0]!.attributes('placeholder')).toBe('Min')
      expect(inputs[1]!.attributes('placeholder')).toBe('Max')
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

    it('🐴 digitRange support placeholder and fieldProps.value blur onChange', async () => {
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

      await wrapper.find('span[style*="inline-flex"]').trigger('blur')
      await inputs[0]!.trigger('blur')
      await settle()

      expect(onChange).toHaveBeenCalledWith([20000, 30000])
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
      await wrapper.find('span[style*="inline-flex"]').trigger('blur')
      await settle()

      expect(inputValues(wrapper)).toEqual(['12.34', '56.78'])
      expect(onChange).toHaveBeenLastCalledWith([12.34, 56.78])
    })
  })

  {
    const CompatProField = ProField as any

    const requestOptions = [
      { label: '全部', value: 'all' },
      { label: '未解决', value: 'open' },
      { label: '已解决', value: 'closed' },
      { label: '解决中', value: 'processing' },
    ]

    const cascaderOptions = [
      {
        value: 'zhejiang',
        label: '浙江',
        key: 'zhejiang',
        children: [
          {
            value: 'hangzhou',
            label: '杭州',
            key: 'hangzhou',
            children: [
              {
                value: 'xihu',
                key: 'xihu',
                label: '西湖',
              },
            ],
          },
        ],
      },
    ]

    const fieldNamesOptions = [
      {
        title: 'Node1',
        value: '0-0',
        children: [
          {
            title: 'Child Node1',
            value: '0-0-0',
          },
        ],
      },
      {
        title: 'Node2',
        value: '0-1',
        children: [
          {
            title: 'Child Node3',
            value: '0-1-0',
          },
          {
            title: 'Child Node4',
            value: '0-1-1',
          },
          {
            title: 'Child Node5',
            value: '0-1-2',
          },
        ],
      },
    ]

    async function settle() {
      await flushPromises()
      await nextTick()
    }

    afterEach(() => {
      document.body.innerHTML = ''
    })

    describe('field request/options compatibility', () => {
      ;(['select', 'cascader', 'treeSelect'] as const).forEach((valueType) => {
        it(`🐴 ${valueType} request loading with request keeps default text in read mode`, () => {
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

          expect(request).toHaveBeenCalledTimes(1)
          expect(wrapper.text()).toBe('default')
        })

        it(`🐴 ${valueType} options fieldNames rerender falls back to raw values`, async () => {
          const Demo = defineComponent({
            data: () => ({
              options: fieldNamesOptions,
            }),
            render() {
              return (
                <ProField
                  text={['0-0', '0-0-0']}
                  fieldProps={{
                    fieldNames: {
                      label: 'title',
                      options: 'children',
                    },
                    options: this.options,
                  }}
                  valueType={valueType}
                  mode="read"
                />
              )
            },
          })

          const wrapper = mount(Demo)
          await settle()

          expect(wrapper.text()).toBe('Node1,Child Node1')
          await wrapper.setData({ options: [] })
          await settle()

          expect(wrapper.text()).toBe('0-0,0-0-0')
        })
      })

      ;(['cascader', 'treeSelect'] as const).forEach((valueType) => {
        it(`🐴 ${valueType} labelInValue light edit toggles onOpenChange`, async () => {
          const onOpenChange = vi.fn()
          const wrapper = mountAttached({
            render: () => (
              <CompatProField
                fieldProps={{
                  labelInValue: true,
                  treeCheckable: true,
                  value: [
                    { label: '浙江', value: 'zhejiang' },
                    { label: '杭州', value: 'hangzhou' },
                    { label: '西湖', value: 'xihu' },
                  ],
                  onOpenChange,
                }}
                light
                valueType={valueType}
                mode="edit"
                options={cascaderOptions}
              />
            ),
          })

          await wrapper.find('.ant-pro-core-field-label').trigger('click')

          await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(true)
          })

          await wrapper.find('.ant-select').trigger('mousedown')

          await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false)
          })
        })
      })

      it('🐴 select labelInValue uses label in read mode', () => {
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

      it('🐴 select labelInValue uses label in light edit mode', async () => {
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
        expect(wrapper.find('.ant-pro-core-field-label').text()).toBe('不解决')
      })

      it('🐴 select light edit does not fall back to text as selected value', async () => {
        const wrapper = mount({
          render: () => (
            <CompatProField
              text="open"
              light
              valueType="select"
              mode="edit"
              fieldProps={{ options: requestOptions }}
            />
          ),
        })

        await settle()
        expect(wrapper.find('.ant-pro-core-field-label').text()).toBe('请选择')
      })

      it('🐴 select mode=null is single select', () => {
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
    })
  }

  {
    async function settle() {
      await flushPromises()
      await nextTick()
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

    describe('field treeSelect', () => {
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

      it('🐴 treeSelect read render receives raw text, parsed dom and respects null return', () => {
        const render = vi.fn((_text: any, _props: any, dom: any) => <span class="parsed-tree-dom">{dom}</span>)
        const wrapper = mount({
          render: () => (
            <ProField
              text="open"
              valueType="treeSelect"
              mode="read"
              valueEnum={{ open: 'Open' }}
              render={render}
            />
          ),
        })

        expect(wrapper.find('.parsed-tree-dom').text()).toBe('Open')
        expect(render.mock.calls[0]![0]).toBe('open')

        const nullWrapper = mount({
          render: () => (
            <ProField
              text="open"
              valueType="treeSelect"
              mode="read"
              valueEnum={{ open: 'Open' }}
              render={() => null as any}
            />
          ),
        })
        expect(nullWrapper.text()).toBe('')
      })

      it('🐴 treeSelect update mode follows React edit-only branch', () => {
        const wrapper = mount({
          render: () => (
            <ProField
              text="open"
              valueType="treeSelect"
              mode="update"
              fieldProps={{
                treeData: [{ label: 'Open', value: 'open' }],
              }}
            />
          ),
        })

        expect(wrapper.find('.ant-select').exists()).toBe(false)
        expect(wrapper.text()).toBe('')
      })
    })
  }

  {
    async function settle() {
      await flushPromises()
      await nextTick()
    }

    afterEach(() => {
      document.body.innerHTML = ''
    })

    describe('field money/percent/light compatibility', () => {
      const CompatProField = ProField as any

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

      it('🐴 money numberPopoverRender onchange values keeps formatted input', async () => {
        const wrapper = mount({
          render: () => <CompatProField text="100" numberPopoverRender valueType="money" mode="edit" />,
        })

        await wrapper.find<HTMLInputElement>('.ant-input-number-input').setValue('1000')
        await wrapper.find<HTMLInputElement>('.ant-input-number-input').trigger('mousedown')
        expect(wrapper.find<HTMLInputElement>('.ant-input-number-input').element.value).toBe('¥ 1,000')

        await wrapper.find<HTMLInputElement>('.ant-input-number-input').setValue('¥ 100')
        expect(wrapper.find<HTMLInputElement>('.ant-input-number-input').element.value).toBe('¥ 100')

        await wrapper.find<HTMLInputElement>('.ant-input-number-input').setValue('111111111')
        expect(wrapper.find<HTMLInputElement>('.ant-input-number-input').element.value).toBe('¥ 111,111,111')
      })

      it('🐴 should trigger one fieldProps function when money change and blur', async () => {
        const fn = vi.fn()
        const wrapper = mount({
          render: () => (
            <CompatProField
              text="100"
              valueType="money"
              mode="edit"
              fieldProps={{ onChange: fn, onBlur: fn }}
            />
          ),
        })

        const input = wrapper.find('.ant-input-number-input')
        await input.setValue('1000')
        expect(fn).toHaveBeenCalled()

        await input.trigger('blur')
        expect(fn).toHaveBeenCalledTimes(2)
      })

      it('🐴 percent=0 supports object valueType', () => {
        const wrapper = mount({
          render: () => (
            <ProField
              text={0}
              valueType={{
                type: 'percent',
                showSymbol: true,
                showColor: true,
              }}
              mode="read"
            />
          ),
        })

        expect(wrapper.text()).toContain('0')
        expect(wrapper.text()).toContain('%')
      })

      it('🐴 percent support unit string edit prefix percent', async () => {
        const wrapper = mount({
          render: () => (
            <CompatProField
              text="100%"
              valueType={{
                type: 'percent',
                showSymbol: true,
              }}
              prefix="%"
              mode="edit"
            />
          ),
        })

        const input = wrapper.find<HTMLInputElement>('.ant-input-number-input')
        await input.setValue('100')
        expect(input.element.value).toBe('% 100')
      })

      it('🐴 percent valueType is Object covers edit and precision read branches', async () => {
        const Demo = {
          data: () => ({ text: '100' as any, mode: 'edit' as any, precision: undefined as number | undefined, showColor: false }),
          render(this: any) {
            return (
              <CompatProField
                text={this.text}
                valueType={{
                  type: 'percent',
                  showSymbol: true,
                  precision: this.precision,
                }}
                showColor={this.showColor}
                mode={this.mode}
              />
            )
          },
        }
        const wrapper = mount(Demo)

        expect(wrapper.find('.ant-input-number').exists()).toBe(true)
        await wrapper.setData({ mode: 'read', showColor: true })
        expect(wrapper.text()).toBe('+ 100.00%')

        await wrapper.setData({ precision: 1, showColor: false })
        expect(wrapper.text()).toBe('+ 100.0%')

        await wrapper.setData({ precision: 0 })
        expect(wrapper.text()).toBe('+ 100%')

        await wrapper.setData({ text: '100.01' })
        expect(wrapper.text()).toBe('+ 100%')

        await wrapper.setData({ text: '100', precision: -1 })
        expect(wrapper.text()).toBe('+ 100%')

        await wrapper.setData({ text: -100, precision: 1, showColor: true })
        expect(wrapper.text()).toBe('- 100.0%')
      })

      it('🐴 percent prefix="???" onchange values includes read and intermediate edit values', async () => {
        const Demo = {
          data: () => ({ mode: 'read' as any }),
          render(this: any) {
            return (
              <CompatProField
                text="100"
                valueType={{ type: 'percent' }}
                prefix="???"
                mode={this.mode}
              />
            )
          },
        }
        const wrapper = mount(Demo)

        expect(wrapper.text()).toBe('???100.00%')

        await wrapper.setData({ mode: 'edit' })
        const input = wrapper.find<HTMLInputElement>('.ant-input-number-input')
        await input.setValue('123')
        expect(input.element.value).toBe('??? 123')

        await input.setValue('123456')
        expect(input.element.value).toBe('??? 123,456')
      })

      it('🐴 percent magic prefix onchange values includes read and intermediate edit values', async () => {
        const magicPrefix = '1234567890 ~!@#$%^&*()_+{}:"?> <?>L:'
        const Demo = {
          data: () => ({ mode: 'read' as any }),
          render(this: any) {
            return (
              <CompatProField
                text="100"
                valueType={{ type: 'percent' }}
                prefix={magicPrefix}
                mode={this.mode}
              />
            )
          },
        }
        const wrapper = mount(Demo)

        expect(wrapper.text()).toBe(`${magicPrefix}100.00%`)

        await wrapper.setData({ mode: 'edit' })
        const input = wrapper.find<HTMLInputElement>('.ant-input-number-input')
        await input.setValue('123')
        expect(input.element.value).toBe(`${magicPrefix} 123`)

        await input.setValue('123456')
        expect(input.element.value).toBe(`${magicPrefix} 123,456`)
      })

      it('🐴 password support open renders mask and toggles icon/text', async () => {
        const wrapper = mount({
          render: () => <ProField text={123456} valueType="password" mode="read" />,
        })

        expect(wrapper.text()).toContain('********')
        await wrapper.find('span.anticon-eye-invisible').trigger('click')

        expect(wrapper.find('span.anticon-eye').exists()).toBe(true)
        expect(wrapper.text()).toContain('123456')
      })

      it('🐴 password support controlled open keeps text and calls onOpenChange', async () => {
        const onOpenChange = vi.fn()
        const wrapper = mount({
          render: () => (
            <ProField
              text={123456}
              onOpenChange={onOpenChange}
              open
              valueType="password"
              mode="read"
            />
          ),
        })

        expect(wrapper.text()).toContain('123456')
        await wrapper.find('span.anticon-eye').trigger('click')

        expect(wrapper.text()).toContain('123456')
        expect(wrapper.find('span.anticon-eye-invisible').exists()).toBe(false)
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })

      it('🐴 options support dom list renders both buttons', () => {
        const wrapper = mount({
          render: () => (
            <ProField
              text={[
                <Button key="add">新建</Button>,
                <Button key="edit">修改</Button>,
              ]}
              valueType="option"
              mode="read"
            />
          ),
        })

        const buttons = wrapper.findAll('button')
        expect(buttons).toHaveLength(2)
        expect(buttons[0]!.text()).toContain('新建')
        expect(buttons[1]!.text()).toContain('修改')
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
    })
  }
})
