---
title: ProFormFields 表单项
description: ProForm 自带的表单项，本质上是 Form.Item 和输入组件的组合。
demo:
  cols: 1
---

# ProFormFields 表单项

一个表单除了 Form 之外还是需要一系列的表单项，ProForm 自带了数量可观的表单项，这些组件本质上是 `Form.Item` 和组件的结合，我们可以把它们当成一个 `FormItem` 来使用，并且支持各种 props。

每个表单项都支持 `fieldProps` 属性来设置输入组件的 props。我们支持了 `placeholder` 的透传，你可以直接在组件上设置 `placeholder`。

每个表单项同时也支持 `readonly`，不同的组件会有不同的只读样式，与 `disabled` 相比 `readonly` 展示更加友好。

`ProFormText` 是 `FormItem + Input` 的产物，可以类比于以下代码：

```vue
<ProFormItem v-bind="props">
  <a-input :placeholder="props.placeholder" v-bind="props.fieldProps" />
</ProFormItem>
```

所以我们给 `ProFormText` 设置的 props 其实是 `Form.Item` 的，`fieldProps` 才是包含的组件 props，要切记。

## 组件列表

| 组件 | 使用场景 |
| --- | --- |
| `ProFormText` | 用于输入各类文本 |
| `ProFormDigit` | 用于输入数字 |
| `ProFormText.Password` | 用于输入密码 |
| `ProFormTextArea` | 用于输入多行文本 |
| `ProFormDatePicker` | 日期选择器用于输入日期 |
| `ProFormDateTimePicker` | 日期 + 时间选择器 |
| `ProFormDateRangePicker` | 日期区间选择器 |
| `ProFormDateTimeRangePicker` | 日期 + 时间区间选择器 |
| `ProFormSelect` | 支持 `request` 和 `valueEnum` 两种方式来生成子项 |
| `ProFormTreeSelect` | 树选择 |
| `ProFormCheckbox` | 复选框 |
| `ProFormRadio.Group` | 单选框组 |
| `ProFormSlider` | 滑块 |
| `ProFormSwitch` | 用于输入互斥的两个选项 |
| `ProFormMoney` | 通用金额输入组件 |
| `ProFormSegmented` | 分段控制器 |

## 代码示例

<demo-group>
  <demo src="./demo/components-other.vue">表单项</demo>
</demo-group>

## API

ProForm 自带的 Field 与 `valueType` 基本上一一对应。

### 通用属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `width` | Field 的长度，支持 `xs`、`sm`、`md`、`lg`、`xl` | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | - |
| `rowProps` | 开启 `grid` 模式时传递给 Row | `RowProps` | `{ gutter: 8 }` |
| `colProps` | 开启 `grid` 模式时传递给 Col | `ColProps` | `{ xs: 24 }` |
| `tooltip` | 会在 label 旁增加一个 icon，悬浮后展示配置的信息 | `string \| tooltipProps` | - |
| `secondary` | 是否是次要控件，只针对 LightFilter 下有效 | `boolean` | `false` |
| `allowClear` | 支持清除，主动设置情况下同时也会透传给 `fieldProps` | `boolean` | `true` |

### 宽度

在某些场景下，我们需要根据页面展示效果对输入框进行自适应处理，除此以外一个表单区域应默认使用定宽规则。

- `XS = 104px`：适用于短数字、短文本或选项。
- `SM = 216px`：适用于较短字段录入，如姓名、电话、ID 等。
- `MD = 328px`：标准宽度，适用于大部分字段长度。
- `LG = 440px`：适用于较长字段录入，如长网址、标签组、文件路径等。
- `XL = 552px`：适用于长文本录入，如长链接、描述、备注等。
