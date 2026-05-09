<docs lang="zh-CN">
栅格化布局，对标 React `form-layout-grid.tsx`。
</docs>

<docs lang="en-US">
Grid layout, mirroring React `form-layout-grid.tsx`.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDigit,
  ProFormRadioGroup,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@antdv/components'
import { shallowRef } from 'vue'

const formLayoutType = shallowRef<'horizontal' | 'vertical' | 'inline'>('horizontal')
const grid = shallowRef(true)

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <div style="padding: 24px">
    <ProForm
      :layout="formLayoutType"
      :grid="grid"
      :row-props="{ gutter: [16, formLayoutType === 'inline' ? 16 : 0] }"
      :initial-values="{ name: 'Ant Design Co., Ltd.', useMode: 'chapter', grid: true }"
      @finish="handleFinish"
    >
      <ProFormRadioGroup
        name="layout"
        label="Label Layout"
        :col-props="{ span: 20 }"
        :field-props="{
          value: formLayoutType,
          options: ['horizontal', 'vertical', 'inline'],
          optionType: 'button',
          onChange: (event: any) => formLayoutType = event.target.value,
        }"
      />
      <ProFormSwitch
        name="grid"
        label="Grid Switch"
        :col-props="{ span: 4 }"
        :field-props="{ checked: grid, onChange: (checked: boolean) => grid = checked }"
      />
      <ProFormText name="name" label="Title" placeholder="Please enter a name" />
      <ProFormText :col-props="{ md: 12, xl: 8 }" name="company" label="Name" />
      <ProFormDigit :col-props="{ md: 12, xl: 8 }" name="phone" label="Phone" />
      <ProFormText :col-props="{ md: 12, xl: 8 }" name="email" label="Email" />
      <ProFormTextArea :col-props="{ span: 24 }" name="address" label="Detailed Work Address or Home Address" />
      <ProFormDatePicker :col-props="{ xl: 8, md: 12 }" label="Entry Date" name="date" />
      <ProFormDateRangePicker :col-props="{ xl: 8, md: 12 }" label="Work Period" name="dateRange" />
      <ProFormSelect :col-props="{ xl: 8, md: 12 }" label="Position" name="level" :value-enum="{ 1: 'Front End', 2: 'Back End', 3: 'Full Stack' }" />
    </ProForm>
  </div>
</template>
