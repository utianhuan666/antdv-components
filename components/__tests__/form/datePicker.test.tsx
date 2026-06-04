import { describe, expect, it } from 'vitest'
import ProFormDatePicker, { ProFormDateTimePicker, ProFormTimePicker } from '../../form/components/DatePicker'
import ProFormDateRangePicker, {
  ProFormDateMonthRangePicker,
  ProFormDateQuarterRangePicker,
  ProFormDateTimeRangePicker,
  ProFormDateWeekRangePicker,
  ProFormDateYearRangePicker,
  ProFormTimeRangePicker,
} from '../../form/components/DateRangePicker'
import ProForm from '../../form/layouts/ProForm'
import { mountAttached } from '../testUtils'

function renderDomProps(dom: any) {
  return (
    <span class="date-render-props">
      {String(dom?.props?.picker ?? '')}
      |
      {String(dom?.props?.showTime ?? '')}
      |
      {dom?.props?.format}
    </span>
  )
}

describe('proForm date picker components', () => {
  it('datePicker exposes Week/Month/Quarter/Year sub components', () => {
    expect((ProFormDatePicker as any).Week.name).toBe('ProFormDatePickerWeek')
    expect((ProFormDatePicker as any).Month.name).toBe('ProFormDatePickerMonth')
    expect((ProFormDatePicker as any).Quarter.name).toBe('ProFormDatePickerQuarter')
    expect((ProFormDatePicker as any).Year.name).toBe('ProFormDatePickerYear')
  })

  it('datePicker sub components render expected picker props', () => {
    const WeekPicker = (ProFormDatePicker as any).Week
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <WeekPicker name="week" />
        </ProForm>
      ),
    })

    const wrapperWithRender = mountAttached({
      render: () => (
        <ProForm>
          <WeekPicker name="weekRender" formItemRender={(_: any, __: any, dom: any) => renderDomProps(dom)} />
        </ProForm>
      ),
    })

    expect(wrapper.find('.ant-picker').exists()).toBe(true)
    expect(wrapperWithRender.find('.date-render-props').text()).toBe('week||gggg-wo')
  })

  it('dateTimePicker enables showTime by default', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormDateTimePicker name="time" />
        </ProForm>
      ),
    })

    const wrapperWithRender = mountAttached({
      render: () => (
        <ProForm>
          <ProFormDateTimePicker name="timeRender" formItemRender={(_: any, __: any, dom: any) => renderDomProps(dom)} />
        </ProForm>
      ),
    })

    expect(wrapper.find('.ant-picker').exists()).toBe(true)
    expect(wrapperWithRender.find('.date-render-props').text()).toBe('|true|YYYY-MM-DD HH:mm:ss')
  })

  it('dateRangePicker exports date and time range variants', () => {
    expect(ProFormDateRangePicker.name).toBe('ProFormDateRangePicker')
    expect(ProFormDateTimeRangePicker.name).toBe('ProFormDateTimeRangePicker')
    expect(ProFormDateWeekRangePicker.name).toBe('ProFormDateWeekRangePicker')
    expect(ProFormDateMonthRangePicker.name).toBe('ProFormDateMonthRangePicker')
    expect(ProFormDateQuarterRangePicker.name).toBe('ProFormDateQuarterRangePicker')
    expect(ProFormDateYearRangePicker.name).toBe('ProFormDateYearRangePicker')
    expect(ProFormTimeRangePicker.name).toBe('ProFormTimeRangePicker')
  })

  it('dateMonthRangePicker renders expected range picker props', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormDateMonthRangePicker name="monthRange" />
        </ProForm>
      ),
    })

    const wrapperWithRender = mountAttached({
      render: () => (
        <ProForm>
          <ProFormDateMonthRangePicker name="monthRangeRender" formItemRender={(_: any, __: any, dom: any) => renderDomProps(dom)} />
        </ProForm>
      ),
    })

    expect(wrapper.find('.ant-picker').exists()).toBe(true)
    expect(wrapperWithRender.find('.date-render-props').text()).toBe('month|true|YYYY-MM')
  })

  it('timePicker exposes RangePicker sub component', () => {
    expect((ProFormTimePicker as any).RangePicker.name).toBe('ProFormTimeRangePicker')
  })
})
