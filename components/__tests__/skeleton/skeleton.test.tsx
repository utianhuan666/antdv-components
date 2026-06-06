import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  DescriptionsPageSkeleton,
  DescriptionsSkeleton,
  ListPageSkeleton,
  ListSkeleton,
  ListSkeletonItem,
  ListToolbarSkeleton,
  PageHeaderSkeleton,
  ProSkeleton,
  ResultPageSkeleton,
  TableItemSkeleton,
  TableSkeleton,
} from '../../skeleton'
import DescriptionsItemSkeleton from '../../skeleton/components/Descriptions/DescriptionsItemSkeleton.vue'
import DirectTableItemSkeleton from '../../skeleton/components/Descriptions/TableItemSkeleton.vue'
import StatisticSkeleton from '../../skeleton/components/List/StatisticSkeleton.vue'

function skeletonCount(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.ant-skeleton').length
}

function skeletonButtonCount(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.ant-skeleton-button').length
}

function lineSkeletonCount(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.ant-skeleton-title').length
}

describe('skeleton', () => {
  it('🥩 list base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'list' } })

    expect(skeletonCount(wrapper)).toBeGreaterThan(0)
    expect(skeletonButtonCount(wrapper)).toBeGreaterThan(0)
  })

  it('🥩 descriptions base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'descriptions' } })

    expect(skeletonCount(wrapper)).toBeGreaterThan(0)
    expect(skeletonButtonCount(wrapper)).toBeGreaterThan(0)
  })

  it('🥩 result base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'result' } })

    expect(skeletonCount(wrapper)).toBeGreaterThan(0)
    expect(wrapper.find('.ant-skeleton-button').exists()).toBe(true)
  })

  it('🥩 defaults to list type', () => {
    const defaultWrapper = mount(ProSkeleton)
    const listWrapper = mount(ProSkeleton, { props: { type: 'list' } })

    expect(skeletonCount(defaultWrapper)).toBe(skeletonCount(listWrapper))
    expect(skeletonButtonCount(defaultWrapper)).toBe(skeletonButtonCount(listWrapper))
  })

  it('🥩 active controls skeleton animation class', () => {
    const activeWrapper = mount(ProSkeleton, {
      props: {
        pageHeader: false,
        statistic: false,
        toolbar: false,
        list: 1,
      },
    })
    const inactiveWrapper = mount(ProSkeleton, {
      props: {
        active: false,
        pageHeader: false,
        statistic: false,
        toolbar: false,
        list: 1,
      },
    })

    expect(activeWrapper.find('.ant-skeleton-active').exists()).toBe(true)
    expect(inactiveWrapper.find('.ant-skeleton-active').exists()).toBe(false)
  })

  it('🥩 descriptions api use', async () => {
    const wrapper = mount(ProSkeleton, {
      props: { type: 'descriptions', pageHeader: false, list: 10 },
    })
    const initialItems = skeletonCount(wrapper)

    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
    expect(initialItems).toBeGreaterThan(0)

    await wrapper.setProps({ type: 'descriptions', pageHeader: false, list: 5 })

    expect(skeletonCount(wrapper)).toBeLessThan(initialItems)
  })

  it('🥩 descriptions list=false hides table skeleton only', () => {
    const withTable = mount(ProSkeleton, {
      props: { type: 'descriptions', pageHeader: false, list: 2 },
    })
    const withoutTable = mount(ProSkeleton, {
      props: { type: 'descriptions', pageHeader: false, list: false },
    })

    expect(skeletonCount(withoutTable)).toBeLessThan(skeletonCount(withTable))
    expect(skeletonButtonCount(withoutTable)).toBeGreaterThan(0)
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
    const initialCount = skeletonCount(wrapper)

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

    expect(skeletonCount(wrapper)).toBeLessThan(initialCount)
    expect(skeletonCount(wrapper)).toBe(0)
    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
  })

  it('🥩 list module switches hide their own sections', () => {
    const base = mount(ProSkeleton, {
      props: { type: 'list', pageHeader: false, statistic: 2, list: 2 },
    })
    const withoutStatistic = mount(ProSkeleton, {
      props: { type: 'list', pageHeader: false, statistic: false, list: 2 },
    })
    const withoutToolbar = mount(ProSkeleton, {
      props: { type: 'list', pageHeader: false, statistic: 2, toolbar: false, list: 2 },
    })
    const withoutList = mount(ProSkeleton, {
      props: { type: 'list', pageHeader: false, statistic: 2, list: false },
    })

    expect(skeletonCount(withoutStatistic)).toBeLessThan(skeletonCount(base))
    expect(skeletonButtonCount(withoutToolbar)).toBeLessThan(skeletonButtonCount(base))
    expect(skeletonCount(withoutList)).toBeLessThan(skeletonCount(base))
  })

  it('🥩 actionButton=false hides list footer action', () => {
    const withAction = mount(ProSkeleton, {
      props: {
        type: 'list',
        pageHeader: false,
        statistic: false,
        toolbar: false,
        list: 1,
      },
    })
    const withoutAction = mount(ProSkeleton, {
      props: {
        type: 'list',
        pageHeader: false,
        statistic: false,
        actionButton: false,
        toolbar: false,
        list: 1,
      },
    })

    expect(skeletonButtonCount(withoutAction)).toBeLessThan(skeletonButtonCount(withAction))
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

    expect(skeletonCount(wrapper)).toBeGreaterThan(0)
    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
  })

  it('🥩 result pageHeader=false hides page header but keeps result body', () => {
    const withHeader = mount(ProSkeleton, { props: { type: 'result' } })
    const withoutHeader = mount(ProSkeleton, {
      props: { type: 'result', pageHeader: false },
    })

    expect(skeletonButtonCount(withoutHeader)).toBeLessThan(skeletonButtonCount(withHeader))
    expect(withoutHeader.find('.ant-skeleton-avatar').exists()).toBe(true)
  })

  it('🥩 public skeleton exports render directly', () => {
    const cases = [
      mount(ListPageSkeleton, { props: { pageHeader: false, statistic: false, toolbar: false, list: 1 } }),
      mount(ListSkeleton, { props: { size: 1 } }),
      mount(ListSkeletonItem, { props: { active: true } }),
      mount(ListToolbarSkeleton, { props: { active: true } }),
      mount(PageHeaderSkeleton, { props: { active: true } }),
      mount(DescriptionsPageSkeleton, { props: { pageHeader: false, list: 1 } }),
      mount(DescriptionsSkeleton, { props: { active: true } }),
      mount(TableItemSkeleton, { props: { active: true } }),
      mount(TableSkeleton, { props: { active: true, size: 1 } }),
      mount(ResultPageSkeleton, { props: { pageHeader: false } }),
    ]

    for (const wrapper of cases)
      expect(skeletonCount(wrapper) + skeletonButtonCount(wrapper)).toBeGreaterThan(0)
  })

  it('🥩 list statistic skeleton uses default md breakpoint columns', () => {
    const wrapper = mount(StatisticSkeleton, { props: { active: true } })

    expect(skeletonButtonCount(wrapper)).toBe(4)
  })

  it('🥩 descriptions item skeleton uses default md breakpoint columns', () => {
    const wrapper = mount(DescriptionsItemSkeleton, { props: { active: true } })

    expect(lineSkeletonCount(wrapper)).toBe(9)
  })

  it('🥩 descriptions table item skeleton uses default md breakpoint columns plus value column', () => {
    const wrapper = mount(DirectTableItemSkeleton, { props: { active: true } })

    expect(lineSkeletonCount(wrapper)).toBe(4)
  })
})
