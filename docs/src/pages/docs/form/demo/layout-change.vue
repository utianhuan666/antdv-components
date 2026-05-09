<docs lang="zh-CN">
对标 React `layout-change.tsx`，展示不同 ProForm layout 形态的切换入口。
</docs>

<docs lang="en-US">
Mirrors React `layout-change.tsx`, showing layout switching entry points.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormGroup,
  ProFormRadioGroup,
  ProFormSelect,
  ProFormText,
} from '@antdv/components'
import { computed, shallowRef } from 'vue'

const layoutType = shallowRef('ProForm')
const layoutOptions = ['LightFilter', 'ProForm', 'ModalForm', 'DrawerForm', 'QueryFilter', 'StepsForm', 'LoginForm']
const isStandardForm = computed(() => layoutType.value === 'ProForm')

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <ProFormRadioGroup
      name="layoutType"
      label="Layout Type"
      :field-props="{
        value: layoutType,
        options: layoutOptions,
        optionType: 'button',
        onChange: (event: any) => (layoutType = event.target.value),
      }"
      :ignore-form-item="true"
    />
    <a-alert
      v-if="!isStandardForm"
      type="info"
      show-icon
      :message="`${layoutType} 会在对应页面完成组件实现后补齐交互示例。`"
    />
    <ProForm
      :layout="layoutType === 'QueryFilter' ? 'inline' : 'vertical'"
      :initial-values="{ name: 'Ant Design Co., Ltd.', useMode: 'chapter' }"
      @finish="handleFinish"
    >
      <ProFormGroup>
        <ProFormText name="name" width="md" label="Contract Customer Name" placeholder="Please enter a name" />
        <ProFormText name="company" width="md" label="Our Company Name" placeholder="Please enter a name" />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormText :name="['contract', 'name']" width="md" label="Contract Name" placeholder="Please enter a name" />
        <ProFormDateRangePicker :name="['contract', 'createTime']" width="md" label="Contract Effective Time" />
      </ProFormGroup>
      <ProFormSelect
        name="useMode"
        width="md"
        label="Contract Agreed Effective Method"
        :value-enum="{ chapter: 'Effective after stamping' }"
      />
    </ProForm>
  </a-space>
</template>
