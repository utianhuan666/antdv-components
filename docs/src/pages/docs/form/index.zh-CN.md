---
title: ProForm 高级表单
description: ProForm 在原来的 Form 基础上增加了一些语法糖和更多的布局设置，帮助我们快速地开发一个表单。
demo:
  cols: 1
---

# ProForm 高级表单

ProForm 在原来的 Form 的基础上增加了一些语法糖和更多的布局设置，帮助我们快速地开发一个表单，同时添加了一些默认行为，让我们的表单默认好用。

分步表单、Modal 表单、Drawer 表单、查询表单、轻量筛选等多种 layout 可以覆盖大部分的使用场景，让我们脱离复杂而且繁琐的表单布局工作，用更少的代码完成更多的功能。

- 如果想要设置默认值，请使用 `initialValues`，任何直接使用组件 `value` 和 `onChange` 的方式都有可能导致值绑定失效。
- 如果想要表单联动或者做一些依赖，可以使用 `ProFormDependency`。
- ProForm 的 `onFinish` 与 antdv-next 的 `Form` 不同，支持 Promise，如果你正常返回会自动为你设置按钮的加载效果。
- 如果想要监听某个值，建议使用 `onValuesChange`。保持单向的数据流无论对开发者还是维护者都大有裨益。
- ProForm 没有黑科技，只是 antdv-next `Form` 的封装，如果要使用自定义的组件可以用 `Form.Item` 包裹后使用，支持混用。

```vue
<!-- 设置整体默认值 -->
<ProForm :initial-values="obj" />

<!-- 设置单个控件 -->
<ProForm @values-change="handleValuesChange">
  <ProFormText name="name" />
</ProForm>

<!-- 使用自定义组件 -->
<ProForm>
  <a-form-item name="switch" label="Switch">
    <a-switch />
  </a-form-item>
</ProForm>
```

## 何时使用 ProForm？

当你想快速实现一个表单但不想花太多时间去布局时 ProForm 是最好的选择。

ProForm 是基于 antdv-next Form 的可降级封装，与 antdv-next 功能完全对齐，但是在其之上还增加一些预设行为和多种布局。这些布局之间可以无缝切换，并且拥有公共的 API。

| 布局                                     | 使用场景                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| [ProForm](/docs/form)                    | 标准 Form，增加了 `onFinish` 中自动 `loading` 和根据 `request` 自动获取默认值的功能。 |
| [ModalForm/DrawerForm](/docs/modal-form) | 在 ProForm 的基础上增加了 `trigger`，无需维护 `open` 状态。                           |
| [QueryFilter](/docs/query-filter)        | 一般用于作为筛选表单，需要配合其他数据展示组件使用。                                  |
| [LightFilter](/docs/query-filter)        | 一般用于作为行内内置的筛选，比如卡片操作栏和表格操作栏。                              |
| [StepsForm](/docs/steps-form)            | 分步表单，需要配置 StepForm 使用。                                                    |

## 代码演示

<demo-group>
  <demo src="./demo/base.vue">基础用法</demo>
  <demo src="./demo/readonly.vue">只读模式</demo>
  <demo src="./demo/grid.vue">栅格布局</demo>
</demo-group>

### ProForm.Group

<demo-group>
  <demo src="./demo/group.vue">分组 ProForm.Group</demo>
</demo-group>

## API

ProForm 透传 antdv `Form` 全部属性，并扩展以下能力：

| 属性              | 说明                       | 类型                                           | 默认值          |
| ----------------- | -------------------------- | ---------------------------------------------- | --------------- |
| `submitter`       | 自定义提交器，`false` 关闭 | `false \| SubmitterProps`                      | `{}`            |
| `loading`         | 提交按钮 loading           | `boolean`                                      | `false`         |
| `readonly`        | 整个表单进入只读           | `boolean`                                      | `false`         |
| `request`         | 远程请求初始数据           | `(params) => Promise<values>`                  | -               |
| `params`          | 请求参数                   | `Record<string, any>`                          | -               |
| `grid`            | 栅格布局开关               | `boolean`                                      | `false`         |
| `rowProps`        | 栅格 Row 属性              | `RowProps`                                     | `{ gutter: 8 }` |
| `colProps`        | 默认 Col 属性              | `ColProps`                                     | `{ xs: 24 }`    |
| `onFinish`        | 表单提交回调               | `(values) => Promise<boolean \| void> \| void` | -               |
| `onLoadingChange` | loading 改变回调           | `(loading) => void`                            | -               |

字段组件通用属性（对标 React `ProFormFieldItemProps`）：

| 属性            | 说明                              | 类型                                             | 默认值 |
| --------------- | --------------------------------- | ------------------------------------------------ | ------ |
| `name`          | 字段名                            | `NamePath`                                       | -      |
| `label`         | 标签                              | `VueNode`                                        | -      |
| `width`         | 宽度，支持 `xs/sm/md/lg/xl`       | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | -      |
| `placeholder`   | 占位                              | `string \| string[]`                             | -      |
| `valueEnum`     | 选项枚举（select/radio/checkbox） | `Record<string, any>`                            | -      |
| `request`       | 远程拉取选项                      | `(...args) => Promise<any[]>`                    | -      |
| `fieldProps`    | 透传给底层控件                    | `Record<string, any>`                            | -      |
| `proFieldProps` | 透传给 `ProField`                 | `Record<string, any>`                            | -      |
| `readonly`      | 单字段只读                        | `boolean`                                        | -      |
