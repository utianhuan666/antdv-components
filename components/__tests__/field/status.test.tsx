import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ProField } from '@antdv/components'

function textContent(wrapper: ReturnType<typeof mount>) {
  return wrapper.text().replace(/\s/g, '')
}

describe('Field Status', () => {
  const statusList = [
    'Success',
    'Error',
    'Processing',
    'Default',
    'Warning',
    'success',
    'error',
    'processing',
    'default',
    'warning',
  ]

  statusList.forEach((status) => {
    it(`🥩 ${status} render`, () => {
      const wrapper = mount({
        render: () => (
          <ProField
            text="open"
            valueEnum={{
              open: {
                text: '未解决',
                status,
              },
            }}
            mode="read"
          />
        ),
      })

      expect(wrapper.find('.ant-badge-status').exists()).toBe(true)
      expect(textContent(wrapper)).toContain('未解决')
      expect(wrapper.find('.ant-badge-status-dot').classes().join(' ').toLowerCase()).toContain(status.toLowerCase())
    })
  })

  it('🥩 red color render', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text="open"
          valueEnum={{
            open: {
              text: '未解决',
              color: 'red',
            },
          }}
          mode="read"
        />
      ),
    })

    expect(wrapper.find('.ant-badge-status-dot').classes()).toContain('ant-badge-color-red')
    expect(textContent(wrapper)).toContain('未解决')
  })
})
