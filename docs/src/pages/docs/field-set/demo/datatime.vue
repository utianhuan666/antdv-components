<docs lang="zh-CN">
对标 React `demos/form/FieldSet/datatime.tsx` 的日期时间字段矩阵。
</docs>

<docs lang="en-US">
Mirrors React `demos/form/FieldSet/datatime.tsx`, showcasing date and time fields.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormGroup,
  ProFormTimePicker,
} from '@antdv/components'
import { App } from 'antdv-next'
import dayjs from 'dayjs'
import { shallowRef } from 'vue'

const readonly = shallowRef(false)
const { message } = App.useApp()
const fixedDate = dayjs('2024-01-15 08:30:00')

const initialValues = {
  date: fixedDate,
  dateMonth: fixedDate,
  dateWeek: fixedDate,
  dateQuarter: fixedDate,
  dateYear: fixedDate,
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
  <a-switch
    v-model:checked="readonly"
    checked-children="Edit"
    un-checked-children="Read Only"
    style="margin-block-end: 16px"
  />
  <ProForm
    name="field-set-datatime-demo"
    :readonly="readonly"
    :initial-values="initialValues"
    @finish="handleFinish"
  >
    <ProFormGroup title="Date Related Group">
      <ProFormDatePicker name="date" label="Date" />
      <ProFormDatePicker
        name="dateMonth"
        label="Year-Month"
        :field-props="{ picker: 'month', format: 'YY-MM' }"
      />
      <ProFormTimePicker name="time" label="Time" />
      <ProFormDatePicker
        name="dateWeek"
        label="Week"
        :field-props="{ picker: 'week' }"
      />
      <ProFormDatePicker
        name="dateMonth"
        label="Month"
        :field-props="{ picker: 'month' }"
      />
      <ProFormDatePicker
        name="dateQuarter"
        label="Quarter"
        :field-props="{ picker: 'quarter' }"
      />
      <ProFormDatePicker
        name="dateYear"
        label="Year"
        :field-props="{ picker: 'year' }"
      />
      <ProFormDateTimePicker name="dateTime" label="Date Time" />
      <ProFormDateRangePicker name="dateRange" label="Date Range" />
      <ProFormDateTimeRangePicker name="dateTimeRange" label="Date Time Range" />
    </ProFormGroup>
  </ProForm>
</template>
