<docs lang="zh-CN">
ModalForm debug 示例，对标 React `modalform-test.tsx`。
</docs>

<docs lang="en-US">
ModalForm debug example, mirroring React `modalform-test.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormText } from '@antdv/components'
import { shallowRef } from 'vue'

const open = shallowRef(false)
</script>

<template>
  <a-button type="primary" @click="open = true">
    Open Modal Form
  </a-button>
  <a-modal v-model:open="open" title="Modal Form" :footer="null">
    <ProForm @finish="() => open = false">
      <ProFormText name="name" label="Name" />
    </ProForm>
  </a-modal>
</template>
