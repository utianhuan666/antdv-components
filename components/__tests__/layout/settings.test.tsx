import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SiderMenu } from '../../layout/components/SiderMenu'

describe('settings.test', () => {
  it('set title', async () => {
    const wrapper = mount(SiderMenu, {
      attachTo: document.body,
      props: {
        title: 'test-title',
        matchMenuKeys: [],
      },
    })

    expect(wrapper.text()).toContain('test-title')
    await wrapper.setProps({ title: 'test-title-2' })
    expect(wrapper.text()).toContain('test-title-2')
  })
})
