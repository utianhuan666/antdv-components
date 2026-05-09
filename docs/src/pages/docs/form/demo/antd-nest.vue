<docs lang="zh-CN">
嵌套 Form.Item 实现自定义表单项，对标 React `antd.nest.tsx`。
</docs>

<docs lang="en-US">
Nested Form.Item customized control, mirroring React `antd.nest.tsx`.
</docs>

<script setup lang="ts">
import { reactive } from 'vue'

const formState = reactive({
  price: {
    number: 0,
    currency: 'rmb',
  },
})

function handleFinish(values: Record<string, any>) {
  console.warn('Received values from form:', values)
}
</script>

<template>
  <a-form layout="inline" :model="formState" @finish="handleFinish">
    <a-form-item label="Price">
      <a-space :size="8">
        <a-form-item name="number" no-style>
          <a-input-number v-model:value="formState.price.number" style="width: 100px" />
        </a-form-item>
        <a-form-item name="currency" no-style>
          <a-select v-model:value="formState.price.currency" style="width: 100px">
            <a-select-option value="rmb">
              RMB
            </a-select-option>
            <a-select-option value="dollar">
              Dollar
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-space>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">
        Submit
      </a-button>
    </a-form-item>
  </a-form>
</template>
