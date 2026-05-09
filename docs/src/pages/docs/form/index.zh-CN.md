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

<demo-group>
  <demo src="./demo/layout-change.vue">Form 的 layout 切换</demo>
</demo-group>

## 数据转化

很多时候组件需要的数据和后端需要的数据之间不能完全匹配，ProForm 为了解决这个问题提供了 `transform` 和 `convertValue` 两个 API 来处理这种情况。

### convertValue 前置转化

`convertValue` 发生在组件获得数据之前，一般是后端直接给前端的数据，有时需要精加工一下。

### transform 提交时转化

`transform` 发生在提交的时候，一般来说都是吐给后端的存在数据库里的数据。

#### transform 的两种常见返回写法（建议直接照着用）

- **返回普通值**：会替换当前字段的提交值。
- **返回对象**：用于“改名 / 拆分字段 / 写回嵌套路径”。

## 代码示例

<demo-group>
  <demo src="./demo/base.vue">基本使用</demo>
</demo-group>

### 标签与表单项布局

除了 `LightFilter` 和 `QueryFilter` 这样固定布局的表单样式，其他表单布局支持配置与 antdv-next 一致的三种布局方式。

<demo-group>
  <demo src="./demo/form-layout.vue">标签与表单项布局</demo>
</demo-group>

### 栅格化布局

同时支持在 `ProForm`、`SchemaForm`、`ModalForm`、`DrawerForm`、`StepsForm` 中使用。

<demo-group>
  <demo src="./demo/form-layout-grid.vue">栅格化布局</demo>
  <demo src="./demo/dependency.vue">表单联动</demo>
  <demo src="./demo/form-ref.vue">表单方法调用</demo>
</demo-group>

### 同步提交结果到 url

打开时也会把 url 的参数设置为默认值，支持 transform，但是要注意字段的映射。

<demo-group>
  <demo src="./demo/sync-to-url.vue">同步提交结果到 url</demo>
  <demo src="./demo/money.vue">金额</demo>
  <demo src="./demo/layout-footer.vue">固定页脚</demo>
  <demo src="./demo/pro-form-editable-table.vue">ProForm 和 EditableTable 同时使用</demo>
</demo-group>

## 劫持渲染函数的组件

FormItemRender 用来专门处理，采用 render props 的方式来组织代码，更好的聚合带请求的业务代码，也更好的完成自定义表单项的功能。

- 使用 useControlModel 来快速的创建一个自定义表单项。
- 使用 withFormItemRender 来生成一个 FormItemRender，可以以内联的方式去组织代码。
- 使用 FormControlRender 来把一个 form 组件转换成 render props 的形式。

### 使用 useControlModel

从一个官网例子开始自定义表单项。

<demo-group>
  <demo src="./demo/antd.vue">官网例子</demo>
  <demo src="./demo/antd-modify.vue">使用 hooks 改造</demo>
  <demo src="./demo/antd-nest.vue">嵌套使用</demo>
</demo-group>

### FormControlRender

使用 FormControlRender 既可以内联的书写代码，又可以更灵活的编写逻辑，适用于一些组件外层包裹了 ProForm.Item 或者 Form.Item。

<demo-group>
  <demo src="./demo/form-control-render.vue">FormControlRender</demo>
</demo-group>

### FormItemRender & ProFormItemRender

使用 FormItemRender 或者 ProFormItemRender 可以更方便的在 Form 里书写表单项。

<demo-group>
  <demo src="./demo/form-item-render.vue">FormItemRender</demo>
  <demo src="./demo/linkage-customization.vue">自定义联动</demo>
  <demo src="./demo/pro-form-dependency-debug.vue">ProFormDependency debug</demo>
  <demo src="./demo/label-col.vue">labelCol debug</demo>
</demo-group>

## ProForm

ProForm 是对 antdv-next Form 的再封装，如果你想要自定义表单元素，ProForm 与 antdv-next 的方法是相同的，你仍然可以用 FormItem + 自定义组件的方式来自定义。

| 参数                  | 说明                                                                     | 类型                                             | 默认值          |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------ | --------------- |
| `onFinish`            | 提交表单且数据验证成功后回调事件，支持 Promise，会自动设置按钮的加载效果 | `(formData) => Promise<boolean \| void> \| void` | -               |
| `onReset`             | 点击重置按钮的回调                                                       | `(e) => void`                                    | -               |
| `submitter`           | 提交按钮相关配置                                                         | `SubmitterProps \| false`                        | `true`          |
| `loading`             | 表单按钮的 loading 状态                                                  | `boolean`                                        | -               |
| `onLoadingChange`     | loading 状态改变时的回调                                                 | `(loading: boolean) => void`                     | -               |
| `formRef`             | 获取表单所使用的 form                                                    | `Ref<ProFormInstance>`                           | -               |
| `syncToUrl`           | 同步参数到 url 上                                                        | `boolean \| Function`                            | -               |
| `params`              | 发起网络请求的参数，与 request 配合使用                                  | `Record<string, any>`                            | -               |
| `request`             | 发起网络请求，返回值会覆盖给 initialValues                               | `(params) => Promise<Record<string, any>>`       | -               |
| `formKey`             | 用于控制 form 是否相同的 key                                             | `string`                                         | -               |
| `autoFocusFirstInput` | 自动 focus 表单第一个输入框                                              | `boolean`                                        | `true`          |
| `readonly`            | 是否只读模式，对所有表单项生效                                           | `boolean`                                        | -               |
| `grid`                | 开启栅格化模式                                                           | `boolean`                                        | `false`         |
| `rowProps`            | 开启 `grid` 模式时传递给 `Row`                                           | `RowProps`                                       | `{ gutter: 8 }` |
| `colProps`            | 开启 `grid` 模式时传递给 `Col`                                           | `ColProps`                                       | `{ xs: 24 }`    |

### ProFormInstance

ProFormInstance 与 antdv-next 的 form 相比增加了一些能力。

| 方法                              | 说明                                         |
| --------------------------------- | -------------------------------------------- |
| `getFieldsFormatValue`            | 获取被 ProForm 格式化后的所有数据            |
| `getFieldFormatValue`             | 获取被 ProForm 格式化后的单个数据            |
| `getFieldFormatValueObject`       | 获取被 ProForm 格式化后的单个数据，包含 name |
| `validateFieldsReturnFormatValue` | 验证字段后返回格式化之后的所有数据           |

### ProForm.Group

| 参数       | 说明                 | 类型         | 默认值 |
| ---------- | -------------------- | ------------ | ------ |
| `title`    | 标题                 | `string`     | -      |
| `children` | 表单控件或者其他元素 | `VNodeChild` | -      |

<demo-group>
  <demo src="./demo/group.vue">分组 ProForm.Group</demo>
</demo-group>

### formRef

该属性是 ProForm 在原有的 antdv-next `FormInstance` 的基础上做的一个上层封装，增加了一些更加便捷的方法。

<demo-group>
  <demo src="./demo/form-ref.vue">formRef 的使用</demo>
  <demo src="./demo/modalform-test.vue">ModalForm debug</demo>
  <demo src="./demo/params-formref.vue">params 和 formRef debug</demo>
</demo-group>

#### formRef的使用

formRef 可用于设置表单值、获取表单值、触发表单提交与重置。
