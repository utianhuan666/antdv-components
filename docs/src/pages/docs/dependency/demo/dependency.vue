<docs lang="zh-CN">
互相依赖表单。对标 React `demos/form/Dependency/dependency.tsx`，
演示在 ProFormList 内通过 ProFormDependency 取当前行依赖，以及通过
`ignoreFormListField` 跨出 List 取外层全局依赖。
</docs>

<docs lang="en-US">
Mutually dependent form. Mirrors React `dependency.tsx`, showcasing
row-scoped `ProFormDependency` inside `ProFormList` and global lookup
via `ignoreFormListField`.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormDependency,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
} from '@antdv/components'
</script>

<template>
  <div style="padding: 24px">
    <ProForm name="dependency-demo">
      <ProFormSelect
        :options="[
          {
            value: 'select',
            label: '选择框',
          },
          {
            value: 'input',
            label: '输入框',
          },
        ]"
        width="xs"
        name="globalUseMode"
        label="全局生效方式组件的类型"
      />
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
        <ProFormGroup key="group">
          <ProFormSelect
            :options="[
              {
                value: 'select',
                label: '选择框',
              },
              {
                value: 'input',
                label: '输入框',
              },
            ]"
            width="xs"
            name="useMode"
            label="生效方式组件的类型"
          />
          <ProFormDependency :name="['useMode']">
            <template #default="{ useMode }">
              <ProFormSelect
                v-if="useMode === 'select'"
                :options="[
                  {
                    value: 'chapter',
                    label: '盖章后生效',
                  },
                ]"
                width="md"
                name="function"
                label="生效方式"
              />
              <ProFormText v-else width="md" name="function" label="生效方式" />
            </template>
          </ProFormDependency>

          <ProFormDependency
            key="globalUseMode"
            :name="['globalUseMode']"
            ignore-form-list-field
          >
            <template #default="{ globalUseMode }">
              <ProFormSelect
                v-if="globalUseMode === 'select'"
                :options="[
                  {
                    value: 'chapter',
                    label: '盖章后生效',
                  },
                ]"
                width="md"
                name="gfunction"
                label="外层联动生效方式"
              />
              <ProFormText v-else width="md" name="gfunction" label="外层联动生效方式" />
            </template>
          </ProFormDependency>
        </ProFormGroup>
      </ProFormList>
    </ProForm>
  </div>
</template>
