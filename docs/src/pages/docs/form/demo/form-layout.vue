<docs lang="zh-CN">
标签与表单项布局，对标 React `form-layout.tsx`。
</docs>

<docs lang="en-US">
Label and form item layout, mirroring React `form-layout.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormRadioGroup, ProFormText } from '@antdv/components'
import { Col, Row, Space } from 'antdv-next'
import { computed, h, shallowRef } from 'vue'

const formLayoutType = shallowRef<'horizontal' | 'vertical' | 'inline'>('horizontal')
const formItemLayout = computed(() =>
  formLayoutType.value === 'horizontal' ? { labelCol: { span: 4 }, wrapperCol: { span: 14 } } : {},
)
const submitter = computed(() => ({
  render: (_props: Record<string, any>, doms: any[]) =>
    formLayoutType.value === 'horizontal'
      ? h(Row, null, () => h(Col, { span: 14, offset: 4 }, () => h(Space, null, () => doms)))
      : doms,
}))

function waitTime(time = 100) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

async function requestInitialValues() {
  await waitTime(100)
  return {
    name: 'Ant Design Co., Ltd.',
    useMode: 'chapter',
  }
}

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <div style="padding: 24px">
    <ProForm
      :layout="formLayoutType"
      :label-col="formItemLayout.labelCol"
      :wrapper-col="formItemLayout.wrapperCol"
      :submitter="submitter"
      :params="{}"
      :request="requestInitialValues"
      @finish="handleFinish"
    >
      <ProFormRadioGroup
        name="layout"
        label="Label Layout"
        :field-props="{
          value: formLayoutType,
          options: ['horizontal', 'vertical', 'inline'],
          optionType: 'button',
          onChange: (event: any) => (formLayoutType = event.target.value),
        }"
      />
      <ProFormText width="md" name="name" label="Contract Customer Name" placeholder="Please enter a name" />
      <ProFormText width="md" name="company" label="Our Company Name" placeholder="Please enter a name" />
      <ProFormText :name="['contract', 'name']" width="md" label="Contract Name" placeholder="Please enter a name" />
    </ProForm>
  </div>
</template>
