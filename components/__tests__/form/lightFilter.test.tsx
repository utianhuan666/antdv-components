// @ts-nocheck
import { describe, expect, it } from 'vitest'
import { LightFilter, ProFormText } from '@antdv/components'
import { mountAttached } from '../testUtils'

describe('LightFilter', () => {
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
})
