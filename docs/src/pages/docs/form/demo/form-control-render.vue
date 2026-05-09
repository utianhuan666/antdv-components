<docs lang="zh-CN">
FormControlRender 示例，对标 React `form-control-render.tsx`，展示在 Form.Item 中内联组织自定义控件。
</docs>

<docs lang="en-US">
FormControlRender style example, mirroring React `form-control-render.tsx`.
</docs>

<script setup lang="ts">
import { reactive } from 'vue'

const formState = reactive({ reason: '' })

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <a-form :model="formState" layout="vertical" @finish="handleFinish">
    <a-form-item name="reason" label="Reason">
      <a-space-compact>
        <a-select value="custom" style="width: 120px">
          <a-select-option value="custom">
            Custom
          </a-select-option>
        </a-select>
        <a-input v-model:value="formState.reason" style="width: 260px" placeholder="Please enter reason" />
      </a-space-compact>
    </a-form-item>
    <a-button type="primary" html-type="submit">
      Submit
    </a-button>
  </a-form>
</template>
