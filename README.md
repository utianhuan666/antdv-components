# Antdv Next Secondary Development Project

> A secondary development framework for building your own business component library on top of `antdv-next`.

`docs-base` is a starter repository for teams that want more than a plain component package. It combines component-library packaging, a live documentation site, and a Markdown demo pipeline in one codebase, so you can develop components and publish docs from the same project.

## Before you start

Replace the template package name with your own package name first.

This repository uses `@org/components` as the default placeholder package name. Before secondary development, perform a global search and replace for `@org/components` and change it to your real package name.

## Theme customization

This project is intentionally theme-neutral.

It does not lock you into a built-in business theme. You are expected to define your own brand style, design tokens, color system, component appearance, and other theme effects according to your product requirements.

## Why this project

Use this repository when you want to:

- build a business-oriented component library based on `antdv-next`
- keep source code, demos, and documentation in one place
- ship typed Vue 3 components with ESM and UMD outputs
- write docs in Markdown while rendering real Vue demos inline
- maintain Chinese and English documentation pages in the same structure
- build your own theme system instead of inheriting a fixed visual style

## What is included

- Vue 3 + TypeScript + Vite
- `antdv-next` as the UI foundation
- library builds for module output, bundled ESM, and UMD
- generated type declarations for components
- custom Markdown-to-Vue pipeline for the docs app
- live demo blocks with source extraction and hot updates
- UnoCSS, Vue Router, Pinia, and Vue I18n integration
- no built-in business theme, making custom theming easier
- sample components and docs pages you can extend directly

## Quick start

### Requirements

- Node.js `^20.19.0 || >=22.12.0`
- `pnpm@10`

### Install

```bash
pnpm install
```

### Run the docs app

```bash
pnpm docs:dev
```

The local docs site runs on [http://localhost:6878](http://localhost:6878).

### Build the library

```bash
pnpm build
```

### Other useful commands

```bash
pnpm docs:build
pnpm docs:preview
pnpm type-check
pnpm test:unit
```

## Project structure

```text
.
├─ components/                 # Your business components
│  ├─ button/
│  └─ form/
├─ docs/                       # Documentation app
│  ├─ src/pages/               # Markdown pages and Vue home page
│  ├─ src/components/demo/     # Demo renderer and source viewer
│  └─ plugins/markdown/        # Markdown and demo transformation pipeline
├─ vite.build.config.ts        # Preserve-module component build
├─ vite.esm.config.ts          # Bundled ESM build
├─ vite.umd.config.ts          # UMD build
└─ global.d.ts                 # Global component typings
```

## Development workflow

### 1. Add components

Create your components under [`components/`](./components). Export them from [`components/index.ts`](./components/index.ts), and keep package-level exports aligned with the API you want to publish.

### 2. Write documentation pages

Add Markdown pages under [`docs/src/pages/`](./docs/src/pages). This project auto-registers `.md` pages as routes through `import.meta.glob`.

Recommended locale naming:

- `*.zh-CN.md`
- `*.en-US.md`

The current router uses `zh-CN` as the default locale and appends a suffix for non-default locale routes.

### 3. Add demos next to docs pages

Place demo files in a sibling `demo/` directory, then reference them with:

```md
<demo-group>
  <demo src="./demo/basic.vue">Basic example</demo>
</demo-group>
```

The docs pipeline will:

- render the live Vue demo
- extract component source
- generate highlighted code blocks
- hot-update demo metadata during development

## Build output

Running `pnpm build` produces three kinds of outputs:

- preserved module files in `dist/`
- bundled ESM entry as `dist/index.esm.js`
- bundled UMD entry as `dist/index.umd.js`

This makes the template suitable both for modular consumption and for traditional bundled distribution.

## Tech notes

- The docs app treats Markdown files as Vue components.
- Demo parsing supports custom `<docs>` blocks inside demo SFCs.
- Component usage inside the docs app is wired through the local package entry, so the docs site always reflects the current workspace code.
- Theme style is not predefined at the framework level, so visual tokens and presentation should be implemented by your team.

## Suggested way to use this template

1. Perform a global replacement of `@org/components` and change it to your own package name.
2. Replace the sample components in [`components/`](./components) with your own business components.
3. Rename the package in [`package.json`](./package.json).
4. Update the docs home page and Markdown pages in [`docs/src/pages/`](./docs/src/pages).
5. Adjust build, external dependencies, and global typings as your library evolves.

## Chinese README

Chinese documentation is available in [`README.zh-CN.md`](./README.zh-CN.md).
