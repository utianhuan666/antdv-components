import { ProField } from '@antdv/components'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'

describe('dateField', () => {
  async function closePicker(wrapper: ReturnType<typeof mount>, index = 0) {
    await wrapper.findAll('input')[index]?.trigger('blur')
  }

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
      const onChange = vi.fn()
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
            onChange={onChange}
            text="100"
            label={valueType}
            light
            valueType={valueType as 'date'}
          />
        ),
      })

      await wrapper.find('.ant-pro-core-field-label').trigger('click')

      expect(openChangeFn).toHaveBeenCalledWith(true)

      await closePicker(wrapper)
      expect(openChangeFn).toHaveBeenCalledWith(false)

      const clear = wrapper.find('.ant-picker-clear')
      expect(clear.exists()).toBe(true)
      await clear.trigger('click')
      expect(onChange).toHaveBeenCalled()
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
      const onChange = vi.fn()
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
            onChange={onChange}
            text="100"
            label={valueType}
            light
            valueType={valueType as 'dateRange'}
          />
        ),
      })

      await wrapper.find('.ant-pro-core-field-label').trigger('click')

      expect(openChangeFn).toHaveBeenCalledWith(true)

      await wrapper.findAll('input')[1]?.trigger('click')
      await closePicker(wrapper)
      expect(openChangeFn).toHaveBeenCalledWith(false)

      const clear = wrapper.find('.ant-picker-clear')
      expect(clear.exists()).toBe(true)
      await clear.trigger('click')
      expect(onChange).toHaveBeenCalled()
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

    expect(wrapper.text()).toBe('2024-06-04 12:30:45 ~ 2024-06-05 12:30:45')
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

    expect(wrapper.html()).toBe('<div>2024-06-04</div>')
  })
})
