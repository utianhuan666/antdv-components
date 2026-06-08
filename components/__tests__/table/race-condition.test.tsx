import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import ProTable from '../../table'
import { waitFor } from '../testUtils'
import './tableTestSetup'

const waitTime = (time = 100) => new Promise(resolve => setTimeout(resolve, time))

describe('proTable Race Condition', () => {
  it('should avoid race condition when request delays vary', async () => {
    const Demo = defineComponent({
      setup() {
        const current = ref(1)
        return () => (
          <div>
            <button onClick={() => (current.value = 3)} data-testid="btn-3">
              setCurrent 3
            </button>
            <button onClick={() => (current.value = 0)} data-testid="btn-0">
              setCurrent 0
            </button>
            <ProTable
              rowKey="id"
              search={false}
              params={{ current: current.value }}
              request={async (params: any) => {
                const paramCurrent = params.current
                const delay = paramCurrent === 3 ? 1000 : 100
                await waitTime(delay)

                return {
                  data: [
                    {
                      id: paramCurrent,
                      title: `title ${paramCurrent}`,
                    },
                  ],
                  success: true,
                  total: 1,
                }
              }}
              columns={[
                {
                  title: 'title',
                  dataIndex: 'title',
                },
              ]}
            />
          </div>
        )
      },
    })

    const wrapper = mount(Demo, { attachTo: document.body })

    await waitFor(() => {
      expect(document.body.textContent).toContain('title 1')
    }, 2000)

    await wrapper.find('[data-testid="btn-3"]').trigger('click')
    await waitTime(50)
    await wrapper.find('[data-testid="btn-0"]').trigger('click')

    await waitFor(() => {
      expect(document.body.textContent).toContain('title 0')
    }, 2000)

    await waitTime(1500)

    expect(document.body.textContent).toContain('title 0')
    expect(document.body.textContent).not.toContain('title 3')
  })
})
