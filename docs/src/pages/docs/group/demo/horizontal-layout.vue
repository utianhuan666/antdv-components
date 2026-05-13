<docs lang="zh-CN">
横向布局。
</docs>

<docs lang="en-US">
Horizontal layout.
</docs>

<script setup lang="ts">
import { ProForm, ProFormItem, ProFormList, ProFormText } from '@antdv/components'
import { Card } from 'antdv-next'
import { h } from 'vue'
</script>

<template>
  <div style="padding: 24px">
    <ProForm name="horizontal-layout-demo" layout="horizontal">
      <ProFormList
        name="attributes"
        label="规格"
        :creator-button-props="{
          creatorButtonText: '添加规格项',
        }"
        :min="1"
        :copy-icon-props="false"
        :item-render="
          ({ listDom, action }: any, { index }: any) =>
            h(
              Card,
              {
                variant: 'outlined',
                style: { marginBlockEnd: '8px' },
                title: `规格${index + 1}`,
                extra: action,
                styles: { body: { paddingBlockEnd: 0 } },
              },
              () => listDom,
            )
        "
        :creator-record="{ name: '', items: [{ name: '' }] }"
        :initial-value="[{ name: '颜色', items: [{ name: '红' }, { name: '黄' }] }]"
      >
        <ProFormText :style="{ padding: 0 }" width="md" name="name" label="规格名" />
        <ProFormItem :form-item-props="{ style: { marginBlockEnd: 0 } }" label="规格值">
          <ProFormList
            name="items"
            :creator-button-props="{
              creatorButtonText: '新建',
              icon: false,
              type: 'link',
              style: { width: 'unset' },
            }"
            :min="1"
            :copy-icon-props="false"
            :delete-icon-props="{ tooltipText: '删除' }"
            :item-render="
              ({ listDom, action }: any) =>
                h(
                  'div',
                  {
                    style: {
                      display: 'inline-flex',
                      marginInlineEnd: '25px',
                    },
                  },
                  [listDom, action],
                )
            "
          >
            <ProFormText :allow-clear="false" width="xs" :name="['name']" />
          </ProFormList>
        </ProFormItem>
      </ProFormList>
    </ProForm>
  </div>
</template>
