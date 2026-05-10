<docs lang="zh-CN">
日期时间字段矩阵最小复现排查。
</docs>

<docs lang="en-US">
Minimal reproduction for date and time fields.
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
  <ProForm name="field-set-datatime-demo" :initial-values="initialValues" @finish="handleFinish">
    <ProFormGroup title="Date Related Group">
      <ProFormDatePicker name="date" label="Date" />
      <ProFormDatePicker name="dateMonth" label="Year-Month" :field-props="{ picker: 'month', format: 'YY-MM' }" />
      <ProFormDatePicker name="dateWeek" label="Week" :field-props="{ picker: 'week' }" />
      <ProFormDatePicker name="dateMonth" label="Month" :field-props="{ picker: 'month' }" />
      <ProFormDatePicker name="dateQuarter" label="Quarter" :field-props="{ picker: 'quarter' }" />
      <ProFormDatePicker name="dateYear" label="Year" :field-props="{ picker: 'year' }" />
      <ProFormDateTimePicker name="dateTime" label="Date Time" />
      <ProFormTimePicker name="time" label="Time" />
      <ProFormDateRangePicker name="dateRange" label="Date Range" />
      <ProFormDateTimeRangePicker name="dateTimeRange" label="Date Time Range" />
    </ProFormGroup>
  </ProForm>
</template>
