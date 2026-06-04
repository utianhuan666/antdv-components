---
title: ConfigProvider
description: Provide a uniform configuration support for components.
---

## When To Use

Provide global configuration for components, such as locale, direction, size, theme, or wave effect.

## Usage

This component provides a configuration to all Vue components underneath itself via provide/inject.

```vue
<template>
  <a-config-provider direction="rtl">
    <App />
  </a-config-provider>
</template>
```

### Content Security Policy 
Some components use dynamic style to support wave effect. You can config `csp` prop if Content Security Policy (CSP) is enabled:

```vue
<template>
  <a-config-provider :csp="{ nonce: 'YourNonceCode' }">
    <a-button>My Button</a-button>
  </a-config-provider>
</template>
```

## Examples

## Demos

| Demo | Path |
| --- | --- |
| Locale | demo/locale.md |
| Direction | demo/direction.md |
| Component size | demo/size.md |
| Theme | demo/theme.md |
| Custom Wave | demo/wave.md |
| Static function | demo/holder-render.md |
| useConfig | demo/use-config.md |

## API

Common props ref：[Common props](../../docs/vue/common-props.md)

### Props

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| componentDisabled | Config antd component `disabled` | boolean | - | - |
| componentSize | Config antd component size | `small` \| `middle` \| `large` | - | - |
| csp | Set [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) config | CSPConfig | - | - |
| direction | Set direction of layout. See [demo](#config-provider-demo-direction) | `ltr` \| `rtl` | `ltr` | - |
| getPopupContainer | To set the container of the popup element. The default is to create a `div` element in `body` | `(trigger?: HTMLElement) => HTMLElement \| ShadowRoot` | () => document.body | - |
| getTargetContainer | Config Affix, Anchor scroll target container | `() => HTMLElement \| Window \| ShadowRoot` | () => window | - |
| iconPrefixCls | Set icon prefix className | string | `anticon` | - |
| locale | Language package setting, you can find the packages in [antd/locale](http://unpkg.com/antd/locale/) | Locale | - | - |
| popupMatchSelectWidth | Determine whether the dropdown menu and the select input are the same width. Default set `min-width` same as input. Will ignore when value less than select width. `false` will disable virtual scroll | boolean \| number | - | - |
| popupOverflow | Select like component popup logic. Can set to show in viewport or follow window scroll | `viewport` \| `scroll` | `viewport` | - |
| prefixCls | Set prefix className | string | `ant` | - |
| renderEmpty | Set empty content of components. Ref [Empty](../empty/docs.md/) | (componentName?: string) => VueNode | - | - |
| variant | Set variant of data entry components | `outlined` \| `filled` \| `borderless` \| `underlined` | - | - |
| virtual | Disable virtual scroll when set to `false` | boolean | - | - |
| warning | Config warning level, when `strict` is `false`, it will aggregate deprecated information into a single message | WarningContextProps | - | - |

### Slots

| Slot | Description | Type | Version |
| --- | --- | --- | --- |
| renderEmpty | Set empty content of components. Ref [Empty](../empty/docs.md/) | (componentName?: string) => any | - |

### ConfigProvider.config() 
Setting `Modal`, `Message`, `Notification` static config. Not work on hooks.

```ts
import { App, ConfigProvider } from 'antdv-next'
import { h } from 'vue'

ConfigProvider.config({
  holderRender: children => h(
    ConfigProvider,
    {
      prefixCls: 'ant',
      iconPrefixCls: 'anticon',
      theme: { token: { colorPrimary: 'red' } },
    },
    () => h(App, null, () => children),
  ),
})
```

### useConfig() 
Get the value of the parent `Provider`, such as `DisabledContextProvider`, `SizeContextProvider`.

```ts
import { useConfig } from 'antdv-next/config-provider/context'

const config = useConfig()
const { componentDisabled, componentSize } = config.value
```

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| componentDisabled | antd component disabled state | boolean | - | - |
| componentSize | antd component size state | `small` \| `middle` \| `large` | - | - |

### Component Config

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| affix | Set Affix common props | &#123; class?: string, style?: CSSProperties &#125; | - | - |
| alert | Set Alert common props | &#123; class?: string, style?: CSSProperties, closeIcon?: VueNode, successIcon?: VueNode, infoIcon?: VueNode, warningIcon?: VueNode, errorIcon?: VueNode &#125; | - | - |
| avatar | Set Avatar common props | &#123; class?: string, style?: CSSProperties &#125; | - | - |
| carousel | Set Carousel common props | &#123; class?: string, style?: CSSProperties &#125; | - | - |
| cascader | Set Cascader common props | &#123; class?: string, style?: CSSProperties &#125; | - | - |
| rangePicker | Set RangePicker common props | &#123; class?: string, style?: CSSProperties &#125; | - | - |
| empty | Set Empty common props | &#123; class?: string, style?: CSSProperties, classes?: [EmptyProps["classes"]](../empty/docs.md#api), styles?: [EmptyProps["styles"]](../empty/docs.md#api), image?: VueNode &#125; | - | - |
| flex | Set Flex common props | &#123; class?: string, style?: CSSProperties, vertical?: boolean &#125; | - | - |
| input | Set Input common props | &#123; autoComplete?: string, class?: string, style?: CSSProperties, classes?: [InputConfig["classes"]](../input/docs.md#semantic-input), styles?: [InputConfig["styles"]](../input/docs.md#semantic-input), allowClear?: boolean \| &#123; clearIcon?: VueNode &#125; &#125; | - | - |
| otp | Set OTP common props | &#123; class?: string, style?: CSSProperties, classes?: [OTPConfig["classes"]](../input/docs.md#semantic-otp), styles?: [OTPConfig["styles"]](../input/docs.md#semantic-otp) &#125; | - | - |
| inputSearch | Set Search common props | &#123; class?: string, style?: CSSProperties, classes?: [InputSearchConfig["classes"]](../input/docs.md#semantic-search), styles?: [InputSearchConfig["styles"]](../input/docs.md#semantic-search) &#125; | - | - |
| textArea | Set TextArea common props | &#123; autoComplete?: string, class?: string, style?: CSSProperties, classes?: [TextAreaConfig["classes"]](../input/docs.md#semantic-textarea), styles?: [TextAreaConfig["styles"]](../input/docs.md#semantic-textarea), allowClear?: boolean \| &#123; clearIcon?: VueNode &#125; &#125; | - | - |
| layout | Set Layout common props | &#123; class?: string, style?: CSSProperties &#125; | - | - |
| list | Set List common props | &#123; class?: string, style?: CSSProperties, item?: &#123; classes: [ListItemProps["classes"]](../list/docs.md#listitem), styles: [ListItemProps["styles"]](../list/docs.md#listitem) &#125; &#125; | - | - |
| menu | Set Menu common props | &#123; class?: string, style?: CSSProperties, expandIcon?: VueNode \| (props) => VueNode &#125; | - | - |
| rate | Set Rate common props | &#123; class?: string, style?: CSSProperties &#125; | - | - |
| typography | Set Typography common props | &#123; class?: string, style?: CSSProperties &#125; | - | - |
| wave | Config wave effect | &#123; disabled?: boolean, showEffect?: (node: HTMLElement, info: &#123; className, token, component &#125;) => void &#125; | - | - |

## FAQ

### How to contribute a new language? 
See [Adding new language](../../docs/vue/i18n.md).

### Date-related components locale is not working? 
See FAQ [Date-related-components-locale-is-not-working?](../../docs/vue/faq.md#date-related-components-locale-is-not-working)

### Modal throw error when setting `getPopupContainer`? 
Related issue: <https://github.com/ant-design/ant-design/issues/19974>

When you config `getPopupContainer` to parentNode globally, Modal will throw error of `triggerNode is undefined` because it did not have a triggerNode. You can try the fix below.

```diff
 <ConfigProvider
-  getPopupContainer={triggerNode => triggerNode.parentNode}
+  getPopupContainer={node => {
+    if (node) {
+      return node.parentNode
+    }
+    return document.body
+  }}
 >
   <App />
 </ConfigProvider>
```

### Why can't ConfigProvider props (like `prefixCls` and `theme`) affect VueNode inside `message.info`, `notification.open`, `Modal.confirm`? 
Static methods create independent instances which cannot consume ConfigProvider context. Please prefer the hooks or App-provided instances.

### Locale is not working with Vite in production mode? 
Related issue: [#39045](https://github.com/ant-design/ant-design/issues/39045)

In production mode of Vite, default exports from cjs file should be used like this: `enUS.default`. So you can directly import locale from `es/` directory like `import enUS from 'antdv-next/es/locale/en_US'` to make dev and production have the same behavior.

### `prefixCls` priority(The former is covered by the latter) 
1. ConfigProvider.config with prefixCls = prefix-1
2. ConfigProvider.config with holderRender (wraps ConfigProvider prefix-2)
3. message.config with prefixCls = prefix-3
