---
title: ProFormDependency 数据联动
description: ProFormDependency 用于处理 Form 中的数据依赖和联动。
---

# 数据联动

Form 中的数据联动非常常见，所以我们封装了一个组件来进行数据处理。

## ProFormDependency

ProFormDependency 是一个简化版本的 `Form.Item`，它默认内置了 `noStyle` 与 `shouldUpdate`，我们只需要配置 `name` 来确定依赖哪个数据，ProFormDependency 会自动处理 diff 并且从表单中提取相应的值。

`name` 参数必须是一个数组。如果是嵌套结构，可以这样配置：`name={['name', ['name2', 'text']]}`。

```vue
<ProFormDependency :name="['name']">
  <template #default="{ name }">
    <ProFormSelect
      name="useMode"
      width="md"
      :label="`与《${name}》合同约定生效方式`"
      :options="[{ value: 'chapter', label: '盖章后生效' }]"
    />
  </template>
</ProFormDependency>
```

## 代码示例

React 官网在这里展示：

- 互相依赖表单
- 获取表单依赖值

> 当前 Vue 实现仍在补齐 `ProFormDependency`，此页面先按官网文档结构提供 API 与迁移写法。
