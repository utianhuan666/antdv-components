# antdv-next/pro-components

## 项目目标

基于 antdv-next 实现一套 Vue 3 版本的 Pro Components。

参考项目：

* ../@ant-design/pro-components
* ../antdv-next

目标是实现与 Pro Components 在功能、行为和开发体验上高度兼容的 Vue 版本组件库。

重点是：

* 行为兼容
* API 兼容
* 测试兼容

而不是简单翻译 React 源码。

---

## 核心原则

### 测试即规范

测试用例是组件行为的最终定义。

当以下内容发生冲突时：

* 官方文档
* 示例代码
* React 源码
* 测试用例

优先级如下：

1. 测试用例
2. 官方文档
3. 示例代码
4. React 源码

React 源码仅用于理解设计思路，不作为唯一实现依据。

---

### 测试驱动开发

所有组件迁移必须遵循 TDD 流程：

1. 分析组件测试
2. 迁移测试
3. 执行测试
4. 实现功能
5. 修复失败测试
6. 直到全部测试通过

禁止：

* 删除失败测试
* 跳过失败测试
* 修改测试逻辑以适配错误实现
* 降低测试覆盖率

---

### 行为兼容优先

实现方式可以不同。

行为必须一致。

优先保证：

测试通过 > 行为兼容 > 代码风格一致 > 源码结构一致

---

## 组件迁移流程

每个组件都必须遵循以下流程。

### 第一阶段：组件分析

分析：

* 组件职责
* 对外 API
* Props
* Events
* Slots
* 类型定义
* 依赖组件

输出组件能力列表。

---

### 第二阶段：测试分析

分析原项目测试用例：

识别：

* 功能覆盖范围
* Props 行为
* 事件行为
* 默认值
* 边界情况
* 异常情况

建立测试矩阵。

---

### 第三阶段：迁移测试

先迁移测试。

后实现组件。

测试框架：

* Vitest
* Vue Test Utils

保持：

* 测试名称
* 测试语义
* 测试覆盖范围

尽量一致。

---

### 第四阶段：实现组件

根据测试需求实现功能。

原则：

仅实现当前测试需要的能力。

禁止：

* 预留未来功能
* 过度抽象
* 提前优化

---

### 第五阶段：验证兼容性

必须验证：

* 测试全部通过
* TypeScript 类型正常
* 示例正常运行
* API 行为一致

之后才能认为迁移完成。

---

## Vue 实现规范

统一采用：

* Vue 3
* Composition API
* script setup
* TypeScript

优先使用：

* defineProps
* defineEmits
* defineExpose
* provide / inject
* computed
* watch
* watchEffect

---

## React → Vue 映射规范

### Children

React

```tsx
children
```

Vue

```vue
<slot />
```

---

### Context

React

```tsx
Context
```

Vue

```ts
provide
inject
```

---

### useMemo

React

```tsx
useMemo
```

Vue

```ts
computed
```

---

### useEffect

React

```tsx
useEffect
```

Vue

```ts
watch
watchEffect
```

---

### forwardRef

React

```tsx
forwardRef
```

Vue

```ts
defineExpose
```

---

### ReactNode

React

```tsx
ReactNode
```

Vue

```vue
Slot
VNode
```

---

### 工具库映射

React 原版中的工具库在 Vue 版本中按以下优先级迁移：
* `@ant-design/cssinjs` 对应 `@antdv-next/cssinjs`
* `@rc-component/util` 的 Vue 等价能力优先从 `@v-c/util` 选择，例如 `clsx`、`omit`、Vue VNode/slot children 处理等；不能确认等价时必须先补行为测试。
* 通用函数优先使用 `es-toolkit`，例如 `debounce`、`throttle`、`pick`、通用 `omit` 等，避免新增本地 helper。
* React `swr` 语义：Vue 版本优先使用 `swrv`。只有在组件局部需求非常小且测试覆盖完整时，才允许实现轻量本地 cache。

新增或替换工具库时必须补充对应测试，确保行为兼容原版测试语义。

---

## 类型系统要求

所有公开 API 必须提供 TypeScript 类型支持。

要求：

* Props 类型完整
* Emits 类型完整
* Slots 类型完整
* 泛型能力尽可能保持一致

禁止：

* 大量 any
* 无类型导出

---

## 测试要求

### 测试覆盖率不得下降

迁移后：

测试覆盖率不得低于原组件。

---

### 测试数量不得减少

禁止：

* 删除测试
* 合并测试导致覆盖下降

---

### 新增行为必须补充测试

如果：

* 修复 Bug
* 新增兼容逻辑

必须补充对应测试。

---

## API 兼容要求

必须保持：

* Props 名称一致
* Props 默认值一致
* Event 名称一致
* Event 触发时机一致

如因 Vue 特性无法完全一致：

必须：

1. 记录差异
2. 提供兼容方案
3. 更新文档

---

## 性能原则

优先保证：

功能正确

其次：

行为兼容

最后：

性能优化

禁止为了性能优化破坏兼容性。

---

## 代码风格

保持：

* 简洁
* 可维护
* 可测试

避免：

* 过度封装
* 复杂继承
* 不必要抽象

---

## 文档要求

完成组件迁移后：

同步更新：

* README
* 示例代码
* 类型说明
* 差异说明

---

## Pull Request 检查项

提交前必须确认：

* [ ] 测试已迁移
* [ ] 测试全部通过
* [ ] TypeScript 检查通过
* [ ] API 行为兼容
* [ ] 示例运行正常
* [ ] 文档已更新
* [ ] 无新增 lint 错误

---

## 完成标准

一个组件只有满足以下条件才算迁移完成：

* 所有测试通过
* 测试覆盖率达标
* 类型检查通过
* API 行为兼容
* 示例运行正常
* 文档已更新

否则视为未完成。

---

## 可复用迁移提示词

当需要把某个模块从 React Pro Components 迁移为 Vue 同构实现时，可以直接使用以下提示词。将 `{target}`、`{source}`、`{scope}`、`{testDir}` 替换为实际路径。

```md
PLEASE IMPLEMENT THIS MIGRATION:

目标：
把 `{target}` 推倒重写为 `{source}` 的 Vue 3 同构实现。

本次不是“功能够用”的迁移，而是一比一迁移：
* 文件结构尽量与 `{source}` 对齐。
* 每个源文件都要有明确处理结论：同构实现、Vue 适配实现、合并、删除或暂缓。
* 已有 Vue 实现只能作为参考，不能作为保留理由。
* 多余的 Vue 独有文件默认删除或合并，除非它是必要适配层。
* 行为、API、测试兼容优先于代码长得像。

执行要求：
1. 先分析 `{source}` 与 `{target}` 的文件树，输出文件级映射表。
2. 对每个文件说明迁移动作：
   * `create`: Vue 侧缺失，需要新增。
   * `rewrite`: Vue 侧已有，但必须按源文件重新同构。
   * `merge`: Vue 侧文件应合并到入口、types、utils 或内部适配层。
   * `delete`: Vue 侧多余文件，应删除。
   * `keep-adapter`: Vue 特性需要保留的适配层，并说明原因。
3. 先迁移测试，再改实现。测试用例是行为规范。
4. 测试必须覆盖：
   * Props 名称、默认值和透传。
   * Events / emits 触发时机和参数。
   * Slots / render / formItemRender 等渲染扩展。
   * read / edit / update / light 等模式。
   * request / valueEnum / options / fieldProps 等数据来源。
   * 空值、0、false、数组、对象、非法值等边界情况。
5. 完成后必须运行并汇总：
   * `pnpm test:unit {testDir}`
   * `pnpm type-check`
   * `pnpm test:unit`
   * `pnpm build`

并行策略：
如果 `{scope}` 文件较多，请使用主 agent 协调 + 多 subagent 分区并行。

主 agent 负责：
* 根入口文件、公共导出、类型入口和跨区分发。
* shared helpers、context/provide/inject、valueType/request/valueEnum 等公共语义。
* 合并 subagent 输出。
* 解决跨分区冲突。
* 跑最终验证。

subagent 规则：
* 每个 subagent 只负责自己的目录分区。
* subagent 不修改 root files，除非主 agent 明确分配。
* subagent 不修改其他分区文件。
* subagent 必须先迁移对应测试，再重写实现。
* subagent 输出必须包含：
  * 创建/删除/重写文件清单。
  * 对应原版文件映射。
  * 已迁测试清单。
  * 未完成风险点。

输出格式：
1. 文件级迁移计划
2. subagent 分工
3. 测试矩阵
4. 实现结果
5. 验证结果
6. 兼容性差异与风险点

禁止：
* 只实现缺失功能而保留旧结构。
* 因为现有 Vue 文件“能用”就跳过重写。
* 删除、跳过或弱化失败测试。
* 修改测试语义来适配错误实现。
* 未验证就声明迁移完成。
```

迁移完成后，应把本次迁移的实际映射、测试结果和兼容性差异沉淀到文档或 PR 描述中，方便后续升级原版 Pro Components 时追踪。

---

## Agent 工作要求

执行任务时必须：

1. 先分析
2. 再设计
3. 后编码
4. 最后验证

输出结果时优先包含：

* 问题分析
* 迁移方案
* 风险点
* 测试结果
* 兼容性说明

不要直接开始修改代码而跳过分析过程。

始终以“测试通过且行为兼容”为最终目标。
