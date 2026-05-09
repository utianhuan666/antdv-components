<docs lang="zh-CN">
金额组件示例，对标 React `money.tsx`。
</docs>

<docs lang="en-US">
Money field examples, mirroring React `money.tsx`.
</docs>

<script setup lang="ts">
import { ProForm, ProFormMoney, ProFormSwitch } from '@antdv/components'
import { shallowRef } from 'vue'

const readonly = shallowRef(false)

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <ProFormSwitch
      label="Read Only"
      :ignore-form-item="true"
      :field-props="{ checked: readonly, checkedChildren: 'On', unCheckedChildren: 'Off', onChange: (checked: boolean) => readonly = checked }"
    />
    <ProForm :readonly="readonly" @finish="handleFinish">
      <ProFormMoney label="No Symbol" name="amount0" :initial-value="22.22" width="lg" />
      <ProFormMoney label="Width" name="amount1" :initial-value="22.22" width="lg" />
      <ProFormMoney label="Minimum Amount 0" name="amount2" :initial-value="22.22" />
      <ProFormMoney label="No Limit" name="amount3" :initial-value="22.22" />
      <ProFormMoney label="Follow Global Locale" name="amount4" :initial-value="22.22" />
      <ProFormMoney label="Custom Symbol" name="amount5" :initial-value="22.22" />
      <ProFormMoney label="Precision" name="amount6" :initial-value="2222222222.22" :field-props="{ precision: 2 }" />
    </ProForm>
  </a-space>
</template>
