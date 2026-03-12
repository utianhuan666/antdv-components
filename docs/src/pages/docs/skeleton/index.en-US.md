---
title: ProSkeleton
description: Business-level skeleton screen with built-in list, descriptions, and result page layouts.
demo:
  cols: 1
---

# ProSkeleton

Display a placeholder skeleton while content is loading to improve visual stability and user experience.

ProSkeleton provides three pre-built page-level skeletons that match the layouts of ProList, ProDescriptions, and result pages.

## Examples

<demo-group>
  <demo src="./demo/list.vue">List page</demo>
  <demo src="./demo/list-static.vue">List with statistics</demo>
  <demo src="./demo/result.vue">Result page</demo>
  <demo src="./demo/descriptions.vue">Descriptions page</demo>
  <demo src="./demo/active.vue">Animation effect</demo>
</demo-group>

## API

### ProSkeleton

| Prop          | Description                                           | Type                                   | Default  |
| ------------- | ----------------------------------------------------- | -------------------------------------- | -------- |
| `type`        | Skeleton type                                         | `'list' \| 'result' \| 'descriptions'` | `'list'` |
| `active`      | Whether to show animated pulse                        | `boolean`                              | `true`   |
| `pageHeader`  | Pass `false` to hide the page header skeleton         | `false`                                | —        |
| `statistic`   | Statistic column count, `false` to hide (list only)   | `number \| false`                      | —        |
| `toolbar`     | Pass `false` to hide the toolbar skeleton (list only) | `false`                                | —        |
| `list`        | List row count, `false` to hide (list / descriptions) | `number \| false`                      | `5`      |
| `actionButton`| Pass `false` to hide the action button (list only)    | `false`                                | —        |

### Sub-components

| Component                 | Description                         |
| ------------------------- | ----------------------------------- |
| `ListPageSkeleton`        | Full list page skeleton             |
| `ListSkeleton`            | List body skeleton                  |
| `ListSkeletonItem`        | Single list row skeleton            |
| `ListToolbarSkeleton`     | List toolbar skeleton               |
| `PageHeaderSkeleton`      | Page header skeleton                |
| `DescriptionsPageSkeleton`| Full descriptions page skeleton     |
| `DescriptionsSkeleton`    | Descriptions area skeleton          |
| `TableItemSkeleton`       | Table row skeleton                  |
| `TableSkeleton`           | Table skeleton                      |
| `ResultPageSkeleton`      | Full result page skeleton           |
