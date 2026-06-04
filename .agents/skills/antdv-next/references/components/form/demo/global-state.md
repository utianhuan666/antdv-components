# Store Form Data into Upper Component

## Description (en-US)

Store form data in outer reactive state.

## Source

```vue
<script setup lang="ts">
import { reactive } from 'vue'

const model = reactive({
  username: 'Antdv Next',
})
</script>

<template>
  <a-form name="global_state" layout="inline" :model="model">
    <a-form-item
      name="username"
      label="Username"
      :rules="[{ required: true, message: 'Username is required!' }]"
    >
      <a-input v-model:value="model.username" />
    </a-form-item>
  </a-form>
  <a-typography-paragraph style="max-width: 440px; margin-top: 24px">
    <pre style="border: none">{{ JSON.stringify(model, null, 2) }}</pre>
  </a-typography-paragraph>
</template>
```
