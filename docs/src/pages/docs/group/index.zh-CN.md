---
title: ProFormList 数据结构化
description: ProFormList 录入结构化的多维数组数据，ProFormFieldSet 录入结构化的一维数组数据。
---

# 数据结构化

我们还提供了用来进行结构化数据的录入:

- ProFormList 录入结构化的多维数组数据。
- ProFormFieldSet 录入结构化的一维数组数据。
- ProFormDependency 数据依赖的相关组件

## ProFormList

ProFormList 与 [Form.List](https://ant.design/components/form-cn/#Form.List) API 基本相同，增加了自带的操作按钮：删除和复制，并且自带了了一个`新建一行`按钮。

```vue
<ProFormList
  name="users"
  :initial-value="[
    {
      useMode: 'chapter',
    },
  ]"
  :creator-button-props="{
    position: 'top',
    creatorButtonText: '再建一行',
  }"
  :creator-record="{
    useMode: 'none',
  }"
>
  <ProFormSelect
    key="useMode"
    :options="[
      {
        value: 'chapter',
        label: '盖章后生效',
      },
      {
        value: 'none',
        label: '不生效',
      },
    ]"
    width="md"
    name="useMode"
    label="合同约定生效方式"
  />
</ProFormList>
```

### ProFormList API

| 参数                | 说明                                                                     | 类型                                                                     | 默认值                           |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------- |
| itemRender          | 自定义 Item，可以用来将 action 放到别的地方                              | `(doms,listMeta)=> VNodeChild`                                           | -                                |
| creatorRecord       | 新建一行的默认值                                                         | `Record<string, any> \| () => Record<string, any>`                       | -                                |
| creatorButtonProps  | 新建一行按钮的配置                                                       | `buttonProps & { creatorButtonText:string,position:"top"\|"bottom" }`    | `{creatorButtonText:"新建一行"}` |
| label               | 与 From.Item 相同                                                        | `VNodeChild`                                                             | -                                |
| name                | list 在 form 中的值，必填项                                              | `NamePath`                                                               | -                                |
| alwaysShowItemLabel | Item 中总是展示 label                                                    | `boolean`                                                                | -                                |
| actionRef           | 当前 List 的自带操作，可以增删改查列表项                                 | `{add,remove,move,get}`                                                  | -                                |
| actionGuard         | FormItem 的拦截器，包含删除和添加的拦截，可以用 actionRef 拿到当前行的值 | `{beforeAddRow:(index)=>boolean,beforeRemoveRow:(index)=>boolean}`       | -                                |
| min                 | 最少条目，删除时如果当前数据条目少于该数则无法删除                       | `number`                                                                 | -                                |
| max                 | 最多条目，新增或复制时如果当前数据条目多于该数则无法新增或复制           | `number`                                                                 | -                                |
| copyIconProps       | 复制按钮的配置，false 可以取消                                           | `{ Icon?: Component; tooltipText?: string; } \| false`                   | -                                |
| deleteIconProps     | 删除按钮的配置，false 可以取消                                           | `{ Icon?: Component; tooltipText?: string; } \| false`                   | -                                |
| actionRender        | 自定义操作按钮                                                           | `(field,action,defaultActionDom,count)=>VNodeChild[]`                    | -                                |
| onAfterAdd          | 新增数据后的钩子                                                         | `(defaultValue: StoreValue, insertIndex: number, count: number) => void` | -                                |
| onAfterRemove       | 删除数据后的钩子                                                         | `(index: number, count: number) => void`                                 | -                                |
| arrowSort           | 是否开启箭头按钮排序                                                     | `boolean`                                                                | -                                |
| upIconProps         | 向上排序按钮的配置，false 可以取消                                       | `{ Icon?: Component; tooltipText?: string; } \| false`                   | -                                |
| downIconProps       | 向下排序按钮的配置，false 可以取消                                       | `{ Icon?: Component; tooltipText?: string; } \| false`                   | -                                |

### actionRef 操作项目实例

```vue
<script setup lang="ts">
import type { FormListActionType } from '@antdv/components'
import { shallowRef } from 'vue'

const actionRef = shallowRef<FormListActionType<{ name: string }>>()
</script>

<template>
  <a-space>
    <a-button
      type="primary"
      @click="
        () => {
          const list = actionRef?.getList()
          actionRef?.add({
            name: `新增${list?.length}`,
          })
        }
      "
    >
      增加一行
    </a-button>
    <a-button
      danger
      @click="
        () => {
          actionRef?.remove(1)
        }
      "
    >
      删除一行
    </a-button>
    <a-button
      @click="
        () => {
          actionRef?.move(1, 0)
        }
      "
    >
      移动到第一行
    </a-button>
    <a-button
      type="dashed"
      @click="
        () => {
          const row = actionRef?.get(1)
          console.log(row)
        }
      "
    >
      获取一行数据
    </a-button>
    <a-button
      type="dashed"
      @click="
        () => {
          const row = actionRef?.getList()
          console.log(row)
        }
      "
    >
      获取所有数据
    </a-button>
  </a-space>
  <ProFormList :action-guard="actionGuard" :action-ref="actionRef">
    <ProFormText key="useMode" name="name" label="姓名" />
  </ProFormList>
</template>
```

### actionGuard 拦截器

actionGuard 可以拦截 list 的操作，现在有 `beforeAddRow` 和 `beforeRemoveRow` 两个事件。

```vue
<script setup lang="ts">
import type { FormListActionType } from '@antdv/components'
import { shallowRef } from 'vue'

const actionRef = shallowRef<FormListActionType<{ name: string }>>()
const actionGuard = {
  beforeAddRow: async (defaultValue, insertIndex, count) => {
    return new Promise((resolve) => {
      console.log(defaultValue?.name, insertIndex, count)
      setTimeout(() => resolve(true), 1000)
    })
  },
  beforeRemoveRow: async (index, count) => {
    const row = actionRef.value?.get(index as number)
    console.log('--->', index, count, row)
    return new Promise((resolve) => {
      if (index === 0) {
        resolve(false)
        return
      }
      setTimeout(() => resolve(true), 1000)
    })
  },
}
</script>

<template>
  <ProFormList :action-guard="actionGuard" :action-ref="actionRef">
    <ProFormText key="useMode" name="name" label="姓名" />
  </ProFormList>
</template>
```

### actionRender 自定义操作按钮

```text
/**
 * @name 自定义操作按钮
 *
 * @example 删除按钮
 * actionRender:(field,action)=><a onClick={()=>action.remove(field.name)}>删除</a>
 * @example 最多只能新增三行
 * actionRender:(f,action,_,count)=><a onClick={() =>
 *   count>2?alert("最多三行！"):action.add({id:"xx"})}>删除
 * </a>
 */
const actionRender = (
  field: FormListFieldData,
  /**
   * 操作能力
   * @example  action.add(data) 新增一行
   * @example  action.remove(index) 删除一行
   * @example  action.move(formIndex,targetIndex) 移动一行
   */
  action: FormListOperation,
  /**
   * 默认的操作dom
   * [复制，删除]
   */
  defaultActionDom: VNodeChild[],
  /**
   * 当前共有几个列表项
   */
  count: number,
) => [] as VNodeChild[]
```

### ProFormList RenderProps 模式

ProFormList 支持传入一个方法来获取到当前行的信息和快捷操作，这对于复杂的联动来说是很方便的。

```vue
<ProFormList>
  <template #default="{ field, index, action, count }">
    <div key="row">
      <ProFormText name="id" />
      <ProFormText name="name" />
    </div>
  </template>
</ProFormList>
```

这四个参数的类型定义如下：

```text
interface RenderActionParams {
  /**
   * @name 当前行的meta信息
   * @example {name: number; key: number}
   */
  meta: FormListFieldData
  /**
   * @name 当前行的行号
   */
  index: number
  /**
   * @name 用于操作行的一些快捷方法
   * @example 给第二行增加数据 action.add?.({},1);
   * @example 删除第二行 action.remove?.(1);
   * @example 从 1 移到 2: action.move?.(2,1);
   * @example 获取当前行的数据: action.getCurrentRowData() -> {id:"xxx",name:'123',age:18}
   * @example 设置当前行的数据: {id:"123",name:'123'} -> action.setCurrentRowData({name:'xxx'}) -> {id:"123",name:'xxx'}
   * @example 清空当前行的数据：{id:"123",name:'123'} -> action.setCurrentRowData({name:undefined}) -> {id:"123"}
   */
  action: FormListOperation & {
    /**
     * @name 获取当前行的数据
     * @example getCurrentRowData -> {id:"xxx",name:'123',age:18}
     */
    getCurrentRowData: () => any
    /**
     * @name 设置当前行的数据
     * @example {id:"123",name:'123'} -> setCurrentRowData({name:'xxx'}) -> {id:"123",name:'123'}
     * @example {id:"123",name:'123'} -> setCurrentRowData({name:undefined}) -> {id:"123"}
     */
    setCurrentRowData: (data: any) => void
  }
  /**
   * @name 总行数
   */
  count: number
}
```

## ProFormFieldSet

ProFormFieldSet 可以将内部的多个 children 的值组合并且存储在 ProForm 中，并且可以通过 `transform` 在提交时转化。下面是一个简单的用法，可以方便的组合多个输入框，并且格式化为想要的数据。

```vue
<ProFormFieldSet
  name="list"
  label="组件列表"
  type="group"
  :transform="(value: any) => ({ startTime: value[0], endTime: value[1] })"
>
  <ProFormText width="md" />
  <ProFormText width="md" />
  <ProFormText width="md" />
</ProFormFieldSet>
```

## ProFormDependency

ProFormDependency 是一个简化版本的 Form.Item，它默认内置了 noStyle 与 shouldUpdate，我们只需要配置 name 来确定我们依赖哪个数据，ProFormDependency 会自动处理 diff 和并且从表单中提取相应的值。

name 参数必须要是一个数组，如果是嵌套的结构可以这样配置 `name={['name', ['name2', 'text']]}`。配置的 name 的值会在 renderProps 中传入。`name={['name', ['name2', 'text']]}` 传入的 values 的值 为 `{ name: string,name2: { text:string } }`。

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

## 代码示例

### 自定义删除和复制的 tooltip

<demo src="./demo/list-tooltip.vue" title="ProForm.List" ></demo>

### 联动的 FormList

<demo src="./demo/base-use.vue" title="ProForm.List" ></demo>

### 可调整的新建按钮位置

<demo src="./demo/list.vue" title="ProForm.List-position" ></demo>

### 表单互相嵌套

<demo src="./demo/nested-list.vue" title="ProForm.List-ProFormList" ></demo>

### 复杂联动

<demo src="./demo/dependency.vue" title="ProForm.List-dependency" ></demo>

### 行为守卫

<demo src="./demo/pro-form-list.vue"></demo>

### 增删条目限制

<demo src="./demo/countLimit.vue" id="countLimit-1"></demo>

### 横向布局

<demo src="./demo/horizontal-layout.vue" id="horizontal-layout-1"></demo>

### 箭头排序

<demo src="./demo/list-arrowsort.vue" ></demo>
