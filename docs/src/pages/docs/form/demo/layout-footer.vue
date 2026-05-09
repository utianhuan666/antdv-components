<docs lang="zh-CN">
固定页脚，对标 React `layout-footer.tsx`。
</docs>

<docs lang="en-US">
Fixed footer submitter, mirroring React `layout-footer.tsx`.
</docs>

<script setup lang="ts">
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormDigit,
  ProFormRadioGroup,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@antdv/components'

function handleFinish(values: Record<string, any>) {
  console.warn('finish', values)
}
</script>

<template>
  <a-card title="Input Form">
    <ProForm @finish="handleFinish">
      <ProFormGroup>
        <ProFormText name="name" label="Contract Customer Name" placeholder="Please enter a name" />
        <ProFormText width="md" name="company" label="Our Company Name" placeholder="Please enter a name" />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormText :name="['contract', 'name']" label="Contract Name" placeholder="Please enter a name" />
        <ProFormDateRangePicker :name="['contract', 'createTime']" label="Contract Effective Time" />
      </ProFormGroup>
      <ProFormGroup>
        <ProFormSelect
          width="xs"
          name="chapter"
          label="Contract Agreed Effective Method"
          :value-enum="{ chapter: 'Effective after stamping' }"
        />
        <ProFormSelect
          width="xs"
          name="unusedMode"
          label="Contract Agreed Invalid Method"
          :value-enum="{ time: 'Terminate after performance' }"
        />
      </ProFormGroup>
      <ProFormRadioGroup
        name="invoiceType"
        label="Invoice Type"
        initial-value="Invoice"
        :field-props="{ options: ['Invoice', 'General Invoice', 'No Invoice'] }"
      />
      <ProFormDigit width="xs" name="num" label="Number of Copies" :initial-value="5" />
      <ProFormTextArea width="xl" label="Contract Remarks" name="remark" />
    </ProForm>
  </a-card>
</template>
