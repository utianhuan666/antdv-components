---
title: ProField 字段
description: 业务级字段组件，支持读写模式切换，内置 30+ 种值类型。
demo:
  cols: 1
---

# ProField 字段

ProField 是 pro-components 的原子组件，为表单、表格、描述等场景提供统一的字段渲染能力。通过 `valueType` 指定字段类型，`mode` 切换只读/编辑模式。

## 核心概念

- **valueType**：值的展示类型，如 `text`、`select`、`date`、`money` 等
- **mode**：`read` 只读模式 | `edit` 编辑模式 | `update` 更新模式
- **text**：字段的值，只读模式用于显示，编辑模式用于初始值

## 代码演示

<demo-group>
  <demo src="./demo/text.vue">文本 Text</demo>
  <demo src="./demo/password.vue">密码 Password</demo>
  <demo src="./demo/select.vue">选择器 Select</demo>
  <demo src="./demo/money.vue">金额 Money</demo>
  <demo src="./demo/date.vue">日期 Date</demo>
  <demo src="./demo/digit.vue">数字 Digit</demo>
  <demo src="./demo/checkbox-radio.vue">复选框 / 单选 / 开关 / 评分</demo>
  <demo src="./demo/other.vue">进度 / 图片 / 代码 / 相对时间 / 状态</demo>
</demo-group>

## API

### ProField

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `text` | 字段值 | `any` | - |
| `valueType` | 值类型 | `ProFieldValueType` | `'text'` |
| `mode` | 模式 | `'read' \| 'edit' \| 'update'` | `'read'` |
| `readonly` | 是否只读（覆盖 mode 为 read） | `boolean` | `false` |
| `fieldProps` | 传递给底层组件的属性 | `object` | `{}` |
| `render` | 只读模式自定义渲染 | `(text, props, dom) => VNode` | - |
| `formItemRender` | 编辑模式自定义渲染 | `(text, props, dom) => VNode` | - |
| `emptyText` | 空值占位文本，`false` 不显示 | `string \| false` | `'-'` |
| `valueEnum` | 枚举值映射 | `Map \| Record<string, any>` | - |
| `request` | 远程请求选项 | `(params, props) => Promise` | - |
| `params` | 远程请求参数 | `object` | - |
| `placeholder` | 占位提示 | `string \| string[]` | - |

### valueType 一览

| valueType | 说明 | 对应组件 |
| --- | --- | --- |
| `text` | 文本 | FieldText |
| `password` | 密码 | FieldPassword |
| `textarea` | 多行文本 | FieldTextArea |
| `select` | 选择器 | FieldSelect |
| `treeSelect` | 树选择 | FieldTreeSelect |
| `cascader` | 级联选择 | FieldCascader |
| `checkbox` | 复选框 | FieldCheckbox |
| `radio` | 单选框 | FieldRadio |
| `radioButton` | 按钮单选 | FieldRadio |
| `switch` | 开关 | FieldSwitch |
| `rate` | 评分 | FieldRate |
| `slider` | 滑动条 | FieldSlider |
| `digit` | 数字 | FieldDigit |
| `digitRange` | 数字范围 | FieldDigitRange |
| `money` | 金额 | FieldMoney |
| `percent` | 百分比 | FieldPercent |
| `date` | 日期 | FieldDatePicker |
| `dateWeek` | 周 | FieldDatePicker |
| `dateMonth` | 月 | FieldDatePicker |
| `dateQuarter` | 季 | FieldDatePicker |
| `dateYear` | 年 | FieldDatePicker |
| `dateTime` | 日期时间 | FieldDatePicker |
| `dateRange` | 日期范围 | FieldRangePicker |
| `dateTimeRange` | 日期时间范围 | FieldRangePicker |
| `dateWeekRange` | 周范围 | FieldRangePicker |
| `dateMonthRange` | 月范围 | FieldRangePicker |
| `dateQuarterRange` | 季范围 | FieldRangePicker |
| `dateYearRange` | 年范围 | FieldRangePicker |
| `time` | 时间 | FieldTimePicker |
| `timeRange` | 时间范围 | FieldTimeRangePicker |
| `progress` | 进度条 | FieldProgress |
| `image` | 图片 | FieldImage |
| `code` | 代码 | FieldCode |
| `jsonCode` | JSON 代码 | FieldCode |
| `fromNow` | 相对时间 | FieldFromNow |
| `second` | 秒数 | FieldSecond |
| `option` | 操作列 | FieldOptions |
| `index` | 序号列 | FieldIndexColumn |
| `indexBorder` | 带边框序号 | FieldIndexColumn |
| `avatar` | 头像 | Avatar |
| `color` | 颜色选择 | FieldColorPicker |
| `segmented` | 分段控制器 | FieldSegmented |
| `status` | 状态 | FieldStatus |

### 子组件

| 组件名 | 说明 |
| --- | --- |
| `FieldText` | 文本 |
| `FieldTextArea` | 多行文本 |
| `FieldPassword` | 密码 |
| `FieldSelect` | 选择器 |
| `FieldTreeSelect` | 树选择 |
| `FieldCascader` | 级联选择 |
| `FieldCheckbox` | 复选框 |
| `FieldRadio` | 单选框 |
| `FieldSwitch` | 开关 |
| `FieldRate` | 评分 |
| `FieldSlider` | 滑动条 |
| `FieldDigit` | 数字 |
| `FieldDigitRange` | 数字范围 |
| `FieldMoney` | 金额 |
| `FieldPercent` | 百分比 |
| `FieldDatePicker` | 日期选择 |
| `FieldRangePicker` | 日期范围 |
| `FieldTimePicker` | 时间选择 |
| `FieldTimeRangePicker` | 时间范围 |
| `FieldProgress` | 进度条 |
| `FieldImage` | 图片 |
| `FieldCode` | 代码 |
| `FieldFromNow` | 相对时间 |
| `FieldSecond` | 秒数 |
| `FieldOptions` | 操作列 |
| `FieldIndexColumn` | 序号列 |
| `FieldStatus` | 状态 |
| `FieldColorPicker` | 颜色选择 |
| `FieldSegmented` | 分段控制器 |
| `PureProField` | 轻量 ProField（无内置 valueType 映射） |
