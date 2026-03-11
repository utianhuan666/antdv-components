# antdv-components — Copilot Instructions

## 项目概述

基于 **antdv-next**（Ant Design Vue 3）封装的 Vue 3 业务组件库框架，包含：

- `components/` — 可发布的业务组件源码
- `docs/` — 集成文档站（自定义 Markdown → Vue 转换管道）

## 常用命令

| 命令              | 说明                                        |
| ----------------- | ------------------------------------------- |
| `pnpm docs:dev`   | 启动文档开发服务器                          |
| `pnpm docs:build` | 构建文档站                                  |
| `pnpm test:unit`  | 运行 Vitest 单元测试                        |
| `pnpm type-check` | 运行 vue-tsc 类型检查                       |
| `pnpm build`      | 顺序执行 build:comp → build:esm → build:umd |
| `pnpm build:comp` | 构建 preserveModules ESM（独立组件文件）    |
| `pnpm build:esm`  | 构建打包 ESM（index.esm.js）                |
| `pnpm build:umd`  | 构建 UMD（index.umd.js）                    |

运行环境要求：Node `^20.19.0 || >=22.12.0`，包管理器 `pnpm@10.25.0`。

## 技术栈

- **Vue 3** + TypeScript（Composition API + `<script setup>`）
- **antdv-next** — UI 基础组件
- **UnoCSS** — 原子化 CSS（presetWind3 + presetAntd）
- **Vite** — 构建工具
- **Pinia** — 状态管理
- **Vue Router** — 路由
- **VueUse** — 组合式工具函数
- **Vitest** + Vue Test Utils — 单元测试
- **ESLint** — `@antfu/eslint-config`

## 组件开发规范

### 目录结构（每个组件一个文件夹）

```
components/
└── button/
    ├── button.vue     # 组件实现（.vue SFC 或 .tsx）
    └── index.ts       # 导出 + install 方法注册
```

### 导出模板（index.ts）

```ts
import type { App } from 'vue'
import Button from './button.vue'

Button.install = (app: App) => {
  app.component(Button.name!, Button)
}

export { Button }
```

### 组件实现要点

- **优先使用 Vue SFC**（`.vue`），复杂泛型/JSX 场景用 `.tsx`
- SFC 使用 `<script setup lang="ts">`，禁止 Options API
- Props 类型从 antdv-next 导入并扩展（如 `ButtonProps`）
- Slots 使用 `SlotsType<T>` 声明类型
- TSX 组件使用 `defineComponent()` + 显式 slots 类型
- `jsxImportSource` 配置为 `vue`，TSX 中无需手动导入 h

### 全局入口（components/index.ts）

新增组件后必须在此注册，格式参考现有条目：

```ts
import { Button } from './button'

export { Button }
// 同时在 install 函数中调用 app.use(Button)
```

## 代码风格

遵循 `@antfu/eslint-config`：

- 使用单引号，无分号
- 箭头函数隐式返回
- 导入顺序自动排序
- `vue/valid-v-slot` 已禁用（灵活 slot 支持）
- `ts/no-empty-object-type` 已禁用

## TypeScript 注意事项

- `tsconfig.app.json` 开启了 `noUncheckedIndexedAccess`，数组/对象访问需处理 undefined
- `jsx` 设为 `preserve`，`jsxImportSource` 为 `vue`
- 多 tsconfig 引用模式：app / node / vitest 三个子配置

## 文档站（docs/）

- 自定义 Markdown 插件位于 `docs/plugins/markdown/`，支持从 `.md` 提取 demo 代码块并转换为 Vue 组件
- TypeScript demo 会通过 `demo/tsToJs.ts` 自动转为 JavaScript
- 文档路由由 `docs/src/router/` 自动生成
- 支持中英双语（`locales/en-US`、`locales/zh-CN`）

## 常见陷阱

- 不要混用 `antdv-next` 和 `ant-design-vue`，项目仅依赖前者
- UnoCSS 样式不会自动摇树，文档 demo 中使用 UnoCSS 类时需确保 `uno.config.ts` 中包含对应的 preset
- 构建顺序不可变：`build:comp` 必须先于 `build:esm` / `build:umd`，否则类型声明缺失
