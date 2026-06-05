import { CheckCard, ProConfigProvider } from '@antdv/components'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { waitFor } from '../testUtils'

function withProvider(node: any) {
  return <ProConfigProvider>{node}</ProConfigProvider>
}

describe('checkCard', () => {
  it('should invoke onChange and onClick function when click option', async () => {
    const onChange = vi.fn()
    const onClick = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <CheckCard
            title="示例一"
            onChange={onChange}
            onClick={onClick}
          />,
        )
      ),
    })

    await wrapper.find('.ant-pro-checkcard').trigger('click')

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(true)
      expect(onClick).toHaveBeenCalled()
    })
  })

  it('should invoke onChange function when group click option', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <CheckCard.Group
            onChange={onChange}
            options={[
              { title: '苹果', value: 'Apple' },
              { title: '梨', value: 'Pear' },
              { title: '橙子', value: 'Orange' },
            ]}
            size="large"
          />,
        )
      ),
    })

    await wrapper.find('.ant-pro-checkcard').trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('Apple'))

    await wrapper.find('.ant-pro-checkcard').trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(undefined))

    await wrapper.findAll('.ant-pro-checkcard')[1]!.trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('Pear'))
  })

  it('should be controlled by value', async () => {
    const value = ref<string[] | undefined>()
    const wrapper = mount({
      render: () => {
        return (
          withProvider(
            <CheckCard.Group
              options={[
                { title: '苹果', value: 'Apple' },
                { title: '梨', value: 'Pear' },
                { title: '橙子', value: 'Orange' },
              ]}
              value={value.value}
            />,
          )
        )
      },
    })

    expect(wrapper.findAll('.ant-pro-checkcard-checked')).toHaveLength(0)

    value.value = ['Apple']
    await nextTick()

    expect(wrapper.findAll('.ant-pro-checkcard-checked')).toHaveLength(0)
  })

  it('should invoke onChange function when group click option in multiple mode', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <CheckCard.Group
            onChange={onChange}
            options={['Apple', 'Pear', 'Orange']}
            size="large"
            multiple
          />,
        )
      ),
    })

    await wrapper.find('.ant-pro-checkcard').trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(['Apple']))

    await wrapper.findAll('.ant-pro-checkcard')[1]!.trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(['Apple', 'Pear']))

    await wrapper.findAll('.ant-pro-checkcard')[1]!.trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(['Apple']))
  })

  it('should support defaultValue', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <CheckCard.Group onChange={onChange} defaultValue="A">
            <CheckCard title="Card A" description="选项一" value="A" />
            <CheckCard title="Card B" description="选项二" value="B" />
          </CheckCard.Group>,
        )
      ),
    })

    expect(wrapper.find('.ant-pro-checkcard').classes()).toContain('ant-pro-checkcard-checked')

    await wrapper.find('.ant-pro-checkcard').trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(undefined))

    await wrapper.find('.ant-pro-checkcard').trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('A'))
  })

  it('should support defaultValue in multiple mode', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <CheckCard.Group onChange={onChange} defaultValue={['A']} multiple>
            <CheckCard title="Card A" description="选项一" value="A" />
            <CheckCard title="Card B" description="选项二" value="B" />
          </CheckCard.Group>,
        )
      ),
    })

    expect(wrapper.find('.ant-pro-checkcard').classes()).toContain('ant-pro-checkcard-checked')

    await wrapper.find('.ant-pro-checkcard').trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([]))

    await wrapper.findAll('.ant-pro-checkcard')[1]!.trigger('click')
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['B']))
  })

  it('should disabled onChange when group disabled', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => (
        withProvider(
          <CheckCard.Group onChange={onChange} disabled defaultValue="A">
            <CheckCard title="Card A" description="选项一" value="A" />
            <CheckCard title="Card B" description="选项二" value="B" />
          </CheckCard.Group>,
        )
      ),
    })

    await wrapper.find('.ant-pro-checkcard').trigger('click')

    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('should display when title is number zero', () => {
    const wrapper = mount({
      render: () => withProvider(<CheckCard title={0} />),
    })

    expect(wrapper.find('.ant-pro-checkcard-title').html()).toContain('0')
  })
})
