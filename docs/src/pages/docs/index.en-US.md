---
title: Markdown Demo
description: Verification page for the migrated markdown and demo pipeline.
demo:
  cols: 1
---

# Markdown And Demo

This page validates that the migrated `docs/plugins` pipeline works in the current project.

:::tip
It covers custom containers, anchors, Shiki code highlighting, and `demo/*.vue` source extraction.
:::

> [!NOTE]
> This alert block is rendered by the GitHub Alerts plugin.

## Examples {#examples}

<demo-group>
  <demo src="./demo/basic.vue">Basic example</demo>
  <demo src="./demo/form.vue">test form</demo>
</demo-group>

## API

| Prop       | Description                                                         | Type      |
| ---------- | ------------------------------------------------------------------- | --------- |
| `src`      | Demo file path rewritten to an absolute source path at compile time | `string`  |
| `simplify` | Renders only the demo preview without meta content                  | `boolean` |
