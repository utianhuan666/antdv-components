---
title: ProFormDependency 数据联动
description: ProFormDependency 用于处理 Form 中的数据依赖和联动。
---

# 数据联动

Form 中的数据联动非常常见，所以我们封装了一个组件来进行数据处理。

## ProFormDependency

ProFormDependency 是一个简化版本的 Form.Item，它默认内置了 noStyle 与 shouldUpdate，我们只需要配置 name 来确定我们依赖哪个数据，ProFormDependency 会自动处理 diff 和并且从表单中提取相应的值。

name 参数必须要是一个数组，如果是嵌套的结构可以这样配置 `:name="['name', ['name2', 'text']]"`。配置的 name 的值会在默认插槽中以 `values` 形式传入。`:name="['name', ['name2', 'text']]"` 传入的 values 的值 为 `{ name: string, name2: { text: string } }`。

```vue
<ProFormDependency :name="['name']">
  <template #default="{ name }">
    <ProFormSelect
      :options="[
        {
          value: 'chapter',
          label: '盖章后生效',
        },
      ]"
      width="md"
      name="useMode"
      :label="`与《${name}》合同约定生效方式`"
    />
  </template>
</ProFormDependency>
```

## API

| 参数                | 说明                                                                             | 类型                                                      | 默认值  |
| ------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- | ------- |
| name                | 依赖的字段路径列表，支持嵌套路径数组                                             | `NamePath[]`                                              | -       |
| originDependencies  | 渲染出参 values 的落点路径，默认与 `name` 一致                                   | `NamePath[]`                                              | `name`  |
| ignoreFormListField | 在 ProFormList 内是否忽略行前缀，强制从表单根 model 取值                         | `boolean`                                                 | `false` |
| #default            | 默认插槽，参数为 `(values, form)`：`values` 为依赖值对象，`form` 为 ProForm 实例 | `(values: Record<string, any>, form?: any) => VNodeChild` | -       |

## 代码示例

### 互相依赖表单

<demo src="./demo/dependency.vue" title="ProFormDependency-dependency"></demo>

### 获取表单依赖值

下面例子演示了不同情形下的依赖取值顺序：

- `<ProFormDependency>` **不在** `<ProFormList>` 中：根据 `name` 声明的依赖项，从全局取值（情形 1）
- `<ProFormDependency>` **在** `<ProFormList>` 中
  - `<ProFormDependency>` 的 `ignoreFormListField` 为 `true`：根据 `name` 声明的依赖项，从全局取值（情形 2）
  - `<ProFormDependency>` 的 `ignoreFormListField` 为 `false`：根据 `name` 声明的依赖项，从局部取值（情形 3）

<demo src="./demo/dependency2.vue" title="ProFormDependency-dependency2"></demo>
