<docs lang="zh-CN">
对标 React `demos/form/FieldSet/components-other-readonly.tsx`，展示常见字段的只读态。
</docs>

<docs lang="en-US">
Mirrors React `demos/form/FieldSet/components-other-readonly.tsx`, showcasing readonly mode for common fields.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormCheckboxGroup,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormRadioButton,
  ProFormRadioGroup,
  ProFormRate,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTimePicker,
} from '@antdv/components'
import { App } from 'antdv-next'
import dayjs from 'dayjs'

const { message } = App.useApp()
const fixedDate = dayjs('2024-01-15 08:30:00')

const initialValues = {
  name: '示例科技有限公司',
  select: 'china',
  selectMultiple: ['red', 'green'],
  useMode: 'all',
  switch: true,
  digit: 3,
  checkboxGroup: ['A', 'B'],
  slider: 66,
  rate: 3.5,
  radio: 'a',
  radioButton: 'a',
  date: fixedDate,
  dateTime: fixedDate,
  time: '00:01:05',
  dateRange: [fixedDate, fixedDate.subtract(1, 'day')],
  dateTimeRange: [fixedDate, fixedDate.subtract(1, 'day')],
}

async function handleFinish() {
  message.success('Submitted')
  return true
}
</script>

<template>
  <ProForm
    readonly
    name="field-set-components-other-readonly-demo"
    :initial-values="initialValues"
    @finish="handleFinish"
  >
    <ProFormGroup title="基础数据">
      <ProFormText
        width="md"
        name="name"
        label="name"
        :field-props="{ prefix: 'prefix', suffix: 'suffix' }"
      />
      <ProFormSelect
        name="select"
        label="Select"
        :value-enum="{ china: 'China', usa: 'U.S.A' }"
        placeholder="Please select a country"
      />
      <ProFormSelect
        width="md"
        name="useMode"
        label="合同约定生效方式"
        :request="async () => [
          { label: '全部', value: 'all' },
          { label: '未解决', value: 'open' },
          { label: '已解决', value: 'closed' },
          { label: '解决中', value: 'processing' },
        ]"
      />
      <ProFormSelect
        name="selectMultiple"
        label="Select[multiple]"
        :value-enum="{ red: 'Red', green: 'Green', blue: 'Blue' }"
        :field-props="{ mode: 'multiple' }"
      />
      <ProFormDigit label="InputNumber" name="digit" :field-props="{ min: 1, max: 10 }" />
      <ProFormSwitch name="switch" label="Switch" />
      <ProFormSlider
        name="slider"
        label="Slider"
        :field-props="{ marks: { 0: 'A', 20: 'B', 40: 'C', 60: 'D', 80: 'E', 100: 'F' } }"
      />
      <ProFormRadioGroup
        name="radio"
        label="Radio.Group"
        :field-props="{
          options: [
            { label: 'item 1', value: 'a' },
            { label: 'item 2', value: 'b' },
            { label: 'item 3', value: 'c' },
          ],
        }"
      />
      <ProFormRadioButton
        name="radioButton"
        label="Radio.Button"
        :field-props="{
          options: [
            { label: 'item 1', value: 'a' },
            { label: 'item 2', value: 'b' },
            { label: 'item 3', value: 'c' },
          ],
        }"
      />
      <ProFormCheckboxGroup
        name="checkboxGroup"
        label="Checkbox.Group"
        :field-props="{ options: ['A', 'B', 'C', 'D', 'E', 'F'] }"
      />
      <ProFormRate name="rate" label="Rate" />
    </ProFormGroup>
    <ProFormGroup title="日期相关分组">
      <ProFormDatePicker name="date" label="日期" />
      <ProFormTimePicker name="time" label="时间" />
      <ProFormDateTimePicker name="dateTime" label="日期时间" />
      <ProFormDateRangePicker name="dateRange" label="日期区间" />
      <ProFormDateTimeRangePicker name="dateTimeRange" label="日期时间区间" />
    </ProFormGroup>
  </ProForm>
</template>
