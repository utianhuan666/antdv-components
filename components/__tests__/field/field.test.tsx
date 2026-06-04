import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { ProField } from '@antdv/components'
import { useFieldFetchData } from '../../field/components/Select'

describe('Field', () => {
  it('🐴 base use', () => {
    const wrapper = mount({
      render: () => <ProField text="100" valueType="money" mode="edit" />,
    })

    expect(wrapper.find('.ant-input-number').exists()).toBe(true)
    expect(wrapper.find('.ant-input-number-input').exists()).toBe(true)
  })

  it('🐴 percent=0', () => {
    const wrapper = mount({
      render: () => <ProField text={0} valueType="percent" mode="read" />,
    })

    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('%')
  })

  it('🐴 render 关闭 when text=0', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={0}
          valueType="select"
          valueEnum={{
            0: '关闭',
            1: '打开',
          }}
          mode="read"
        />
      ),
    })

    expect(wrapper.text()).toContain('关闭')
  })

  it('🐴 select valueEnum key is undefined', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          text={undefined}
          valueType="select"
          valueEnum={{
            undefined: '未定义',
          }}
          mode="read"
        />
      ),
    })

    expect(wrapper.text()).toContain('-')
  })

  it('🐴 should trigger onChange function provided when change', async () => {
    const onChange = vi.fn()
    const wrapper = mount({
      render: () => <ProField text="hello" valueType="text" mode="edit" onChange={onChange} />,
    })

    await wrapper.find('input').setValue('changed')

    expect(onChange).toHaveBeenCalled()
  })

  it('🐴 password support open', async () => {
    const wrapper = mount({
      render: () => <ProField text="secret" valueType="password" mode="read" />,
    })

    expect(wrapper.text()).not.toContain('secret')
    const icon = wrapper.find('.anticon-eye-invisible')
    if (icon.exists())
      await icon.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('secret')
  })

  it('🐴 options support dom list', () => {
    const wrapper = mount({
      render: () => <ProField text={['编辑', '删除']} valueType="option" mode="read" />,
    })

    expect(wrapper.text()).toContain('编辑')
    expect(wrapper.text()).toContain('删除')
  })

  it('🐴 progress support string number', () => {
    const wrapper = mount({
      render: () => <ProField text="80" valueType="progress" mode="read" />,
    })

    expect(wrapper.find('.ant-progress').exists()).toBe(true)
  })

  it('🐴 valueType digitRange base use', () => {
    const wrapper = mount({
      render: () => <ProField text={[1, 10]} valueType="digitRange" mode="edit" />,
    })

    expect(wrapper.findAll('.ant-input-number-input')).toHaveLength(2)
  })

  it('🐴 readonly and mode is edit use fieldProps.value', () => {
    const wrapper = mount({
      render: () => (
        <ProField
          mode="edit"
          readonly
          valueType="text"
          fieldProps={{ value: 'readonly text' }}
        />
      ),
    })

    expect(wrapper.text()).toContain('readonly text')
  })

  it('🐴 select request cacheForSwr reuses cached data', async () => {
    const request = vi.fn(async () => [{ label: 'Cached option', value: 'cached' }])
    const proFieldKey = `field-cache-${Date.now()}`
    const Demo = defineComponent({
      setup() {
        const [, options] = useFieldFetchData({
          request,
          proFieldKey,
          cacheForSwr: true,
        } as any)

        return () => <div>{options.value.map(item => item.label).join(',')}</div>
      },
    })

    const first = mount(Demo)
    await flushPromises()
    await nextTick()

    expect(request).toHaveBeenCalledTimes(1)
    expect(first.text()).toContain('Cached option')

    first.unmount()
    const second = mount(Demo)
    await flushPromises()
    await nextTick()

    expect(request).toHaveBeenCalledTimes(1)
    expect(second.text()).toContain('Cached option')
  })
})
