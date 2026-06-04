import { Button } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import ProFormCaptcha from '../../form/components/Captcha'
import ProFormText from '../../form/components/Text'
import ProForm from '../../form/layouts/ProForm'
import { mountAttached, waitFor } from '../testUtils'

describe('proFormCaptcha', () => {
  it('supports onGetCaptcha with phoneName and custom text render', async () => {
    const onGetCaptcha = vi.fn().mockResolvedValue(undefined)
    const wrapper = mountAttached({
      render: () => (
        <ProForm initialValues={{ phone: '13800138000' }}>
          <ProFormText name="phone" />
          <ProFormCaptcha
            name="code"
            phoneName="phone"
            countDown={3}
            onGetCaptcha={onGetCaptcha}
            captchaProps={{ id: 'captcha-send' }}
            captchaTextRender={(timing: boolean, count: number) => timing ? `${count}s` : 'Send'}
          />
        </ProForm>
      ),
    })

    await wrapper.find('#captcha-send').trigger('click')
    await nextTick()

    expect(onGetCaptcha).toHaveBeenCalledWith('13800138000')
    await waitFor(() => {
      expect(wrapper.findComponent(Button).text()).toBe('3s')
    })
  })

  it('supports value change and fieldProps.onChange', async () => {
    const onChange = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm>
          <ProFormCaptcha
            name="code"
            fieldProps={{ id: 'captcha-code', onChange }}
            onGetCaptcha={async () => {}}
          />
        </ProForm>
      ),
    })

    await wrapper.find('input#captcha-code').setValue('123456')

    expect(onChange).toHaveBeenCalled()
    expect((wrapper.find('input#captcha-code').element as HTMLInputElement).value).toBe('123456')
  })

  it('exposes startTiming and endTiming', async () => {
    const captchaRef = shallowRef<any>()
    const wrapper = mountAttached({
      setup() {
        return () => (
          <ProForm>
            <ProFormCaptcha
              ref={captchaRef}
              name="code"
              countDown={2}
              onGetCaptcha={async () => {}}
              captchaProps={{ id: 'captcha-button' }}
            />
          </ProForm>
        )
      },
    })

    captchaRef.value.startTiming()
    await nextTick()
    expect(wrapper.find('#captcha-button').text()).toBe('2 秒后重新获取')

    captchaRef.value.endTiming()
    await nextTick()
    expect(wrapper.find('#captcha-button').text()).toBe('获取验证码')
  })
})
