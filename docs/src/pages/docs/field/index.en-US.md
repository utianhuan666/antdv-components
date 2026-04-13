---
title: ProField
description: Business-level field component with read/edit mode switching and 30+ built-in value types.
demo:
  cols: 1
---

# ProField

ProField is the atomic component of pro-components, providing unified field rendering for forms, tables, and descriptions. Specify the field type via `valueType` and switch between read/edit modes with `mode`.

## Core Concepts

- **valueType**: The display type of the value, such as `text`, `select`, `date`, `money`, etc.
- **mode**: `read` (display) | `edit` (input) | `update` (update)
- **text**: The field value, used for display in read mode and as initial value in edit mode

## Demos

<demo-group>
  <demo src="./demo/text.vue">Text</demo>
  <demo src="./demo/password.vue">Password</demo>
  <demo src="./demo/select.vue">Select</demo>
  <demo src="./demo/money.vue">Money</demo>
  <demo src="./demo/date.vue">Date</demo>
  <demo src="./demo/digit.vue">Digit</demo>
  <demo src="./demo/checkbox-radio.vue">Checkbox / Radio / Switch / Rate</demo>
  <demo src="./demo/other.vue">Progress / Image / Code / FromNow / Status</demo>
</demo-group>

## API

### ProField

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `text` | Field value | `any` | - |
| `valueType` | Value type | `ProFieldValueType` | `'text'` |
| `mode` | Mode | `'read' \| 'edit' \| 'update'` | `'read'` |
| `readonly` | Whether readonly (overrides mode to read) | `boolean` | `false` |
| `fieldProps` | Props passed to underlying component | `object` | `{}` |
| `render` | Custom read mode renderer | `(text, props, dom) => VNode` | - |
| `formItemRender` | Custom edit mode renderer | `(text, props, dom) => VNode` | - |
| `emptyText` | Empty text placeholder, `false` to hide | `string \| false` | `'-'` |
| `valueEnum` | Enum value mapping | `Map \| Record<string, any>` | - |
| `request` | Remote request for options | `(params, props) => Promise` | - |
| `params` | Remote request params | `object` | - |
| `placeholder` | Placeholder text | `string \| string[]` | - |

### valueType Reference

| valueType | Description | Component |
| --- | --- | --- |
| `text` | Text | FieldText |
| `password` | Password | FieldPassword |
| `textarea` | Textarea | FieldTextArea |
| `select` | Select | FieldSelect |
| `treeSelect` | Tree Select | FieldTreeSelect |
| `cascader` | Cascader | FieldCascader |
| `checkbox` | Checkbox | FieldCheckbox |
| `radio` | Radio | FieldRadio |
| `radioButton` | Radio Button | FieldRadio |
| `switch` | Switch | FieldSwitch |
| `rate` | Rate | FieldRate |
| `slider` | Slider | FieldSlider |
| `digit` | Digit | FieldDigit |
| `digitRange` | Digit Range | FieldDigitRange |
| `money` | Money | FieldMoney |
| `percent` | Percent | FieldPercent |
| `date` | Date | FieldDatePicker |
| `dateWeek` | Week | FieldDatePicker |
| `dateMonth` | Month | FieldDatePicker |
| `dateQuarter` | Quarter | FieldDatePicker |
| `dateYear` | Year | FieldDatePicker |
| `dateTime` | DateTime | FieldDatePicker |
| `dateRange` | Date Range | FieldRangePicker |
| `dateTimeRange` | DateTime Range | FieldRangePicker |
| `dateWeekRange` | Week Range | FieldRangePicker |
| `dateMonthRange` | Month Range | FieldRangePicker |
| `dateQuarterRange` | Quarter Range | FieldRangePicker |
| `dateYearRange` | Year Range | FieldRangePicker |
| `time` | Time | FieldTimePicker |
| `timeRange` | Time Range | FieldTimeRangePicker |
| `progress` | Progress | FieldProgress |
| `image` | Image | FieldImage |
| `code` | Code | FieldCode |
| `jsonCode` | JSON Code | FieldCode |
| `fromNow` | Relative Time | FieldFromNow |
| `second` | Seconds | FieldSecond |
| `option` | Options | FieldOptions |
| `index` | Index | FieldIndexColumn |
| `indexBorder` | Bordered Index | FieldIndexColumn |
| `avatar` | Avatar | Avatar |
| `color` | Color Picker | FieldColorPicker |
| `segmented` | Segmented | FieldSegmented |
| `status` | Status | FieldStatus |

### Sub Components

| Component | Description |
| --- | --- |
| `FieldText` | Text |
| `FieldTextArea` | Textarea |
| `FieldPassword` | Password |
| `FieldSelect` | Select |
| `FieldTreeSelect` | Tree Select |
| `FieldCascader` | Cascader |
| `FieldCheckbox` | Checkbox |
| `FieldRadio` | Radio |
| `FieldSwitch` | Switch |
| `FieldRate` | Rate |
| `FieldSlider` | Slider |
| `FieldDigit` | Digit |
| `FieldDigitRange` | Digit Range |
| `FieldMoney` | Money |
| `FieldPercent` | Percent |
| `FieldDatePicker` | Date Picker |
| `FieldRangePicker` | Date Range Picker |
| `FieldTimePicker` | Time Picker |
| `FieldTimeRangePicker` | Time Range Picker |
| `FieldProgress` | Progress |
| `FieldImage` | Image |
| `FieldCode` | Code |
| `FieldFromNow` | Relative Time |
| `FieldSecond` | Seconds |
| `FieldOptions` | Options |
| `FieldIndexColumn` | Index Column |
| `FieldStatus` | Status |
| `FieldColorPicker` | Color Picker |
| `FieldSegmented` | Segmented Control |
| `PureProField` | Lightweight ProField (no built-in valueType mapping) |
