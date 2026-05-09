---
title: ProFormFields 表单项
description: ProForm 自带的表单项，本质上是 Form.Item 和组件的结合，可以当作 FormItem 使用。
demo:
  cols: 1
---

# ProFormFields 表单项

一个表单除了 Form 之外还是需要一系列的表单项，ProForm 自带了数量可观的表单项，这些组件本质上是 Form.Item 和 组件的结合，我们可以把他们当成一个 FormItem 来使用，并且支持各种 `props`。每个表单项都支持 `fieldProps` 属性来支持设置输入组件的`props`。 我们支持了 `placeholder` 的透传，你可以直接在组件上设置 `placeholder`。

每个表单项同时也支持了 `readonly`，不同的组件会有不同的只读样式，与 `disabled` 相比 `readonly` 展示更加友好。生成的 dom 也更小，比如 ProFormDigit 会自动格式化小数位数。

ProFormText 是 FormItem + Input 的产物，可以类比于以下的代码：

```vue
<template>
  <ProForm.Item v-bind="props">
    <a-input :placeholder="props.placeholder" v-bind="props.fieldProps" />
  </ProForm.Item>
</template>
```

所以我们给 ProFormText 设置的 props 其实是 Form.Item 的，`fieldProps` 才是包含的组件的，要切记。

## 组件列表

| 组件                                                                           | 使用场景                                                                                                    |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| [ProFormText](https://antdv.com/components/input-cn/)                          | 用于输入各类文本                                                                                            |
| [ProFormDigit](https://antdv.com/components/input-number-cn/)                  | 用于输入数字，它自带了一个格式化（保留 2 位小数，最小值为 0），有需要你可以关掉它。                         |
| [ProFormText.Password](https://antdv.com/components/input-cn/#Input.Password)  | 用于输入密码                                                                                                |
| [ProFormTextArea](https://antdv.com/components/input-cn/#Input.TextArea)       | 用于输入多行文本                                                                                            |
| ProFormCaptcha                                                                 | 用于输入验证码，一般需要与发送验证码接口一起使用 (Vue 端规划中)                                             |
| [ProFormDatePicker](https://antdv.com/components/date-picker-cn/)              | 日期选择器用于输入日期                                                                                      |
| [ProFormDateTimePicker](https://antdv.com/components/date-picker-cn/)          | 日期 + 时间选择器，用于输入日期和时间                                                                       |
| [ProFormDateRangePicker](https://antdv.com/components/date-picker-cn/)         | 日期区间选择器用于输入一个日期区间                                                                          |
| [ProFormDateTimeRangePicker](https://antdv.com/components/date-picker-cn/)     | 日期 + 时间区间选择器，用于输入一个日期 + 时间的区间                                                        |
| [ProFormSelect](https://antdv.com/components/select-cn/)                       | 支持 `request` 和 `valueEnum` 两种方式来生成子项，用于从两项以上中选择一项                                  |
| [ProFormTreeSelect](https://antdv.com/components/tree-select-cn/)              | 支持 `request` 和 `valueEnum` 两种方式来生成子项，用于从两项以上中选择一项                                  |
| [ProFormCheckbox](https://antdv.com/components/checkbox-cn/)                   | 在 Checkbox 基础上支持了 layout，也支持 `request` 和 `valueEnum` 两种方式来生成子项                         |
| [ProFormRadio.Group](https://antdv.com/components/radio-cn/)                   | 在 Radio 基础上也支持 `request` 和 `valueEnum` 两种方式来生成子项，用于单选某项，但是可以展示出来所有选项。 |
| [ProFormSlider](https://antdv.com/components/slider-cn/)                       | 当用户需要在数值区间 / 自定义区间内进行选择时，可为连续或离散值。                                           |
| [ProFormSwitch](https://antdv.com/components/switch-cn/)                       | 用于输入互斥的两个选项，一般是 true 和 false                                                                |
| ProFormUploadButton                                                            | 按钮样式的上传文件 (Vue 端规划中)                                                                           |
| ProFormUploadDragger                                                           | 区域的上传文件，一般用于突出上传文件的表单中 (Vue 端规划中)                                                 |
| ProFormMoney                                                                   | 通用金额输入组件                                                                                            |
| [ProFormSegmented](https://antdv.com/components/segmented-cn/)                 | 分段控制器                                                                                                  |

## 代码示例

<demo-group>
  <demo src="./demo/components-other.vue">表单项</demo>
  <demo src="./demo/search-select.vue">查询表单</demo>
  <demo src="./demo/form-fieldset.vue">结构化数据</demo>
  <demo src="./demo/datatime.vue">日期表单</demo>
  <demo src="./demo/components-other-readonly.vue">只读表单</demo>
</demo-group>

## API

ProForm 自带的 Field，与 `valueType` 基本上一一对应。

### 通用的属性

| 参数       | 说明                                                                                                | 类型                                             | 默认值          |
| ---------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| width      | Field 的长度，归纳了常用的 Field 长度以及适合的场景，支持枚举 `xs`、`sm`、`md`、`lg`、`xl`          | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | -               |
| rowProps   | 开启 `grid` 模式时传递给 Row，仅在 `ProFormGroup`、`ProFormList`、`ProFormFieldSet` 中有效          | `RowProps`                                       | `{ gutter: 8 }` |
| colProps   | 开启 `grid` 模式时传递给 Col                                                                        | `ColProps`                                       | `{ xs: 24 }`    |
| tooltip    | 会在 label 旁增加一个 icon，悬浮后展示配置的信息                                                    | `string \| tooltipProps`                         | -               |
| secondary  | 是否是次要控件，只针对 LightFilter 下有效                                                           | `boolean`                                        | `false`         |
| allowClear | 支持清除，针对 LightFilter 下有效，主动设置情况下同时也会透传给 `fieldProps`                        | `boolean`                                        | `true`          |

### 宽度

在某些场景下，我们需要根据页面展示效果对输入框进行自适应处理，除此以外一个表单区域应默认使用定宽规则。

![width info](https://gw.alipayobjects.com/zos/alicdn/oEHLxX9DO/22.jpg)

- `XS=104px` 适用于短数字、短文本或选项。
- `SM=216px` 适用于较短字段录入，如姓名、电话、ID 等。
- `MD=328px` 标准宽度，适用于大部分字段长度。
- `LG=440px` 适用于较长字段录入，如长网址、标签组、文件路径等。
- `XL=552px` 适用于长文本录入，如长链接、描述、备注等，通常搭配自适应多行输入框或定高文本域使用。

### ProFormText

与 [Input](https://antdv.com/components/input-cn/) 相同。

```vue
<ProFormText
  name="text"
  label="名称"
  placeholder="请输入名称"
  :field-props="inputProps"
/>
```

### ProFormText.Password

与 [Input.Password](https://antdv.com/components/input-cn/#Input.Password) 相同。

```vue
<ProFormText.Password label="InputPassword" name="input-password" />
```

### ProFormTextArea

与 [Input.TextArea](https://antdv.com/components/input-cn/#Input.TextArea) 相同。

```vue
<ProFormTextArea
  name="text"
  label="名称"
  placeholder="请输入名称"
  :field-props="inputTextAreaProps"
/>
```

### ProFormDigit

与 [InputNumber](https://antdv.com/components/input-number-cn/) 相同。它自带了一个格式化（保留 2 位小数，最小值为 0），有需要你可以关掉它。

```vue
<ProFormDigit label="InputNumber" name="input-number" :min="1" :max="10" />
```

如果要修改小数位数：

```vue
<ProFormDigit
  label="InputNumber"
  name="input-number"
  :min="1"
  :max="10"
  :field-props="{ precision: 0 }"
/>
```

### ProFormDigitRange

与 [InputNumber](https://antdv.com/components/input-number-cn/) 类似。它提供输入数字范围。

```vue
<ProFormDigitRange label="InputNumberRange" name="input-number-range" />
```

### ProFormDatePicker

与 [DatePicker](https://antdv.com/components/date-picker-cn/) 相同。

```vue
<ProFormDatePicker name="date" label="日期" />
```

### ProFormDateTimePicker

与 [DatePicker](https://antdv.com/components/date-picker-cn/) 相同。

```vue
<ProFormDateTimePicker name="datetime" label="日期时间" />
```

### ProFormDateRangePicker

与 [DatePicker.RangePicker](https://antdv.com/components/date-picker-cn/#RangePicker) 相同。

```vue
<ProFormDateRangePicker name="dateRange" label="日期" />
```

### ProFormDateTimeRangePicker

与 [DatePicker.RangePicker](https://antdv.com/components/date-picker-cn/#RangePicker) 相同。

```vue
<ProFormDateTimeRangePicker name="datetimeRange" label="日期时间" />
```

### ProFormTimePicker

与 [TimePicker](https://antdv.com/components/time-picker-cn/) 相同。

```vue
<ProFormTimePicker name="time" label="时间" />
```

### ProFormSelect

与 [Select](https://antdv.com/components/select-cn/) 相同。支持了 `request` 和 `valueEnum` 两种方式来生成 options。

| 参数         | 说明                                              | 类型                         | 默认值 |
| ------------ | ------------------------------------------------- | ---------------------------- | ------ |
| valueEnum    | 当前列值的枚举                                    | `Record`                     | -      |
| request      | 从网络请求枚举数据                                | `()=>Promise<{label,value}>` | -      |
| debounceTime | 防抖动时间，与 `request` 配合使用                 | `number`                     | -      |
| params       | 发起网络请求的参数，与 `request` 配合使用         | `Record`                     | -      |
| fieldProps   | antdv 组件的 props                                | `SelectProps`                | -      |

> 有了 options 为什么要支持 `valueEnum` 呢？`valueEnum` 可以与 ProTable、ProDescriptions 共用，在工程化上有优势。

```vue
<template>
  <ProFormSelect
    name="select"
    label="Select"
    :value-enum="{ open: '未解决', closed: '已解决' }"
    placeholder="Please select a country"
    :rules="[{ required: true, message: 'Please select your country!' }]"
  />

  <ProFormSelect
    name="select2"
    label="Select"
    :request="async () => [
      { label: '全部', value: 'all' },
      { label: '未解决', value: 'open' },
      { label: '已解决', value: 'closed' },
      { label: '解决中', value: 'processing' },
    ]"
    placeholder="Please select a country"
    :rules="[{ required: true, message: 'Please select your country!' }]"
  />
</template>
```

自定义选项：

```vue
<ProFormSelect
  name="select"
  label="Select"
  :options="[
    { label: '全部', value: 'all' },
    { label: '未解决', value: 'open' },
    { label: '已解决', value: 'closed' },
    { label: '解决中', value: 'processing' },
  ]"
  placeholder="Please select a country"
  :rules="[{ required: true, message: 'Please select your country!' }]"
/>
```

### ProFormTreeSelect

与 [TreeSelect](https://antdv.com/components/tree-select-cn/) 相同。支持了 `request` 和 `valueEnum` 两种方式来生成 options。

| 参数         | 说明                                          | 类型                         | 默认值 |
| ------------ | --------------------------------------------- | ---------------------------- | ------ |
| valueEnum    | 当前列值的枚举                                | `Record`                     | -      |
| request      | 从网络请求枚举数据                            | `()=>Promise<{label,value}>` | -      |
| debounceTime | 防抖动时间，与 `request` 配合使用             | `number`                     | -      |
| params       | 发起网络请求的参数，与 `request` 配合使用     | `Record`                     | -      |
| fieldProps   | antdv 组件的 props                            | `TreeSelectProps`            | -      |

```vue
<ProFormTreeSelect
  name="name"
  placeholder="Please select"
  allow-clear
  :width="330"
  secondary
  :request="async () => [
    {
      title: 'Node1',
      value: '0-0',
      children: [{ title: 'Child Node1', value: '0-0-0' }],
    },
    {
      title: 'Node2',
      value: '0-1',
      children: [
        { title: 'Child Node3', value: '0-1-0' },
        { title: 'Child Node4', value: '0-1-1' },
        { title: 'Child Node5', value: '0-1-2' },
      ],
    },
  ]"
  :field-props="{
    suffixIcon: null,
    filterTreeNode: true,
    showSearch: true,
    popupMatchSelectWidth: false,
    labelInValue: true,
    autoClearSearchValue: true,
    multiple: true,
    treeNodeFilterProp: 'title',
    fieldNames: { label: 'title' },
  }"
/>
```

### ProFormCheckbox

与 [Checkbox](https://antdv.com/components/checkbox-cn/) 相同，但支持了 `options` 与 `layout`。

| 参数       | 说明                                                       | 类型                                             | 默认值 |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------ | ------ |
| options    | 与 select 相同，根据 options 生成子节点，推荐使用。        | `string[]` \| `{label:VNodeChild,value:string}[]` | -      |
| layout     | 配置 checkbox 的样式，支持垂直 `vertical` 和 `horizontal`  | `'horizontal' \| 'vertical'`                     | -      |
| request    | 从网络请求枚举数据                                         | `()=>Promise<{label,value}>`                     | -      |
| params     | 发起网络请求的参数，与 `request` 配合使用                  | `Record`                                         | -      |
| fieldProps | antdv 组件的 props                                         | `CheckboxProps`                                  | -      |

```vue
<ProFormCheckbox.Group
  name="checkbox"
  layout="vertical"
  label="行业分布"
  :options="['农业', '制造业', '互联网']"
/>
```

### ProFormRadio.Group

与 [Radio](https://antdv.com/components/radio-cn/) 相同，但支持了 `options`。

| 参数       | 说明                                                | 类型                                              | 默认值    |
| ---------- | --------------------------------------------------- | ------------------------------------------------- | --------- |
| options    | 与 select 相同，根据 options 生成子节点，推荐使用。 | `string[]` \| `{label:VNodeChild,value:string}[]` | -         |
| request    | 从网络请求枚举数据                                  | `()=>Promise<{label,value}>`                      | -         |
| radioType  | 设置是按钮模式还是 radio 模式                       | `'default' \| 'button'`                           | `default` |
| params     | 发起网络请求的参数，与 `request` 配合使用           | `Record`                                          | -         |
| fieldProps | antdv 组件的 props                                  | `RadioProps`                                      | -         |

```vue
<ProFormRadio.Group
  name="radio-group"
  label="Radio.Group"
  :options="[
    { label: 'item 1', value: 'a' },
    { label: 'item 2', value: 'b' },
    { label: 'item 3', value: 'c' },
  ]"
/>
```

### ProFormCascader

与 [Cascader](https://antdv.com/components/cascader-cn/) 相同，通过 `fieldProps` 配置 cascader 的数据。

```vue
<ProFormCascader
  name="area"
  label="区域"
  :field-props="{
    options: [
      {
        value: 'zhejiang',
        label: 'Zhejiang',
        children: [
          {
            value: 'hangzhou',
            label: 'Hangzhou',
            children: [{ value: 'xihu', label: 'West Lake' }],
          },
        ],
      },
    ],
  }"
/>
```

| 参数       | 说明                                                  | 类型                                              | 默认值 |
| ---------- | ----------------------------------------------------- | ------------------------------------------------- | ------ |
| options    | 与 cascader 相同，根据 options 生成子节点，推荐使用。 | `string[]` \| `{label:VNodeChild,value:string}[]` | -      |
| request    | 从网络请求枚举数据                                    | `()=>Promise<{label,value}>`                      | -      |
| params     | 发起网络请求的参数，与 `request` 配合使用             | `Record`                                          | -      |
| fieldProps | antdv 组件的 props                                    | `CascaderProps`                                   | -      |

### ProFormSwitch

与 [Switch](https://antdv.com/components/switch-cn/) 相同，通过 `fieldProps` 配置 switch 的数据。

| 参数       | 说明              | 类型          | 默认值 |
| ---------- | ----------------- | ------------- | ------ |
| fieldProps | antdv 组件的 props | `SwitchProps` | -      |

```vue
<ProFormSwitch name="switch" label="Switch" />
```

### ProFormRate

与 [Rate](https://antdv.com/components/rate-cn/) 相同，通过 `fieldProps` 配置 rate 的数据。

| 参数       | 说明              | 类型        | 默认值 |
| ---------- | ----------------- | ----------- | ------ |
| fieldProps | antdv 组件的 props | `RateProps` | -      |

```vue
<ProFormRate name="rate" label="Rate" />
```

### ProFormSlider

与 [Slider](https://antdv.com/components/slider-cn/) 相同，通过 `fieldProps` 配置 slider 的数据。

| 参数       | 说明              | 类型          | 默认值 |
| ---------- | ----------------- | ------------- | ------ |
| fieldProps | antdv 组件的 props | `SliderProps` | -      |

```vue
<ProFormSlider
  name="slider"
  label="Slider"
  :marks="{ 0: 'A', 20: 'B', 40: 'C', 60: 'D', 80: 'E', 100: 'F' }"
/>
```

### ProFormMoney

ProFormMoney 用于输入金额的输入框，支持根据全局国际化显示货币符号，支持输入负数、自定义货币符号等。

```vue
<template>
  <ProFormMoney label="限制金额最小为 0" name="amount1" locale="en-US" :initial-value="22.22" :min="0" />
  <ProFormMoney label="不限制金额大小" name="amount2" locale="en-GB" :initial-value="22.22" />
  <ProFormMoney label="货币符号跟随全局国际化" name="amount3" :initial-value="22.22" />
  <ProFormMoney label="自定义货币符号" name="amount4" :initial-value="22.22" custom-symbol="💰" />
</template>
```

| 参数                | 说明                                                                                                          | 类型                                                                              | 默认值       |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------ |
| locale              | 单独设置的国际化地区值，根据不同的地区显示不同的货币符号                                                      | `string`                                                                          | `zh-Hans-CN` |
| customSymbol        | 自定义金额符号                                                                                                | `string`                                                                          | -            |
| numberPopoverRender | 自定义 Popover 的值，false 可以关闭                                                                           | `((props: InputNumberProps, defaultText: string) => VNodeChild)` \| `boolean`     | `false`      |
| numberFormatOptions | NumberFormat 的配置，文档可以查看 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) | `NumberFormatOptions`                                                             | -            |
| min                 | 最小值                                                                                                        | `number`                                                                          | -            |
| max                 | 最大值                                                                                                        | `number`                                                                          | -            |

#### 以下为地区编码与货币符号对照表

```json
{
  "ar-EG": "$",
  "zh-CN": "¥",
  "en-US": "$",
  "en-GB": "£",
  "vi-VN": "₫",
  "it-IT": "€",
  "ja-JP": "¥",
  "es-ES": "€",
  "ru-RU": "₽",
  "sr-RS": "RSD",
  "ms-MY": "RM",
  "zh-TW": "NT$",
  "fr-FR": "€",
  "pt-BR": "R$",
  "ko-KR": "₩",
  "id-ID": "RP",
  "de-DE": "€",
  "fa-IR": "تومان",
  "tr-TR": "₺",
  "pl-PL": "zł",
  "hr-HR": "kn"
}
```

### ProFormSegmented

与 [Segmented](https://antdv.com/components/segmented-cn/) 相同。支持了 `request` 和 `valueEnum` 两种方式来生成 options。

| 参数         | 说明                                          | 类型                         | 默认值 |
| ------------ | --------------------------------------------- | ---------------------------- | ------ |
| valueEnum    | 当前列值的枚举                                | `Record`                     | -      |
| request      | 从网络请求枚举数据                            | `()=>Promise<{label,value}>` | -      |
| debounceTime | 防抖动时间，与 `request` 配合使用             | `number`                     | -      |
| params       | 发起网络请求的参数，与 `request` 配合使用     | `Record`                     | -      |
| fieldProps   | antdv 组件的 props                            | `Segmented`                  | -      |

```vue
<template>
  <ProFormSegmented
    name="segmented"
    label="segmented"
    :value-enum="{ open: '未解决', closed: '已解决' }"
    :rules="[{ required: true, message: 'Please select your country!' }]"
  />

  <ProFormSegmented
    name="segmented"
    label="segmented"
    :request="async () => [
      { label: '全部', value: 'all' },
      { label: '未解决', value: 'open' },
      { label: '已解决', value: 'closed' },
      { label: '解决中', value: 'processing' },
    ]"
    :rules="[{ required: true, message: 'Please select your country!' }]"
  />
</template>
```
