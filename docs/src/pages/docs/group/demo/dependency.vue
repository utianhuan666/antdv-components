<docs lang="zh-CN">
复杂联动。
</docs>

<docs lang="en-US">
Complex dependency.
</docs>

<script setup lang="ts">
import { ProForm, ProFormDependency, ProFormList, ProFormSelect, ProFormText } from '@antdv/components'
</script>

<template>
  <div style="padding: 24px">
    <ProForm name="group-dependency-demo">
      <ProFormList
        :name="['default', 'users']"
        label="用户信息"
        :initial-value="[
          {
            name: '我是姓名',
          },
        ]"
      >
        <template #default="{ index }">
          <ProFormText
            :initial-value="index"
            name="rowKey"
            :label="`第 ${index} 配置`"
          />
          <ProFormText name="name" label="姓名" />
          <ProFormDependency :name="['name']">
            <template #default="{ name }">
              <span
                v-if="!name"
                :style="{
                  lineHeight: '32px',
                }"
              >
                输入姓名展示
              </span>
              <ProFormText v-else name="remark" label="昵称详情" />
            </template>
          </ProFormDependency>
          <ProFormSelect
            name="addr"
            width="md"
            label="与 name 联动的选择器"
            :dependencies="['name']"
            :request="async (params: any) => [
              { label: params.name, value: 'all' },
              { label: 'Unresolved', value: 'open' },
              { label: 'Resolved', value: 'closed' },
              { label: 'Resolving', value: 'processing' },
            ]"
          />
        </template>
      </ProFormList>
    </ProForm>
  </div>
</template>
