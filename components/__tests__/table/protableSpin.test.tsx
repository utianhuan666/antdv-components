import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import ProTable from '../../table'
import { waitFor } from '../testUtils'
import './tableTestSetup'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('proTable test', () => {
  it('loading and polling props', async () => {
    const fn = vi.fn()
    const Demo = defineComponent({
      setup() {
        const loading = ref({ spinning: true, delay: 1000 })
        const polling = ref<any>(2000)
        return {
          loading,
          polling,
          stopPolling: () => {
            loading.value = { spinning: false, delay: 1000 }
            polling.value = undefined
          },
        }
      },
      render() {
        return (
          <ProTable
            loading={this.loading}
            polling={this.polling}
            request={async () => {
              fn()
              return {
                data: [],
                total: 20,
                success: true,
              }
            }}
          />
        )
      },
    })

    const wrapper = mount(Demo, { attachTo: document.body })

    await waitFor(() => {
      expect(fn).toHaveBeenCalledTimes(1)
    }, 2000)

    ;(wrapper.vm as any).stopPolling()
    await wrapper.vm.$nextTick()
  })

  it('boolean loading and polling props', async () => {
    const Demo = defineComponent({
      setup() {
        const loading = ref(true)
        const polling = ref<any>(2000)
        return {
          loading,
          polling,
          stopPolling: () => {
            loading.value = false
            polling.value = undefined
          },
        }
      },
      render() {
        return (
          <ProTable
            loading={this.loading}
            polling={this.polling}
            request={async () => ({
              data: [],
              total: 20,
              success: true,
            })}
          />
        )
      },
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await wrapper.vm.$nextTick()
    ;(wrapper.vm as any).stopPolling()
    await wrapper.vm.$nextTick()
  })
})
