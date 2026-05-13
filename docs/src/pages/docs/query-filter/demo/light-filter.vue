<docs lang="zh-CN">
轻量筛选 - 综合示例，对标 React `demos/form/QueryFilter/light-filter.tsx`。
覆盖：Select / Date / DateRange / TimePicker / Slider / Checkbox / Switch / 自定义 footer / secondary。
</docs>

<docs lang="en-US">
LightFilter overview, mirrors React `light-filter.tsx`.
</docs>

<script setup lang="ts">
import {
  LightFilter,
  ProFormCheckboxGroup,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTimePicker,
} from '@antdv/components'

function handleFinish(values: Record<string, any>) {
  console.warn('light-filter finish', values)
}
</script>

<template>
  <div style="padding: 24px">
    <LightFilter
      :initial-values="{ name: 'Light Filter' }"
      @finish="handleFinish"
    >
      <ProFormText name="name" label="名称" />
      <ProFormSelect
        name="sex"
        label="性别"
        show-search
        :options="[
          { label: '男', value: 'man' },
          { label: '女', value: 'woman' },
        ]"
      />
      <ProFormDatePicker name="date" label="不带 label 的 DatePicker" />
      <ProFormDateRangePicker name="createDate" label="创建时间" />
      <ProFormTimePicker name="time" label="时间" />
      <ProFormSlider
        name="slider"
        label="兴趣度"
        :marks="{ 0: 'A', 20: 'B', 40: 'C', 60: 'D', 80: 'E', 100: 'F' }"
      />
      <ProFormCheckboxGroup
        name="checkbox"
        label="行业分布"
        :options="['农业', '制造业', '互联网']"
      />
      <ProFormSwitch label="开关" name="switch" />
      <ProFormDateTimePicker name="datetime" label="日期+时间" secondary />
    </LightFilter>
  </div>
</template>
