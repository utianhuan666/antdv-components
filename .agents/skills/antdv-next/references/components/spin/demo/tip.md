# Customized description

## Description (en-US)

Customize the description text.

## Source

```vue
<template>
  <a-flex gap="middle" vertical>
    <a-flex gap="middle">
      <a-spin tip="Loading" size="small">
        <div style="padding: 50px;background: rgba(0, 0, 0, 0.05);border-radius: 4px;" />
      </a-spin>
      <a-spin tip="Loading">
        <div style="padding: 50px;background: rgba(0, 0, 0, 0.05);border-radius: 4px;" />
      </a-spin>
      <a-spin tip="Loading" size="large">
        <div style="padding: 50px;background: rgba(0, 0, 0, 0.05);border-radius: 4px;" />
      </a-spin>
    </a-flex>
    <a-spin tip="Loading...">
      <a-alert
        message="Alert message title"
        description="Further details about the context of this alert."
        type="info"
      />
    </a-spin>
  </a-flex>
</template>
```
