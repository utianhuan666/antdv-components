<docs lang="zh-CN">
复杂组件的测试
</docs>

<docs lang="en-US">
Testing complex components
</docs>

<script setup lang="ts">
import type { FormInstance } from 'antdv-next'

const formData = reactive({
  name: '',
  age: 0,
})
const formRef = shallowRef<FormInstance>()
</script>

<template>
  <div>
    <my-form ref="formRef">
      <my-form-item name="name" label="Name" required>
        <a-input v-model:value="formData.name" placeholder="请输入" />
      </my-form-item>
      <my-form-item name="age" label="Age" required>
        <template #tooltip>
          请输入年龄，必须为数字
        </template>
        <a-input-number v-model:value="formData.age" placeholder="请输入" />
      </my-form-item>
    </my-form>
  </div>
</template>
