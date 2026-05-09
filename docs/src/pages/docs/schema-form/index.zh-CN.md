---
title: Schema Form JSON 表单
description: 使用 JSON Schema 的方式生成 ProForm。
---

# Schema Form - JSON 表单

Schema Form 是基于 ProForm 的 JSON 表单方案，用于通过配置描述表单结构、字段类型、联动与校验。

```vue
<BetaSchemaForm
  :columns="columns"
  :initial-values="initialValues"
  @finish="handleFinish"
/>
```

## 使用场景

- 需要从后端下发 schema 动态生成表单。
- 需要和 ProTable 的 `columns` 结构打通。
- 需要低代码配置中台表单。

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `columns` | 表单项 schema | `ProFormColumnsType[]` | - |
| `layoutType` | 表单类型 | `Form \| ModalForm \| DrawerForm \| StepsForm` | `Form` |
| `grid` | 是否开启栅格布局 | `boolean` | `false` |
| `onFinish` | 表单提交 | `(values) => Promise<boolean \| void> \| void` | - |

> 当前 Vue 实现仍在对齐 React `BetaSchemaForm`，页面结构先与官网保持一致。
