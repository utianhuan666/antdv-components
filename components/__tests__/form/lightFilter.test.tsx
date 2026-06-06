// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { LightFilter, LightFilterInput, ProFormText } from '@antdv/components'
import { ConfigProvider } from 'antdv-next'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mountAttached, waitFor } from '../testUtils'

describe('lightFilter', () => {
  it(' 🪕 should render basic structure', () => {
    const wrapper = mountAttached({
      render: () => (
        <LightFilter>
          <ProFormText label="名称" name="name" />
        </LightFilter>
      ),
    })

    expect(wrapper.find('.ant-pro-form-light-filter').exists()).toBe(true)
    expect(wrapper.text()).toContain('名称')
  })

  it(' 🪕 should default to borderless variant', () => {
    const wrapper = mountAttached({
      render: () => (
        <LightFilter>
          <ProFormText label="名称" name="name" />
        </LightFilter>
      ),
    })

    expect(wrapper.find('.ant-pro-core-field-label').classes().join(' ')).toContain('borderless')
  })

  it(' 🪕 should support outlined variant', () => {
    const wrapper = mountAttached({
      render: () => (
        <LightFilter variant="outlined">
          <ProFormText label="名称" name="name" />
        </LightFilter>
      ),
    })

    expect(wrapper.find('.ant-pro-core-field-label').classes().join(' ')).toContain('outlined')
  })

  it(' ✔️ clear input values', async () => {
    const wrapper = mountAttached({
      render: () => (
        <LightFilter>
          <LightFilterInput
            name="name1"
            label="名称"
            fieldProps={{ role: 'name_input' }}
          />
        </LightFilter>
      ),
    })

    await wrapper.find('.ant-pro-core-field-label').trigger('click')

    await waitFor(() => {
      expect(document.body.querySelector('[role="name_input"]')).not.toBeNull()
    })

    const input = document.body.querySelector<HTMLInputElement>('[role="name_input"]')!
    input.value = 'qixian'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await nextTick()

    document.body.querySelector<HTMLButtonElement>('.ant-popover .ant-btn-primary')?.click()

    await waitFor(() => {
      expect(document.body.querySelector('[title="qixian"]')).not.toBeNull()
    })

    await wrapper.find('.ant-pro-core-field-label').trigger('click')

    await waitFor(() => {
      expect(document.body.textContent).toContain('清除')
    })

    Array
      .from(document.body.querySelectorAll<HTMLButtonElement>('.ant-popover button'))
      .find(button => button.textContent?.includes('清除'))
      ?.click()
    document.body.querySelector<HTMLButtonElement>('.ant-popover .ant-btn-primary')?.click()

    await waitFor(() => {
      expect(wrapper.text()).toContain('名称')
      expect(document.body.querySelector('[title="qixian"]')).toBeNull()
    })
  })

  it('uses getPrefixCls("pro-form") for light filter classes from antd config', () => {
    const wrapper = mountAttached({
      render: () => (
        <ConfigProvider prefixCls="acme">
          <LightFilter>
            <ProFormText label="名称" name="name" />
          </LightFilter>
        </ConfigProvider>
      ),
    })

    expect(wrapper.find('.acme-pro-form-light-filter').exists()).toBe(true)
    expect(wrapper.find('.acme-pro-core-field-label').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-form-light-filter').exists()).toBe(false)
  })
})
