<docs lang="zh-CN">
同步提交结果到 url，对标 React `sync-to-url.tsx`。
</docs>

<docs lang="en-US">
Synchronize submitted values to the URL, mirroring React `sync-to-url.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect } from '@antdv/components'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const initialValues = {
  name: 'Ant Design Co., Ltd.',
  useMode: String(route.query.useMode || 'chapter'),
}

function handleFinish(values: Record<string, any>) {
  const query = { ...route.query, useMode: values.useMode, expirationTime: undefined }
  router.replace({ query })
  console.warn('finish', values)
}
</script>

<template>
  <ProForm :initial-values="initialValues" @finish="handleFinish">
    <ProFormSelect
      width="sm"
      name="useMode"
      label="Contract Agreed Effective Method"
      :value-enum="{ chapter: 'Effective after stamping' }"
    />
    <ProFormDateRangePicker width="md" name="createTimeRanger" label="Contract Effective Time" />
    <ProFormDatePicker width="md" name="expirationTime" label="Contract Expiration Time" />
  </ProForm>
</template>
