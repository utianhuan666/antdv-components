---
title: StepsForm 分步表单
description: StepsForm 通过 Provider 来管理子表单的数据，每个子表单都是完整的数据。
---

# StepsForm - 分步表单

StepsForm 通过 Provider 来管理子表单的数据，每个子表单都是完整的数据，在 StepsForm 组合成最后的数据。同时自带了一个进度条和管理进度条的相关 API。

> StepsForm 继承了 Form.Provider，转化值是 ProForm 提供的功能，所以 `onFormFinish` 和 `onFormChange` 其中的值都是未经转化的。

## 分步表单

React 官网在这里展示：

- 分步表单
- 分步表单垂直模式
- 自定义分步表单按钮
- 分步表单 - 多卡片
- 分步表单 - 与 Modal 配合使用
- 编辑场景下的分步表单

## StepsForm API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `current` | 当前表单的步骤数，从 `0` 开始 | `number` | `0` |
| `onCurrentChange` | current 发生改变的事件 | `(current: number) => void` | - |
| `onFinish` | 表单最后一步提交成功触发，返回真值会自动重置表单 | `(values) => Promise<boolean \| void>` | - |
| `stepsProps` | StepsForm 自带的 Steps 的 props | `StepsProps` | - |
| `stepFormRender` | 自定义当前展示的表单 | `(formDom) => VNodeChild` | - |
| `stepsFormRender` | 自定义整个表单区域 | `(formDom, submitter) => VNodeChild` | - |
| `stepsRender` | 自定义步骤器 | `(steps, dom) => VNodeChild` | - |
| `formRef` | 当前展示表单的 formRef | `Ref<ProFormInstance>` | - |

### StepForm

与 [ProForm](/docs/form) 完全相同，只是 `onFinish` 支持 Promise，如果返回 `false`，就不会跳转下一步。

> 当前 Vue 实现仍在对齐 React StepsForm，页面结构先与官网保持一致。
