<docs lang="zh-CN">
对标 React `demos/form/FieldSet/components-other.tsx` 的字段矩阵，展示常见字段组件类型。
</docs>

<docs lang="en-US">
Mirrors React `demos/form/FieldSet/components-other.tsx`, showcasing common field components.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormCascader,
  ProFormCheckboxGroup,
  ProFormColorPicker,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormDigitRange,
  ProFormGroup,
  ProFormRadioButton,
  ProFormRadioGroup,
  ProFormRate,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTreeSelect,
} from '@antdv/components'
import { App } from 'antdv-next'
import { shallowRef } from 'vue'

const readonly = shallowRef(false)
const { message } = App.useApp()

const initialValues: Record<string, any> = {
  'name': 'demo_user',
  'password': 'demo123',
  'select': 'china',
  'select2': '520000201604258831',
  'useMode': { label: 'Unresolved', value: 'open', key: 'open' },
  'select-multiple': ['green', 'blue'],
  'radio': 'a',
  'radio-vertical': 'b',
  'radio-button': 'b',
  'checkbox-group': ['A', 'B', 'C'],
  'input-number-range': [2, 4],
  'input-number': 3,
  'switch': true,
  'slider': 66,
  'rate': 3.5,
  'segmented': 'open',
  'segmented2': 'open',
  'treeSelect': [{ title: 'Child Node3', value: '0-1-0' }],
  'area': ['zhejiang', 'hangzhou', 'xihu'],
}

function waitTime(time = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

async function requestUsers(params?: Record<string, any>) {
  await waitTime()
  const keyWords = params?.keyWords || ''
  const options = [
    { value: '520000201604258831', label: 'Patricia Lopez' },
    { value: '520000198509222123', label: 'Jose Martinez' },
    { value: '210000200811194757', label: 'Elizabeth Thomas' },
    { value: '530000198808222758', label: 'Scott Anderson' },
    { value: '500000198703236285', label: 'George Jackson' },
  ]
  return keyWords ? options.filter(item => item.label.includes(keyWords) || item.value.includes(keyWords)) : options
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
    name="field-set-components-other-demo"
    :initial-values="initialValues"
    :readonly="readonly"
    @finish="handleFinish"
  >
    <ProFormGroup title="Text Types">
      <ProFormText width="md" name="name" label="Name" />
      <ProFormText.Password width="md" name="password" label="Password" />
    </ProFormGroup>
    <ProFormGroup title="Selection Types" collapsible :style="{ gap: '0 32px' }">
      <ProFormSelect
        name="select"
        label="Select"
        :value-enum="{ china: 'China', usa: 'U.S.A' }"
        placeholder="Please select a country"
        :rules="[{ required: true, message: 'Please select your country!' }]"
      />
      <ProFormSelect
        name="select2"
        label="Select with Search"
        :request="requestUsers"
        placeholder="Please select a user"
        :field-props="{ showSearch: true }"
      />
      <ProFormSelect
        width="md"
        name="useMode"
        label="Contract Agreed Effective Method"
        :request="
          async () => [
            { label: 'All', value: 'all' },
            { label: 'Unresolved', value: 'open' },
            { label: 'Resolved', value: 'closed' },
            { label: 'In Progress', value: 'processing' },
          ]
        "
        :field-props="{ labelInValue: true }"
      />
      <ProFormSelect
        name="select-multiple"
        label="Select[multiple]"
        :value-enum="{ red: 'Red', green: 'Green', blue: 'Blue' }"
        :field-props="{ mode: 'multiple' }"
        placeholder="Please select favorite colors"
        :rules="[{ required: true, message: 'Please select your favorite colors!', type: 'array' }]"
      />
      <ProFormCascader
        name="area"
        label="Address"
        :request="
          async () => [
            {
              value: 'zhejiang',
              label: 'Zhejiang',
              children: [{ value: 'hangzhou', label: 'Hangzhou', children: [{ value: 'xihu', label: 'West Lake' }] }],
            },
            {
              value: 'jiangsu',
              label: 'Jiangsu',
              children: [
                { value: 'nanjing', label: 'Nanjing', children: [{ value: 'zhonghuamen', label: 'Zhong Hua Men' }] },
              ],
            },
          ]
        "
        :field-props="{ changeOnSelect: true }"
      />
      <ProFormTreeSelect
        name="treeSelect"
        label="TreeSelect Request"
        placeholder="Please tree select"
        allow-clear
        width="md"
        :request="
          async () => [
            {
              title: 'Node1',
              value: '0-0',
              children: [{ title: 'Child Node1', value: '0-0-0' }],
            },
            {
              title: 'Node2',
              value: '0-1',
              children: [
                { title: 'Child Node3', value: '0-1-0' },
                { title: 'Child Node4', value: '0-1-1' },
              ],
            },
          ]
        "
        :field-props="{ multiple: true, treeNodeFilterProp: 'title', fieldNames: { label: 'title' } }"
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
      <ProFormRadioGroup
        name="radio-vertical"
        label="Radio.Group"
        :field-props="{
          options: [
            { label: 'item 1', value: 'a' },
            { label: 'item 2', value: 'b' },
            { label: 'item 3', value: 'c' },
          ],
          style: { display: 'flex', flexDirection: 'column' },
        }"
      />
      <ProFormRadioButton
        name="radio-button"
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
        name="checkbox-group"
        label="Checkbox.Group"
        :field-props="{ options: ['A', 'B', 'C', 'D', 'E', 'F'] }"
      />
      <ProFormColorPicker label="Color Picker" name="color" />
    </ProFormGroup>
    <ProFormGroup title="Number Types">
      <ProFormDigitRange label="InputNumberRange" name="input-number-range" placeholder="Min,Max" />
      <ProFormDigit label="InputNumber" name="input-number" width="sm" :field-props="{ min: 1, max: 10 }" />
      <ProFormSwitch name="switch" label="Switch" />
      <ProFormSlider
        name="slider"
        label="Slider"
        width="lg"
        :field-props="{ marks: { 0: 'A', 20: 'B', 40: 'C', 60: 'D', 80: 'E', 100: 'F' } }"
      />
      <ProFormRate name="rate" label="Rate" />
      <ProFormSegmented
        name="segmented"
        label="Segmented Control"
        :value-enum="{ open: 'Unresolved', closed: 'Resolved' }"
      />
      <ProFormSegmented
        name="segmented2"
        label="Segmented Control - Remote Data"
        :request="
          async () => [
            { label: 'All', value: 'all' },
            { label: 'Unresolved', value: 'open' },
            { label: 'Resolved', value: 'closed' },
            { label: 'In Progress', value: 'processing' },
          ]
        "
      />
      <ProFormDatePicker name="date" label="DatePicker" />
      <ProFormDateTimePicker name="dateTime" label="DateTimePicker" />
    </ProFormGroup>
  </ProForm>
</template>
