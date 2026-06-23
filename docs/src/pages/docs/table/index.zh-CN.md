---
title: ProTable 高级表格
---

ProTable 基于 `antdv-next` Table，提供 Pro Components 兼容的 `columns`、`request`、`search`、工具栏、列设置和可编辑表格能力。

## 基础使用

<demo src="./demo/basic.vue">基础使用</demo>

## 请求数据

<demo src="./demo/request.vue">请求数据</demo>

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `columns` | 表格列配置，兼容 ProColumns | `ProColumns[]` | `[]` |
| `request` | 请求表格数据 | `(params, sort, filter) => Promise<{ data; success; total }>` | - |
| `params` | 额外请求参数，变化后重新请求 | `Record<string, unknown>` | - |
| `actionRef` | 暴露 `reload`、`reset`、`clearSelected`、编辑方法 | `Ref<ActionType>` | - |
| `search` | 搜索表单配置，传 `false` 隐藏 | `false \| SearchConfig` | `{}` |
| `options` | 工具栏选项配置 | `false \| OptionConfig` | `{}` |
| `columnsState` | 列状态、持久化和受控配置 | `ColumnStateType` | - |
| `editable` | 行编辑配置 | `RowEditableConfig` | - |
