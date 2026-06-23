import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ProSkeleton } from '../../skeleton'

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

describe('skeleton', () => {
  it('🥩 list base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'list' } })
    // type="list" 应渲染 skeleton 容器和多个 skeleton 单元
    expect(skeletonCount(wrapper)).toBeGreaterThan(0)
    // 默认 list 模式应渲染若干 skeleton-button（PageHeader/Statistic/Toolbar/List 中均有）
    expect(skeletonButtonCount(wrapper)).toBeGreaterThan(0)
  })

  it('🥩 descriptions base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'descriptions' } })
    // type="descriptions" 应渲染多个 skeleton 单元
    expect(skeletonCount(wrapper)).toBeGreaterThan(0)
    // descriptions 模式下应渲染若干 skeleton-button（DescriptionsSkeleton 中的 100px 按钮）
    expect(skeletonButtonCount(wrapper)).toBeGreaterThan(0)
  })

  it('🥩 result base use', () => {
    const wrapper = mount(ProSkeleton, { props: { type: 'result' } })
    // type="result" 应渲染结果页 skeleton
    expect(skeletonCount(wrapper)).toBeGreaterThan(0)
    // result 模式下应渲染 button skeleton
    expect(wrapper.find('.ant-skeleton-button').exists()).toBe(true)
  })

  it('🥩 descriptions api use', async () => {
    const wrapper = mount(ProSkeleton, {
      props: { type: 'descriptions', pageHeader: false, list: 10 },
    })
    // pageHeader=false 不应渲染 pageHeader skeleton（无 ant-skeleton-avatar）
    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
    // list=10 应渲染较多 skeleton 单元
    const initialItems = skeletonCount(wrapper)
    expect(initialItems).toBeGreaterThan(0)

    await wrapper.setProps({ type: 'descriptions', pageHeader: false, list: 5 })

    // list=5 时，skeleton 数量应少于 list=10 时
    expect(skeletonCount(wrapper)).toBeLessThan(initialItems)
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
    // pageHeader=false 不应渲染 avatar skeleton
    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
    // 应渲染若干 skeleton 单元（statistic + list）
    const initialCount = skeletonCount(wrapper)
    expect(initialCount).toBeGreaterThan(0)

    await wrapper.setProps({
      type: 'list',
      pageHeader: false,
      statistic: false,
      actionButton: false,
      toolbar: false,
      list: false,
    })

    // 全部关闭后，skeleton 数量应大幅减少（趋近 0）
    expect(skeletonCount(wrapper)).toBeLessThan(initialCount)
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
    // 仅渲染 statistic + list 两个模块
    expect(skeletonCount(wrapper)).toBeGreaterThan(0)
    // pageHeader/actionButton/toolbar 关闭，无 avatar skeleton
    expect(wrapper.find('.ant-skeleton-avatar').exists()).toBe(false)
  })
})
