<docs lang="zh-CN">
查询筛选 - 搜索。对标 React `demos/form/QueryFilter/search-filter.tsx`：
顶部搜索 + 快捷词 + Tabs + 高级筛选 QueryFilter。
</docs>

<docs lang="en-US">
Search filter. Mirrors React `search-filter.tsx`.
</docs>

<script setup lang="ts">
import { DownOutlined, UpOutlined } from '@antdv-next/icons'
import { ProFormDatePicker, ProFormGroup, ProFormText, QueryFilter } from '@antdv/components'
import { InputSearch, Tabs } from 'antdv-next'
import { ref } from 'vue'

const searchText = ref<string>('')
const showFilter = ref<boolean>(true)
const activeKey = ref<string>('articles')
const quickSearch = ['小程序开发', '入驻', 'ISV 权限']

function handleSearch(value: string) {
  searchText.value = value
}

function handleQuick(text: string) {
  searchText.value = text
  handleSearch(text)
}

function handleFilterChange(_: Record<string, any>, allValues: Record<string, any>) {
  // 与 React onChange 对齐，输出当前筛选值
  console.warn('search-filter values', allValues)
}
</script>

<template>
  <div style="padding: 24px">
    <div :style="{ display: 'flex', flexDirection: 'column', gap: '8px' }">
      <InputSearch
        v-model:value="searchText"
        placeholder="请输入"
        enter-button="搜索"
        :style="{ maxWidth: '522px', width: '100%' }"
        @search="handleSearch"
      />
      <div :style="{ display: 'flex', gap: '12px' }">
        <a v-for="text in quickSearch" :key="text" @click="handleQuick(text)">
          {{ text }}
        </a>
      </div>
    </div>

    <Tabs
      v-model:active-key="activeKey"
      :items="[
        { key: 'articles', label: '文章' },
        { key: 'projects', label: '项目' },
        { key: 'applications', label: '应用' },
      ]"
    >
      <template #rightExtra>
        <a :style="{ display: 'flex', gap: '4px' }" @click="showFilter = !showFilter">
          高级筛选
          <UpOutlined v-if="showFilter" />
          <DownOutlined v-else />
        </a>
      </template>
    </Tabs>

    <QueryFilter
      v-if="showFilter"
      :submitter="false"
      :span="24"
      label-width="auto"
      split
      @values-change="handleFilterChange"
    >
      <ProFormGroup title="姓名">
        <ProFormText name="name" />
      </ProFormGroup>
      <ProFormGroup title="详情">
        <ProFormText name="age" label="年龄" />
        <ProFormDatePicker name="birth" label="生日" />
      </ProFormGroup>
    </QueryFilter>
  </div>
</template>
