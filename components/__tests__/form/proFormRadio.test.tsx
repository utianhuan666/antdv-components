import { ProForm, ProFormRadio } from '@antdv/components'
// @ts-nocheck
import { describe, expect, it } from 'vitest'
import { mountAttached } from '../testUtils'

describe('proFormRadio', () => {
  it('📦 ProFormRadio should render correctly', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormRadio name="test">Test Radio</ProFormRadio>
        </ProForm>
      ),
    })

    expect(wrapper.find('.ant-radio').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Radio')
  })

  it('📦 ProFormRadio.Group should render with options', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormRadio.Group
            name="radio"
            options={[
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ]}
          />
        </ProForm>
      ),
    })

    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('B')
  })

  it('📦 ProFormRadio.Group should support valueEnum', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormRadio.Group
            name="radio"
            valueEnum={{
              open: '打开',
              closed: '关闭',
            }}
          />
        </ProForm>
      ),
    })

    expect(wrapper.text()).toContain('打开')
    expect(wrapper.text()).toContain('关闭')
  })
})
