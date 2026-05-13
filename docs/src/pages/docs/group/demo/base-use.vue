<docs lang="zh-CN">
联动的 FormList。
</docs>

<docs lang="en-US">
Linked FormList.
</docs>

<script setup lang="ts">
import { ProForm, ProFormDependency, ProFormList, ProFormText } from '@antdv/components'

function handleSetCurrentRowData(action: any, index: number) {
  action.setCurrentRowData({
    name: `New Name${index}`,
    remark: `New Remark${index}`,
  })
}

function handleClearCurrentRowData(action: any) {
  action.setCurrentRowData({
    name: undefined,
    remark: undefined,
  })
}
</script>

<template>
  <div style="padding: 24px">
    <ProForm name="group-base-use-demo">
      <ProFormList
        :name="['default', 'users']"
        label="用户信息"
        :initial-value="[
          {
            name: '1111',
          },
        ]"
        always-show-item-label
      >
        <template #default="{ index, action }">
          <ProFormText :initial-value="index" name="rowKey" :label="`第 ${index} 配置`" />
          <ProFormText key="name" name="name" label="姓名" />
          <ProFormDependency key="remark" :name="['name']">
            <template #default="{ name }">
              <span
                v-if="!name"
                :style="{
                  lineHeight: '92px',
                }"
              >
                输入姓名展示
              </span>
              <ProFormText v-else name="remark" label="昵称详情" />
            </template>
          </ProFormDependency>
          <div
            :style="{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              height: '60px',
            }"
          >
            <a-button key="SET" type="primary" @click="handleSetCurrentRowData(action, index)">
              设置此项
            </a-button>

            <a-button key="clear" type="dashed" @click="handleClearCurrentRowData(action)">
              清空此项
            </a-button>
          </div>
        </template>
      </ProFormList>
    </ProForm>
  </div>
</template>
