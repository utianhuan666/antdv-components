<docs lang="zh-CN">
复选框和单选框类型，支持 valueEnum 映射。
</docs>

<docs lang="en-US">
Checkbox and radio types, supports valueEnum mapping.
</docs>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <h4>复选框 - 只读</h4>
      <FieldCheckbox :text="['a', 'b']" mode="read" :value-enum="{ a: '选项A', b: '选项B', c: '选项C' }" />
    </div>
    <div>
      <h4>单选框 - 只读</h4>
      <FieldRadio text="male" mode="read" :value-enum="{ male: '男', female: '女' }" />
    </div>
    <div>
      <h4>开关 - 只读</h4>
      <FieldSwitch :text="true" mode="read" />
    </div>
    <div>
      <h4>评分 - 只读</h4>
      <FieldRate :text="3" mode="read" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldCheckbox, FieldRadio, FieldSwitch, FieldRate } from '@antdv/components'
</script>
