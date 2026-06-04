import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ProSkeleton } from '@antdv/components'

describe('skeleton', () => {
  it('🥩 list base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'list' } })

    expect(wrapper.findAll('.ant-skeleton').length).toBeGreaterThan(0)
    expect(wrapper.findAll('.ant-skeleton-button').length).toBeGreaterThan(0)
  })

  it('🥩 descriptions base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'descriptions' } })

    expect(wrapper.findAll('.ant-skeleton').length).toBeGreaterThan(0)
    expect(wrapper.findAll('.ant-skeleton-button').length).toBeGreaterThan(0)
  })

  it('🥩 result base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'result' } })

    expect(wrapper.findAll('.ant-skeleton').length).toBeGreaterThan(0)
    expect(wrapper.find('.ant-skeleton-button').exists()).toBe(true)
  })

  it('🥩 descriptions api use', async () => {
    const wrapper = mount(ProSkeleton, {
      props: { type: 'descriptions', pageHeader: false, list: 10 },
    })
    const initialItems = wrapper.findAll('.ant-skeleton').length

    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
    expect(initialItems).toBeGreaterThan(0)

    await wrapper.setProps({ type: 'descriptions', pageHeader: false, list: 5 })

    expect(wrapper.findAll('.ant-skeleton').length).toBeLessThan(initialItems)
  })

  it('🥩 list api use', async () => {
    const wrapper = mount(ProSkeleton, {
      props: {
        type: 'list',
        pageHeader: false,
        statistic: 3,
        actionButton: false,
        toolbar: false,
        list: 10,
      },
    })
    const initialCount = wrapper.findAll('.ant-skeleton').length

    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
    expect(initialCount).toBeGreaterThan(0)

    await wrapper.setProps({
      type: 'list',
      pageHeader: false,
      statistic: false,
      actionButton: false,
      toolbar: false,
      list: false,
    })

    expect(wrapper.findAll('.ant-skeleton').length).toBeLessThan(initialCount)
    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
  })

  it('🥩 statistic=1,span=16', () => {
    const wrapper = mount(ProSkeleton, {
      props: {
        type: 'list',
        pageHeader: false,
        statistic: 1,
        actionButton: false,
        toolbar: false,
        list: 10,
      },
    })

    expect(wrapper.findAll('.ant-skeleton').length).toBeGreaterThan(0)
    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
  })
})
