---
title: Markdown Demo
description: 从 antdv-next 迁移过来的 Markdown 与 Demo 能力验证页。
demo:
  cols: 1
---

# Markdown 与 Demo

这个页面用于验证 `docs/plugins` 迁移后的能力是否已经在当前项目里生效。

:::tip
支持自定义容器、标题锚点、代码高亮，以及 `demo/*.vue` 的源码提取。
:::

> [!NOTE]
> 这个提醒块来自 GitHub Alerts 插件。

## 代码演示 {#examples}

<demo-group>
  <demo src="./demo/basic.vue">基础示例</demo>
  <demo src="./demo/form.vue">Form 测试</demo>
</demo-group>

## API

| 属性       | 说明                                    | 类型      |
| ---------- | --------------------------------------- | --------- |
| `src`      | demo 文件路径，会在编译期改写成绝对路径 | `string`  |
| `simplify` | 精简模式，只渲染示例不显示元信息        | `boolean` |
