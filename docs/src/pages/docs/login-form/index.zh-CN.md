---
title: LoginForm/Page 登录表单
description: LoginForm 和 LoginFormPage 是 ProForm 的登录表单布局变体。
---

# 登录表单

LoginForm 和 LoginFormPage 是 ProForm 的变体，两者是为了适应常见的登录表单布局来专门实现，适用于各类登录场景，降低布局的压力。

## 登录表单

React 官网在这里展示：

- 登录表单
- 页面级别的登录表单

## API

### LoginForm

LoginForm 代表了比较常见的居中布局样式。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `logo` | logo 的配置，支持 VNode 和 string | `VNodeChild \| string` | - |
| `title` | 标题，可以配置为空 | `VNodeChild` | - |
| `subTitle` | 二级标题，可以配置为空 | `VNodeChild` | - |
| `actions` | 自定义额外的登录功能 | `VNodeChild` | - |
| `message` | form 顶部的提示配置，可以配置错误提示信息 | `VNodeChild` | - |

### LoginFormPage

LoginFormPage 使用了左右布局，并且增加了一些广告位的配置。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `logo` | logo 的配置，支持 VNode 和 string | `VNodeChild \| string` | - |
| `title` | 标题，可以配置为空 | `VNodeChild` | - |
| `subTitle` | 二级标题，可以配置为空 | `VNodeChild` | - |
| `actions` | 自定义额外的登录功能 | `VNodeChild` | - |
| `message` | form 顶部的提示配置，可以配置错误提示信息 | `VNodeChild` | - |
| `backgroundImageUrl` | 整个区域的背景图片配置，手机端不会展示 | `string` | - |
| `activityConfig` | 活动区域配置 | `{ title, subTitle, action, style }` | - |

> 当前 Vue 实现仍在对齐 LoginForm / LoginFormPage，页面结构先与官网保持一致。
