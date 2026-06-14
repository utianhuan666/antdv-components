import { Button } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import { ProForm, ProFormCaptcha } from '../../form'
import { act, cleanup, fireEvent, render, waitFor } from '../testUtils'

afterEach(() => {
  cleanup()
})

describe('ProFormCaptcha', () => {
  it('😊 ProFormCaptcha Manual open', async () => {
    const captchaRef = shallowRef<any>()
    const fn = vi.fn()

    const TimingText = '获取验证码'

    const html = render(
      <ProForm
        title="新建表单"
        submitter={{
          render: () => {
            return [
              <Button
                htmlType="button"
                type="primary"
                onClick={() => {
                  captchaRef.value?.startTiming?.()
                }}
                key="edit"
                id="start"
              >
                手动开始计数
              </Button>,
              <Button
                htmlType="button"
                id="end"
                onClick={() => {
                  captchaRef.value?.endTiming?.()
                }}
                key="end"
              >
                手动结束计数
              </Button>,
            ]
          },
        }}
        onFinish={async () => true}
      >
        <ProFormCaptcha
          ref={captchaRef}
          onGetCaptcha={() => {
            return new Promise((_resolve, reject) => {
              fn(TimingText)
              reject(new Error('模拟报错'))
            })
          }}
          captchaProps={{
            id: 'captchaButton',
          }}
          name="code"
        />
      </ProForm>,
    )

    await act(async () => {
      const dom = await html.findByText('获取验证码')
      fireEvent.click(dom)
    })

    expect(fn).toHaveBeenCalledWith(TimingText)

    await act(async () => {
      const dom = await html.findByText('手动开始计数')
      fireEvent.click(dom)
    })

    await waitFor(() => {
      expect(
        html.container.querySelectorAll('#captchaButton')[0]?.textContent,
      ).toContain('60 秒后重新获取')
    })

    await act(async () => {
      const dom = await html.findByText('手动结束计数')
      fireEvent.click(dom)
    })

    expect(
      html.container.querySelectorAll('#captchaButton')[0]?.textContent,
    ).toContain('获取验证码')

    expect(captchaRef.value).toBeTruthy()
  })
})
