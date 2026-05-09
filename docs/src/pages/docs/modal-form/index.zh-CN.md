---
title: Modal/Drawer 浮层表单
description: ModalForm 和 DrawerForm 是 ProForm 的变体，本质上仍然是表单。
---

# 浮层表单

ModalForm 和 DrawerForm 是 ProForm 的一个变体，本质上仍然是个表单。所以无法通过 `footer` 来自定义页脚，如果要定义页脚需要使用 `submitter.render` 来进行自定义。

ModalForm 和 DrawerForm 都提供了 `trigger` 来减少 state 的使用。如果你需要使用 state 来控制，可以使用 `open` 和 `onOpenChange` 来控制打开与关闭。

## Modal 表单

React 官网在这里展示 Modal 表单、Drawer 表单、嵌套浮层表单、自定义按钮、受控 `open`、重置表单等示例。

## API

### ModalForm

ModalForm 组合了 Modal 和 ProForm，可以减少繁琐的状态管理。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `trigger` | 用于触发 Modal 打开的 dom，一般是 Button | `VNodeChild` | - |
| `open` | 是否打开 | `boolean` | - |
| `onOpenChange` | open 改变时触发 | `(open: boolean) => void` | - |
| `modalProps` | Modal 的 props。注意：不支持传入 `open`，请使用顶层的 `open` 控制 | `ModalProps` | - |
| `title` | 弹框的标题 | `VNodeChild` | - |
| `width` | 弹框的宽度 | `number \| string` | - |
| `onFinish` | 提交数据时触发，返回真值会关闭弹框 | `(values) => Promise<any>` | - |
| `submitter` | 提交按钮相关配置，使用方式与 ProForm 相同 | `SubmitterProps \| false` | - |

### DrawerForm

DrawerForm 组合了 Drawer 和 ProForm，可以减少繁琐的状态管理。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `trigger` | 用于触发抽屉打开的 dom，一般是 Button | `VNodeChild` | - |
| `open` | 是否打开 | `boolean` | - |
| `onOpenChange` | open 改变时触发 | `(open: boolean) => void` | - |
| `drawerProps` | Drawer 的 props。注意：不支持传入 `open`，请使用顶层的 `open` 控制 | `DrawerProps` | - |
| `title` | 抽屉的标题 | `VNodeChild` | - |
| `width` | 抽屉的宽度 | `number \| string` | - |
| `resize` | 是否允许拖拽调整抽屉宽度 | `boolean \| object` | `false` |
| `onFinish` | 提交数据时触发，返回真值会关闭抽屉 | `(values) => Promise<any>` | - |

> 当前 Vue 实现仍在对齐 ModalForm / DrawerForm，页面结构先与官网保持一致。
