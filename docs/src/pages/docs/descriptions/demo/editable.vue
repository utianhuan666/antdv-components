<script setup lang="ts">
import { reactive, ref } from 'vue'

const editableKeys = ref<(string | number)[]>([])
const dataSource = reactive({
  title: 'ProDescriptions',
  state: 'processing',
})

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    formItemProps: {
      rules: [{ required: true, message: '请输入标题' }],
    },
  },
  {
    title: '状态',
    dataIndex: 'state',
    valueType: 'select',
    valueEnum: {
      processing: { text: '处理中', status: 'Processing' },
      done: { text: '完成', status: 'Success' },
    },
  },
]

function handleEditableChange(keys: (string | number)[]) {
  editableKeys.value = keys
}
</script>

<template>
  <ProDescriptions
    title="可编辑详情"
    :data-source="dataSource"
    :columns="columns"
    :editable="{
      editableKeys,
      onChange: handleEditableChange,
    }"
  />
</template>
