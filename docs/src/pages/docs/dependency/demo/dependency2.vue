<docs lang="zh-CN">
获取表单依赖值。对标 React `demos/form/Dependency/dependency2.tsx`：
演示 ProFormDependency 在不同嵌套层级中的依赖取值顺序（全局 / 局部 / ignoreFormListField）。
</docs>

<docs lang="en-US">
Collect dependency values. Mirrors React `dependency2.tsx`: demonstrates
dependency lookup ordering in different nesting scenarios (global / local /
`ignoreFormListField`).
</docs>

<script setup lang="ts">
import type { NamePath } from '@antdv/components'
import {
  ProForm,
  ProFormDependency,
  ProFormGroup,
  ProFormList,
  ProFormText,
} from '@antdv/components'
import { FormItem } from 'antdv-next'

const initialValues = {
  a: 1,
  b: 2,
  c: {
    a: 3,
    b: 4,
    c: {
      a: 5,
    },
    d: [{ a: 6, b: 7 }],
    e: [{ a: 8, b: 9 }],
  },
}

const depName1: NamePath[] = [
  'a',
  'b',
  ['c', 'a'],
  ['c', 'b'],
  ['c', 'c', 'a'],
  ['c', 'd'],
  ['c', 'e'],
]
const depName2: NamePath[] = ['a', 'b', ['c', 'a']]
const depName3: NamePath[] = ['a', 'b', ['c', 'a']]
</script>

<template>
  <div style="padding: 24px">
    <ProForm name="dependency2-demo" :initial-values="initialValues">
      <ProFormGroup>
        <ProFormText name="a" label="a" />
        <ProFormText name="b" label="b" />
        <ProFormText :name="['c', 'a']" label="c.a" />
        <ProFormText :name="['c', 'b']" label="c.b" />
        <ProFormText :name="['c', 'c', 'a']" label="c.c.a" />
        <ProFormGroup title="c.d">
          <ProFormList :name="['c', 'd']">
            <ProFormGroup key="group">
              <ProFormText name="a" label="a" />
              <ProFormText name="b" label="b" />
              <ProFormDependency :name="depName3">
                <template #default="depValues">
                  <FormItem
                    :label="`搜集依赖值（情形3） <ProFormDependency name={${JSON.stringify(depName3)}}>`"
                    extra="a, b, c.a取自局部"
                  >
                    <pre><code>{{ JSON.stringify(depValues, null, 2) }}</code></pre>
                  </FormItem>
                </template>
              </ProFormDependency>
            </ProFormGroup>
          </ProFormList>
        </ProFormGroup>
        <ProFormGroup title="c.e">
          <ProFormList :name="['c', 'e']">
            <ProFormGroup key="group">
              <ProFormText name="a" label="a" />
              <ProFormText name="b" label="b" />
              <ProFormDependency :name="depName2" ignore-form-list-field>
                <template #default="depValues">
                  <FormItem
                    :label="`搜集依赖值（情形2) <ProFormDependency name={${JSON.stringify(depName2)}} ignoreFormListField>`"
                    extra="a, b, c.a取自全局"
                  >
                    <pre><code>{{ JSON.stringify(depValues) }}</code></pre>
                  </FormItem>
                </template>
              </ProFormDependency>
            </ProFormGroup>
          </ProFormList>
        </ProFormGroup>
      </ProFormGroup>
      <ProFormGroup
        :title="`收集依赖值（情形1) <ProFormDependency name={${JSON.stringify(depName1)}}>`"
      >
        <ProFormDependency :name="depName1">
          <template #default="depValues">
            <pre><code>{{ JSON.stringify(depValues) }}</code></pre>
          </template>
        </ProFormDependency>
      </ProFormGroup>
    </ProForm>
  </div>
</template>
