<docs lang="zh-CN">
对标 React `demos/form/FieldSet/form-fieldset.tsx`，展示 `ProFormFieldSet` 将多个字段组合成数组值。
</docs>

<docs lang="en-US">
Mirrors React `demos/form/FieldSet/form-fieldset.tsx`, showing how `ProFormFieldSet` combines multiple fields into an array value.
</docs>

<script setup lang="ts">
import { ProForm, ProFormFieldSet, ProFormItem, ProFormSelect, ProFormText } from '@antdv/components'
import { App } from 'antdv-next'
import { computed, reactive, shallowRef } from 'vue'

const readonly = shallowRef(false)
const formModel = reactive({ list: ['1', '2', '3'] })
const { message } = App.useApp()

const dependencyText = computed(() => JSON.stringify(formModel.list, null, 2))

async function requestUseMode() {
  return [
    { label: '全部', value: 'all' },
    { label: '未解决', value: 'open' },
    { label: '已解决', value: 'closed' },
    { label: '解决中', value: 'processing' },
  ]
}

async function handleFinish() {
  message.success('Submitted')
  return true
}
</script>

<template>
  <a-switch
    v-model:checked="readonly"
    checked-children="编辑"
    un-checked-children="只读"
    style="margin-block-end: 16px"
  />
  <ProForm
    name="field-set-form-fieldset-demo"
    :model="formModel"
    :readonly="readonly"
    @finish="handleFinish"
  >
    <ProFormItem label="互相依赖的表单">
      <pre style="margin: 0">{{ dependencyText }}</pre>
    </ProFormItem>

    <ProFormFieldSet name="list" label="组件列表">
      <ProFormText width="md" />
      <ProFormSelect
        width="md"
        :request="requestUseMode"
        name="useMode"
        label="合同约定生效方式"
      />
      <ProFormText width="md" />
    </ProFormFieldSet>

    <ProFormFieldSet
      name="list"
      label="组件列表- Input.Group"
      type="group"
      :rules="[
        {
          validator: async (_rule: unknown, value: string[] = []) => {
            const [name, name1, name2] = value || []
            if (!name) throw new Error('第一个值不能为空')
            if (!name1) throw new Error('第二个值不能为空')
            if (!name2) throw new Error('第三个值不能为空')
          },
        },
      ]"
      :transform="(value: string[]) => ({ list: value, startTime: value?.[0], endTime: value?.[1] })"
    >
      <ProFormText width="md" />
      <ProFormText width="md" />
      <ProFormText width="md" />
    </ProFormFieldSet>

    <ProFormFieldSet
      name="list"
      label="组件列表"
      :transform="(value: string[]) => ({ list: value, startTime: value?.[0], endTime: value?.[1] })"
    >
      <ProFormText width="md" readonly />
      <span>-</span>
      <ProFormText width="md" readonly />
      <span>-</span>
      <ProFormText width="md" readonly />
    </ProFormFieldSet>
  </ProForm>
</template>
