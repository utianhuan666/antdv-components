---
title: Query/LightFilter 筛选表单
description: QueryFilter 和 LightFilter 是用于和 Table、List 等数据展示组件组合的筛选表单。
---

# QueryFilter / LightFilter 筛选表单

有些时候表单要与别的组件组合使用，常见的有 Table、List 等，这时候就需要一些特殊形态的表单。

QueryFilter 和 LightFilter 解决了配合组件使用的问题，避免了复杂的样式设置。ProTable 中默认支持 QueryFilter 和 LightFilter 作为自己的筛选表单。

## 查询筛选

React 官网在这里展示：

- 基本使用
- 查询筛选-默认收起
- 查询筛选-垂直布局
- 查询筛选-搜索
- 查询筛选-自定义渲染的控件数量

## 轻量筛选

React 官网在这里展示：

- 基本使用
- 轻量筛选-自定义 footer
- 轻量筛选-边框模式
- 轻量筛选-折叠模式
- 轻量筛选-弹出框对齐方式

## API

### QueryFilter

QueryFilter 除了继承 ProForm 的 API 以外还支持下面的属性。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `collapsed` | 是否折叠超出的表单项，用于受控模式 | `boolean` | - |
| `defaultCollapsed` | 默认状态下是否折叠超出的表单项 | `boolean` | `true` |
| `onCollapse` | 切换表单折叠状态时的回调 | `(collapsed) => void` | - |
| `submitterColSpanProps` | 提交按钮所在 col 的 props | `ColProps` | - |
| `labelWidth` | label 宽度 | `number \| 'auto'` | `80` |
| `span` | 表单项宽度 | `number \| responsive span` | - |

### LightFilter

LightFilter 除了继承 ProForm 的 API 以外还支持下面的属性。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `collapse` | 是否默认折叠全部字段 | `boolean` | `false` |
| `collapseLabel` | 折叠区域的标签 | `VNodeChild` | `更多筛选` |
| `variant` | 样式变体 | `'outlined' \| 'filled' \| 'borderless'` | - |
| `ignoreRules` | 是否忽略表单项 rules | `boolean` | - |
| `footerRender` | 底部内容 | `Function \| false` | - |
| `popoverProps` | 透传给内部 Popover 的属性 | `PopoverProps` | - |
| `placement` | 选择框弹出的位置 | `TooltipPlacement` | `bottomLeft` |

> 当前 Vue 实现仍在补齐 QueryFilter / LightFilter，页面结构先与官网保持一致。
