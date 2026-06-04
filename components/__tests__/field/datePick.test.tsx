import { ProField } from '@antdv/components'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'

describe('dateField', () => {
  const datePickList = [
    'date',
    'dateWeek',
    'dateMonth',
    'dateQuarter',
    'dateYear',
    'dateTime',
    'time',
  ]

  datePickList.forEach((valueType) => {
    it(`📅 ${valueType} base use`, async () => {
      const openChangeFn = vi.fn()
      const wrapper = mount({
        render: () => (
          <ProField
            mode="edit"
            fieldProps={{
              placeholder: 'time',
              value: dayjs('2024-06-04 12:30:45'),
              onOpenChange: openChangeFn,
            }}
            text="100"
            label={valueType}
            light
            valueType={valueType as 'date'}
          />
        ),
      })

      await wrapper.find('.ant-pro-core-field-label').trigger('click')

      expect(openChangeFn).toHaveBeenCalledWith(true)
    })
  })

  const dateRangePickList = [
    'dateRange',
    'dateWeekRange',
    'dateMonthRange',
    'dateQuarterRange',
    'dateYearRange',
    'dateTimeRange',
    'timeRange',
  ]

  dateRangePickList.forEach((valueType) => {
    it(`📅 ${valueType} base use`, async () => {
      const openChangeFn = vi.fn()
      const wrapper = mount({
        render: () => (
          <ProField
            mode="edit"
            fieldProps={{
              placeholder: ['start', 'end'],
              value: [
                dayjs('2024-06-04 12:30:45'),
                dayjs('2024-06-05 12:30:45'),
              ],
              onOpenChange: openChangeFn,
            }}
            text="100"
            label={valueType}
            light
            valueType={valueType as 'dateRange'}
          />
        ),
      })

      await wrapper.find('.ant-pro-core-field-label').trigger('click')

      expect(openChangeFn).toHaveBeenCalledWith(true)
    })
  })

  it('📅  RangePicker support format is function', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          mode="read"
          fieldProps={{
            format: (value: dayjs.Dayjs) => value.format('YYYY-MM-DD HH:mm:ss'),
          }}
          text={[
            dayjs('2024-06-04 12:30:45'),
            dayjs('2024-06-05 12:30:45'),
          ]}
          light
          valueType="dateRange"
        />
      ),
    })

    expect(wrapper.text()).toContain('2024-06-04 12:30:45')
    expect(wrapper.text()).toContain('2024-06-05 12:30:45')
  })

  it('📅  DatePicker support format is Array', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          mode="read"
          fieldProps={{
            format: ['YYYY-MM-DD', 'YYYYMMDD'],
          }}
          text={dayjs('2024-06-04 12:30:45')}
          light
          valueType="date"
        />
      ),
    })

    expect(wrapper.text()).toContain('2024-06-04')
  })
})
