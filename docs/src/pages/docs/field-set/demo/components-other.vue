<docs lang="zh-CN">
对标 React `demos/form/FieldSet/components-other.tsx` 的字段矩阵，展示常见字段组件类型。
</docs>

<docs lang="en-US">
Mirrors React `demos/form/FieldSet/components-other.tsx`, showcasing common field components.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormCheckboxGroup,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormMoney,
  ProFormRadioGroup,
  ProFormRate,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@antdv/components'

const initialValues = {
  name: 'Bruce',
  country: 'china',
  gender: 'male',
  hobbies: ['sport', 'music'],
  active: true,
  age: 28,
  salary: 18888,
  score: 4,
}

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <ProForm
    :initial-values="initialValues"
    :submitter="{ searchConfig: { submitText: '提交' } }"
    @finish="handleFinish"
  >
    <ProFormGroup title="Text Types">
      <ProFormText name="name" label="Name" />
      <ProFormText.Password name="password" label="Password" />
      <ProFormTextArea name="bio" label="Bio" />
    </ProFormGroup>
    <ProFormGroup title="Selection Types">
      <ProFormSelect
        name="country"
        label="Select"
        :value-enum="{ china: 'China', usa: 'U.S.A' }"
      />
      <ProFormRadioGroup
        name="gender"
        label="Radio.Group"
        :field-props="{
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        }"
      />
      <ProFormCheckboxGroup
        name="hobbies"
        label="Checkbox.Group"
        :field-props="{
          options: [
            { label: 'Sport', value: 'sport' },
            { label: 'Read', value: 'read' },
            { label: 'Music', value: 'music' },
          ],
        }"
      />
      <ProFormSwitch name="active" label="Switch" />
    </ProFormGroup>
    <ProFormGroup title="Number and Date Types">
      <ProFormDigit name="age" label="Digit" />
      <ProFormMoney name="salary" label="Money" />
      <ProFormRate name="score" label="Rate" />
      <ProFormDatePicker name="joinedAt" label="DatePicker" />
      <ProFormDateTimePicker name="lastLogin" label="DateTimePicker" />
    </ProFormGroup>
  </ProForm>
</template>
