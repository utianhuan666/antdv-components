<docs lang="zh-CN">
官网自定义表单项示例，对标 React `antd.tsx`。
</docs>

<docs lang="en-US">
Customized form control from the official antd example, mirroring React `antd.tsx`.
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
    <a-form-item name="price" label="Price">
      <a-space :size="8">
        <a-input-number v-model:value="formState.price.number" style="width: 100px" />
        <a-select v-model:value="formState.price.currency" style="width: 100px">
          <a-select-option value="rmb">
            RMB
          </a-select-option>
          <a-select-option value="dollar">
            Dollar
          </a-select-option>
        </a-select>
      </a-space>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">
        Submit
      </a-button>
    </a-form-item>
  </a-form>
</template>
