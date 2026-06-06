---
title: ProDescriptions 描述列表
---

ProDescriptions 用于详情页场景，基于 `antdv-next` Descriptions 渲染单条记录，并支持 Pro Components 的 `columns`、`request`、`valueType`、`valueEnum` 与行内编辑能力。

## 基础使用

<demo src="./demo/basic.vue">基础使用</demo>

## 请求数据

<demo src="./demo/request.vue">请求数据</demo>

## 可编辑

<demo src="./demo/editable.vue">可编辑</demo>

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `columns` | 描述项配置 | `ProDescriptionsColumn[]` | `[]` |
| `dataSource` | 当前单条数据 | `Record<string, any>` | - |
| `request` | 请求单条数据 | `(params) => Promise<{ data?: T; success?: boolean }>` | - |
| `params` | 请求参数，变化后重新请求 | `Record<string, unknown>` | - |
| `actionRef` | 暴露 `reload`、`dataSource`、`setDataSource` 和编辑方法 | `Ref<ProDescriptionsActionType>` | - |
| `editable` | 行内编辑配置 | `RowEditableConfig` | - |
| `emptyText` | 空值占位 | `VNodeChild` | `-` |

