import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { DefaultFooter } from '../../layout/components/Footer'
import { ProConfigProvider } from '../../provider'

function withProvider(node: any) {
  return <ProConfigProvider>{node}</ProConfigProvider>
}

describe('defaultFooter test', () => {
  it('🦶 set title', () => {
    const wrapper = mount({
      render: () => withProvider(<DefaultFooter links={false} />),
    })

    expect(wrapper.find('.ant-pro-global-footer-list').exists()).toBe(false)
  })

  it('🦶 copyright support false', () => {
    const wrapper = mount({
      render: () => withProvider(<DefaultFooter copyright={false} />),
    })

    expect(wrapper.find('.ant-pro-global-footer-copyright').exists()).toBe(false)
    expect(wrapper.find('.anticon-copyright').exists()).toBe(false)
    expect(wrapper.find('[data-testid="pro-layout-footer"]').exists()).toBe(true)
  })

  it('🦶 links support false', () => {
    const wrapper = mount({
      render: () => withProvider(<DefaultFooter links={false} />),
    })

    expect(wrapper.find('.ant-pro-global-footer-list').exists()).toBe(false)
    expect(wrapper.find('[data-testid="pro-layout-footer"]').exists()).toBe(true)
  })

  it('🦶 if copyright and links falsy both, should not to render nothing', () => {
    const wrapper = mount({
      render: () => withProvider(<DefaultFooter copyright={false} links={false} />),
    })

    expect(wrapper.find('.ant-pro-global-footer').exists()).toBe(false)
  })
})
