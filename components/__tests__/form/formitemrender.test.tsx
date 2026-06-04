// @ts-nocheck
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ProFormText from '../../form/components/Text'
import ProForm from '../../form/layouts/ProForm'
import { mountAttached } from '../testUtils'

describe('ProFormField formItemRender', () => {
  it('passes formItemRender to ProField edit renderer', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormText
            name="name"
            initialValue="antdv"
            placeholder="请输入"
            formItemRender={(text: any, props: any, dom: any) => (
              <span class="custom-form-item-render">
                {text}
                |
                {props.mode}
                |
                {dom?.type?.name}
              </span>
            )}
          />
        </ProForm>
      ),
    })

    await nextTick()

    expect(wrapper.find('.custom-form-item-render').text()).toBe('antdv|edit|AInput')
  })
})
