---
title: ProSkeleton 骨架屏
description: 业务级骨架屏组件，内置列表页、详情页、结果页三种场景的占位布局。
demo:
  cols: 1
---

# ProSkeleton 骨架屏

在数据加载完成前，使用骨架屏代替实际内容，提升页面的视觉稳定性与用户体验。

ProSkeleton 提供了三种预设的页面级骨架屏，与 ProList、ProDescriptions 的页面布局保持一致。

## 代码演示

<demo-group>
  <demo src="./demo/list.vue">列表页</demo>
  <demo src="./demo/list-static.vue">带统计的列表</demo>
  <demo src="./demo/result.vue">结果页</demo>
  <demo src="./demo/descriptions.vue">详情页</demo>
  <demo src="./demo/active.vue">动画效果</demo>
</demo-group>

## API

### ProSkeleton

| 属性          | 说明                                       | 类型                                   | 默认值   |
| ------------- | ------------------------------------------ | -------------------------------------- | -------- |
| `type`        | 骨架屏类型                                 | `'list' \| 'result' \| 'descriptions'` | `'list'` |
| `active`      | 是否展示动画效果                           | `boolean`                              | `true`   |
| `pageHeader`  | 是否显示页头骨架，传 `false` 隐藏          | `false`                                | —        |
| `statistic`   | 统计数字列数，传 `false` 隐藏（仅 list）   | `number \| false`                      | —        |
| `toolbar`     | 是否显示工具栏骨架，传 `false` 隐藏（仅 list） | `false`                            | —        |
| `list`        | 列表行数，传 `false` 隐藏（list/descriptions） | `number \| false`                  | `5`      |
| `actionButton`| 是否显示底部操作按钮，传 `false` 隐藏（仅 list） | `false`                           | —        |

### 子组件

| 组件名                    | 说明                            |
| ------------------------- | ------------------------------- |
| `ListPageSkeleton`        | 列表页骨架屏（完整）            |
| `ListSkeleton`            | 列表主体骨架屏                  |
| `ListSkeletonItem`        | 列表单行骨架屏                  |
| `ListToolbarSkeleton`     | 列表工具栏骨架屏                |
| `PageHeaderSkeleton`      | 页头骨架屏                      |
| `DescriptionsPageSkeleton`| 详情页骨架屏（完整）            |
| `DescriptionsSkeleton`    | 详情描述区骨架屏                |
| `TableItemSkeleton`       | 表格行骨架屏                    |
| `TableSkeleton`           | 表格骨架屏                      |
| `ResultPageSkeleton`      | 结果页骨架屏（完整）            |
