# Antdv Next 二次开发项目

> 一个基于 `antdv-next` 的二次开发框架，用于快速搭建你自己的业务组件库。

`docs-base` 不只是一个普通的组件模板仓库。它把组件库打包、文档站点、Markdown Demo 展示能力放在同一个项目里，适合团队基于 `antdv-next` 做业务组件沉淀、文档维护和对外发布。

## 开始前先做这一步

先把模板里的组织包名替换成你自己的包名。

当前仓库默认使用 `@antdv/components` 作为占位包名。开始二次开发前，建议先全局搜索并替换 `@antdv/components`，统一改成你自己的真实包名，再继续后续开发。

## 主题定制

这个项目本身是一套无预设主题的基础框架。

它不会强行绑定某套业务视觉风格。你需要根据自己的产品和品牌规范，自定义颜色体系、设计 Token、组件外观以及各种主题效果。

## 这个项目适合做什么

当你希望：

- 基于 `antdv-next` 扩展自己的业务组件库
- 将组件源码、示例和文档统一维护
- 输出带类型声明的 Vue 3 组件包
- 用 Markdown 写文档，同时直接嵌入真实 Vue Demo
- 同时维护中英文文档页面
- 构建自己的主题体系，而不是继承一套固定视觉方案

那么可以直接基于这个仓库继续开发。

## 当前内置能力

- Vue 3 + TypeScript + Vite
- 以 `antdv-next` 作为基础 UI 组件依赖
- 支持模块化构建、Bundled ESM、UMD 三种产物
- 自动生成组件类型声明
- 自定义 Markdown 转 Vue 文档渲染链路
- Demo 代码展示、源码提取与热更新
- 集成 UnoCSS、Vue Router、Pinia、Vue I18n
- 不内置业务主题，方便按你的品牌体系进行定制
- 已包含可直接扩展的示例组件和文档页面

## 快速开始

### 环境要求

- Node.js `^20.19.0 || >=22.12.0`
- `pnpm@10`

### 安装依赖

```bash
pnpm install
```

### 启动文档站

```bash
pnpm docs:dev
```

本地开发地址为 [http://localhost:6878](http://localhost:6878)。

### 构建组件库

```bash
pnpm build
```

### 其他常用命令

```bash
pnpm docs:build
pnpm docs:preview
pnpm type-check
pnpm test:unit
```

## 目录结构

```text
.
├─ components/                 # 业务组件源码目录
│  ├─ button/
│  └─ form/
├─ docs/                       # 文档站应用
│  ├─ src/pages/               # Markdown 页面与首页
│  ├─ src/components/demo/     # Demo 渲染与源码展示
│  └─ plugins/markdown/        # Markdown / Demo 转换插件
├─ vite.build.config.ts        # 保留模块结构的组件构建
├─ vite.esm.config.ts          # ESM 打包构建
├─ vite.umd.config.ts          # UMD 打包构建
└─ global.d.ts                 # 全局组件类型声明
```

## 开发方式

### 1. 开发你的业务组件

在 [`components/`](./components) 下新增或改造组件，并在 [`components/index.ts`](./components/index.ts) 中统一导出，保持对外 API 清晰稳定。

### 2. 编写文档页面

在 [`docs/src/pages/`](./docs/src/pages) 下新增 Markdown 文档。当前项目通过 `import.meta.glob` 自动把 `.md` 页面注册成路由。

推荐沿用以下多语言命名方式：

- `*.zh-CN.md`
- `*.en-US.md`

当前路由默认语言是 `zh-CN`，非默认语言会自动附加后缀路由。

### 3. 为文档补充 Demo

在文档页面同级的 `demo/` 目录中放置示例文件，然后在 Markdown 中这样引用：

```md
<demo-group>
  <demo src="./demo/basic.vue">基础示例</demo>
</demo-group>
```

这样文档系统会自动完成：

- 渲染实时 Vue 示例
- 提取源码内容
- 生成高亮代码块
- 开发时热更新 Demo 元数据

## 构建产物说明

执行 `pnpm build` 后，会输出三类产物：

- `dist/` 下保留模块结构的组件文件
- `dist/index.esm.js` ESM 入口包
- `dist/index.umd.js` UMD 入口包

这让它既适合按模块引入，也适合整体打包发布。

## 项目实现特点

- 文档站会把 Markdown 页面直接当作 Vue 组件处理。
- Demo SFC 支持通过自定义 `<docs>` 区块声明说明文案。
- 文档站通过本地包入口直接加载当前工作区组件，所以文档展示内容与组件源码始终同步。
- 框架层不预设最终主题风格，主题变量和视觉表现需要由你的团队自行实现。

## 建议你基于这个模板做的第一步

1. 先全局替换 `@antdv/components`，改成你自己的包名。
2. 用自己的业务组件替换 [`components/`](./components) 下的示例内容。
3. 修改 [`package.json`](./package.json) 中的包名与发布信息。
4. 更新 [`docs/src/pages/`](./docs/src/pages) 下的首页和文档页面。
5. 根据你的库形态调整构建外部依赖、导出入口和类型声明。

## English README

默认英文说明见 [`README.md`](./README.md)。
