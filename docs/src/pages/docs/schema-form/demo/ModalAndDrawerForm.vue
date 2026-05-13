<script setup lang="ts">
import type { ProFormLayoutType } from '@antdv/components'
import { BetaSchemaForm, ProFormSelect } from '@antdv/components'
import { Alert, Button, Space } from 'antdv-next'
import { h, shallowRef } from 'vue'

const layoutType = shallowRef<ProFormLayoutType>('ModalForm')

async function handleFinish() {}
</script>

<template>
  <div style="padding: 24px">
    <Space
      :style="{
        width: '100%',
      }"
      direction="vertical"
    >
      <Alert
        type="warning"
        message="QueryFilter 和 lightFilter 暂不支持grid模式"
        :style="{
          marginBlockEnd: '24px',
        }"
      />
      <ProFormSelect
        label="布局方式"
        :options="['ModalForm', 'DrawerForm']"
        :field-props="{
          value: layoutType,
          onChange: (value: any) => (layoutType = value),
        }"
      />
    </Space>
    <BetaSchemaForm
      name="schema-form-modal-and-drawer-form-demo"
      :trigger="h(Button, null, () => '点击我')"
      :layout-type="layoutType as 'ModalForm'"
      :modal-props="layoutType === 'ModalForm' ? { destroyOnHidden: true } : undefined"
      :drawer-props="layoutType === 'DrawerForm' ? { destroyOnHidden: true } : undefined"
      :columns="[
        {
          title: '标题',
          dataIndex: 'title',
          formItemProps: {
            rules: [
              {
                required: true,
                message: '此项为必填项',
              },
            ],
          },
          width: 'md',
        },
      ]"
      @finish="handleFinish"
    />
  </div>
</template>
