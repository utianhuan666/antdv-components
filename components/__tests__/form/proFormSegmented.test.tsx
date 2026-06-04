import { ProForm, ProFormSegmented } from '@antdv/components'
// @ts-nocheck
import { describe, expect, it } from 'vitest'
import { mountAttached } from '../testUtils'

describe('proFormSegmented', () => {
  it('📦 ProFormSegmented supports fieldProps.options', () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormSegmented
            name="segmented"
            fieldProps={{
              options: ['Daily', 'Weekly', 'Monthly'],
            }}
          />
        </ProForm>
      ),
    })

    expect(wrapper.text()).toContain('Daily')
    expect(wrapper.text()).toContain('Weekly')
    expect(wrapper.text()).toContain('Monthly')
  })
})
