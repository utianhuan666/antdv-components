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
    <ProFormGroup title="文本类">
      <ProFormText name="name" label="姓名" />
      <ProFormText.Password name="password" label="密码" />
      <ProFormTextArea name="bio" label="简介" />
    </ProFormGroup>
    <ProFormGroup title="选择类">
      <ProFormSelect
        name="country"
        label="国家"
        :value-enum="{ china: '中国', usa: '美国' }"
      />
      <ProFormRadioGroup
        name="gender"
        label="性别"
        :field-props="{
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
          ],
        }"
      />
      <ProFormCheckboxGroup
        name="hobbies"
        label="爱好"
        :field-props="{
          options: [
            { label: '运动', value: 'sport' },
            { label: '阅读', value: 'read' },
            { label: '音乐', value: 'music' },
          ],
        }"
      />
      <ProFormSwitch name="active" label="是否激活" />
    </ProFormGroup>
    <ProFormGroup title="数字与日期">
      <ProFormDigit name="age" label="年龄" />
      <ProFormMoney name="salary" label="薪资" />
      <ProFormRate name="score" label="评分" />
      <ProFormDatePicker name="joinedAt" label="入职日期" />
      <ProFormDateTimePicker name="lastLogin" label="最近登录" />
    </ProFormGroup>
  </ProForm>
</template>
