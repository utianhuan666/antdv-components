---
title: ProCard 高级卡片
description: 提供可折叠、可组合、可选择和统计场景的业务级卡片组件。
demo:
  cols: 1
---

# ProCard 高级卡片

ProCard 在 Card 的基础上补充了布局组合、折叠、分割线、CheckCard 和 StatisticCard 等 Pro Components 常用能力。

## 代码演示

<demo-group>
  <demo src="./demo/basic.vue">基础卡片</demo>
  <demo src="./demo/check-card.vue">可选择卡片</demo>
  <demo src="./demo/statistic-card.vue">统计卡片</demo>
</demo-group>

## API

### ProCard

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `title` | 卡片标题 | `VueNode` | - |
| `extra` | 右上角自定义区域 | `VueNode` | - |
| `headerBordered` | 页头是否有分割线 | `boolean` | `false` |
| `collapsible` | 是否可折叠，支持仅图标触发 | `boolean \| 'header' \| 'icon'` | `false` |
| `collapsed` | 受控折叠状态 | `boolean` | - |
| `defaultCollapsed` | 默认折叠状态 | `boolean` | `false` |
| `tabs` | 标签页配置 | `ProCardTabsProps` | - |
| `split` | 子卡片分割方式 | `'vertical' \| 'horizontal'` | - |
| `gutter` | 子卡片间距 | `number \| object \| array` | `0` |
| `colSpan` | 子卡片栅格宽度 | `number \| string \| object` | - |

### CheckCard

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `title` | 标题 | `VueNode` | - |
| `description` | 描述 | `VueNode` | - |
| `checked` | 受控选中状态 | `boolean` | - |
| `defaultChecked` | 默认选中状态 | `boolean` | `false` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `loading` | 是否加载中 | `boolean` | `false` |

### CheckCard.Group

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `options` | 选项配置 | `(CheckCardOptionType \| string)[]` | `[]` |
| `multiple` | 是否多选 | `boolean` | `false` |
| `value` | 受控选中值 | `string \| number \| boolean \| array` | - |
| `defaultValue` | 默认选中值 | `string \| number \| boolean \| array` | - |
| `disabled` | 整组禁用 | `boolean` | `false` |

### StatisticCard

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `statistic` | 统计数值配置 | `StatisticProps` | - |
| `chart` | 图表区域 | `VueNode` | - |
| `chartPlacement` | 图表位置 | `'left' \| 'right' \| 'bottom'` | - |
| `footer` | 底部扩展区域 | `VueNode` | - |
