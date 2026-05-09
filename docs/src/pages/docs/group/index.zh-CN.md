---
title: ProFormList 数据结构化
description: ProFormList 录入结构化的多维数组数据，ProFormFieldSet 录入结构化的一维数组数据。
---

# 数据结构化

我们还提供了用来进行结构化数据的录入：

- `ProFormList`：录入结构化的多维数组数据。
- `ProFormFieldSet`：录入结构化的一维数组数据。
- `ProFormDependency`：数据依赖的相关组件。

## ProFormList

ProFormList 与 antd `Form.List` API 基本相同，增加了自带的操作按钮：删除和复制，并且自带了一个“新建一行”按钮。

```vue
<ProFormList
  name="users"
  :initial-value="[{ useMode: 'chapter' }]"
  :creator-button-props="{ position: 'top', creatorButtonText: '再建一行' }"
>
  <ProFormSelect
    name="useMode"
    label="合同约定生效方式"
    :options="[
      { value: 'chapter', label: '盖章后生效' },
      { value: 'none', label: '不生效' },
    ]"
  />
</ProFormList>
```

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `itemRender` | 自定义 Item，可以用来将 action 放到别的地方 | `(doms, listMeta) => VNode` | - |
| `creatorRecord` | 新建一行的默认值 | `Record<string, any> \| () => Record<string, any>` | - |
| `creatorButtonProps` | 新建一行按钮的配置 | `buttonProps & { creatorButtonText: string, position: 'top' \| 'bottom' }` | `{ creatorButtonText: '新建一行' }` |
| `label` | 与 Form.Item 相同 | `VNodeChild` | - |
| `name` | list 在 form 中的值，必填项 | `NamePath` | - |
| `alwaysShowItemLabel` | Item 中总是展示 label | `boolean` | - |
| `actionRef` | 当前 List 的自带操作，可以增删改查列表项 | `{ add, remove, move, get }` | - |
| `min` | 最少条目 | `number` | - |
| `max` | 最多条目 | `number` | - |

> 当前 Vue 实现仍在对齐 React `ProFormList` 分层中，页面结构与 API 文档先按官网展示，后续 demo 会在组件完成后补齐。
