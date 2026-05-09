<docs lang="zh-CN">
通过表单实例进行填充、读取、重置和提交，对标 React `formRef.tsx`。
</docs>

<docs lang="en-US">
Operate the form instance, mirroring React `formRef.tsx`.
</docs>

<script setup lang="ts">
import type { PropType, VNodeChild } from 'vue'
import { ProForm, ProFormDatePicker, ProFormText } from '@antdv/components'
import { App } from 'antdv-next'
import dayjs from 'dayjs'
import { defineComponent, shallowRef } from 'vue'

interface ProFormExpose {
  setFieldsValue: (values: Record<string, any>) => void
  getFieldsValue: () => Record<string, any>
  getFieldValue: (name: string) => any
  getFieldsFormatValue: () => Record<string, any>
  validateFieldsReturnFormatValue: () => Promise<Record<string, any>>
  submit: () => void
  reset: () => void
}

const formRef = shallowRef<ProFormExpose>()
const { message } = App.useApp()

function waitTime(time = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

const RenderVNodes = defineComponent({
  name: 'RenderVNodes',
  props: {
    nodes: { type: Array as PropType<VNodeChild[]>, default: () => [] },
  },
  setup(props) {
    return () => props.nodes
  },
})

function handleFill() {
  formRef.value?.setFieldsValue({ name: '书琰', company: '杭州星辰科技有限公司' })
}

function handleReadCompany() {
  message.info(`公司名称为 "${formRef.value?.getFieldValue('company')}"`)
}

function handleReadValues() {
  message.info(`格式化后的所有数据：${JSON.stringify(formRef.value?.getFieldsFormatValue?.() ?? {})}`)
}

function handleValidateAndReadValues() {
  formRef.value?.validateFieldsReturnFormatValue?.().then((values) => {
    message.success(`校验表单并返回格式化后的所有数据：${JSON.stringify(values)}`)
  })
}

async function handleFinish() {
  await waitTime(2000)
  message.success('提交成功')
  return true
}
</script>

<template>
  <ProForm ref="formRef" name="formref-demo" title="新建表单" @finish="handleFinish">
    <ProFormText width="md" name="name" label="签约客户名称" tooltip="最长为 24 位" placeholder="请输入名称" />
    <ProFormText width="md" name="company" label="我方公司名称" placeholder="请输入名称" />
    <ProFormDatePicker name="date" :initial-value="dayjs('2021-08-09')" />

    <template #submitter="{ doms }">
      <RenderVNodes :nodes="doms" />
      <a-button html-type="button" @click="handleFill">
        一键填写
      </a-button>
      <a-button html-type="button" @click="handleReadCompany">
        读取公司
      </a-button>
      <span style="display: inline-flex">
        <a-button html-type="button" @click="handleReadValues"> 获取格式化后的所有数据 </a-button>
        <a-button html-type="button" @click="handleValidateAndReadValues"> 校验表单并返回格式化后的所有数据 </a-button>
      </span>
    </template>
  </ProForm>
</template>
