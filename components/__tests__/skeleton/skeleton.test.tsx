import type { Ref } from 'vue'
import type { DescriptionsPageSkeletonProps } from '../../skeleton/components/Descriptions'
import type { ListPageSkeletonProps } from '../../skeleton/components/List'
import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import * as SkeletonExports from '../../skeleton'
import {
  DescriptionsSkeleton,
  ListPageSkeleton,
  ListSkeleton,
  ListSkeletonItem,
  ListToolbarSkeleton,
  PageHeaderSkeleton,
  ProSkeleton,
  TableItemSkeleton,
  TableSkeleton,
} from '../../skeleton'
import DescriptionsPageSkeleton from '../../skeleton/components/Descriptions'
import * as DescriptionsExports from '../../skeleton/components/Descriptions'
import {
  Line,

  MediaQueryKeyEnum,
} from '../../skeleton/components/List'
import * as ListExports from '../../skeleton/components/List'
import ResultPageSkeleton from '../../skeleton/components/Result'

const breakpointState = vi.hoisted(() => ({
  screens: { value: {} } as Ref<Record<string, boolean>>,
}))

vi.mock('antdv-next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antdv-next')>()

  return {
    ...actual,
    useBreakpoint: () => breakpointState.screens,
  }
})

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
  it('🥩 root exports mirror React skeleton exports', () => {
    expect(Object.keys(SkeletonExports).sort()).toEqual([
      'DescriptionsSkeleton',
      'ListPageSkeleton',
      'ListSkeleton',
      'ListSkeletonItem',
      'ListToolbarSkeleton',
      'PageHeaderSkeleton',
      'ProSkeleton',
      'TableItemSkeleton',
      'TableSkeleton',
      'default',
    ].sort())
  })

  it('🥩 submodule exports mirror React skeleton exports', () => {
    expect(Object.keys(ListExports).sort()).toEqual([
      'Line',
      'ListSkeleton',
      'ListSkeletonItem',
      'ListToolbarSkeleton',
      'MediaQueryKeyEnum',
      'PageHeaderSkeleton',
      'default',
    ].sort())
    expect(Object.keys(DescriptionsExports).sort()).toEqual([
      'DescriptionsSkeleton',
      'TableItemSkeleton',
      'TableSkeleton',
      'default',
    ].sort())
    expect(MediaQueryKeyEnum).toEqual({
      xs: 2,
      sm: 2,
      md: 4,
      lg: 4,
      xl: 6,
      xxl: 6,
    })
  })

  it('🥩 submodule prop types mirror React skeleton types', () => {
    expectTypeOf<ListPageSkeletonProps>().toEqualTypeOf<{
      active?: boolean
      pageHeader?: false
      statistic?: number | false
      actionButton?: false
      toolbar?: false
      list?: number | false
    }>()
    expectTypeOf<DescriptionsPageSkeletonProps>().toEqualTypeOf<{
      active?: boolean
      pageHeader?: false
      list?: false | number
    }>()
  })

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
      mount(DescriptionsSkeleton, { props: { active: true } }),
      mount(TableItemSkeleton, { props: { active: true } }),
      mount(TableSkeleton, { props: { active: true, size: 1 } }),
    ]

    for (const wrapper of cases)
      expect(skeletonCount(wrapper) + skeletonButtonCount(wrapper)).toBeGreaterThan(0)
  })

  it('🥩 submodule default page skeletons render directly', () => {
    const cases = [
      mount(DescriptionsPageSkeleton, { props: { pageHeader: false, list: 1 } }),
      mount(ResultPageSkeleton, { props: { pageHeader: false } }),
    ]

    for (const wrapper of cases)
      expect(skeletonCount(wrapper) + skeletonButtonCount(wrapper)).toBeGreaterThan(0)
  })

  it('🥩 line padding mirrors React falsy fallback', () => {
    const defaultWrapper = mount(Line)
    const emptyWrapper = mount(Line, { props: { padding: '' } })
    const zeroWrapper = mount(Line, { props: { padding: 0 } })
    const customWrapper = mount(Line, { props: { padding: '0px 0px' } })

    expect(defaultWrapper.element.style.padding).toBe('0px 24px')
    expect(emptyWrapper.element.style.padding).toBe('0px 24px')
    expect(zeroWrapper.element.style.padding).toBe('0px 24px')
    expect(customWrapper.element.style.padding).toBe('0px')
  })

  it('🥩 list statistic skeleton uses default md breakpoint columns', () => {
    breakpointState.screens.value = {}
    const wrapper = mount(ListPageSkeleton, {
      props: { pageHeader: false, toolbar: false, list: false },
    })

    expect(skeletonButtonCount(wrapper)).toBe(4)
  })

  it('🥩 breakpoint resolution follows React object key order', () => {
    breakpointState.screens.value = { sm: true, xxl: true }
    const statisticWrapper = mount(ListPageSkeleton, {
      props: { pageHeader: false, toolbar: false, list: false },
    })
    const tableItemWrapper = mount(TableItemSkeleton, { props: { active: true } })

    expect(skeletonButtonCount(statisticWrapper)).toBe(2)
    expect(lineSkeletonCount(tableItemWrapper)).toBe(3)
  })

  it('🥩 descriptions table item skeleton uses default md breakpoint columns plus value column', () => {
    breakpointState.screens.value = {}
    const wrapper = mount(TableItemSkeleton, { props: { active: true } })

    expect(lineSkeletonCount(wrapper)).toBe(4)
  })

  it('🥩 table item skeleton renders row and line as sibling roots', () => {
    const wrapper = mount(TableItemSkeleton, { props: { active: true } })

    expect(wrapper.html()).toMatch(/^<div style="display: flex;/)
    expect(wrapper.html()).not.toMatch(/^<div><div style="display: flex;/)
  })
})
