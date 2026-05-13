<docs lang="zh-CN">
可调整的新建按钮位置。
</docs>

<docs lang="en-US">
Adjustable creator button position.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormFieldSet,
  ProFormGroup,
  ProFormList,
  ProFormRadioGroup,
  ProFormSelect,
  ProFormText,
} from '@antdv/components'
import { shallowRef } from 'vue'

const position = shallowRef<'bottom' | 'top'>('bottom')

const positionOptions = [
  {
    label: '顶部',
    value: 'top',
  },
  {
    label: '底部',
    value: 'bottom',
  },
]

async function handleFinish() {
  return true
}
</script>

<template>
  <div style="padding: 24px">
    <a-config-provider component-size="small">
      <ProFormRadioGroup
        :field-props="{
          value: position,
          onChange: (event: any) => (position = event.target.value),
        }"
        :options="positionOptions"
      />
      <ProForm
        name="group-list-demo"
        @finish="handleFinish"
      >
        <ProFormText width="sm" name="id" label="主合同编号" />
        <ProFormText
          name="project"
          width="md"
          label="项目名称"
          initial-value="示例项目"
        />
        <ProFormText
          width="xs"
          name="mangerName"
          label="商务经理"
          initial-value="书琰"
        />
        <ProFormList
          name="users"
          label="用户信息"
          :rules="[
            {
              required: true,
              validator: async (_: any, value: any[]) => {
                if (value && value.length > 0)
                  return
                throw new Error('至少要有一项！')
              },
            },
          ]"
          :creator-button-props="{
            position,
          }"
          :creator-record="{
            name: '',
          }"
          :initial-value="[
            {
              name: '书琰',
              nickName: '琰琰',
              age: 28,
              birth: '2024-01-15',
              sex: 'man',
              addrList: [{ addr: ['taiyuan', 'changfeng'] }],
            },
          ]"
        >
          <ProFormGroup key="group">
            <ProFormText
              :rules="[
                {
                  required: true,
                },
              ]"
              name="name"
              label="姓名"
            />
            <ProFormDigit name="age" label="年龄" width="sm" />
            <ProFormSelect
              label="性别"
              name="sex"
              width="xs"
              :value-enum="{
                man: '男性',
                woman: '女性',
              }"
            />
            <ProFormDatePicker name="birth" label="出生日期" />
            <ProFormFieldSet name="addr" label="地址">
              <ProFormSelect
                :value-enum="{
                  taiyuan: '山西',
                  hangzhou: '杭州',
                }"
              />
              <ProFormSelect
                :value-enum="{
                  changfeng: '长风街',
                  gongzhuan: '工专路',
                }"
              />
            </ProFormFieldSet>
          </ProFormGroup>
        </ProFormList>
      </ProForm>
    </a-config-provider>
  </div>
</template>
