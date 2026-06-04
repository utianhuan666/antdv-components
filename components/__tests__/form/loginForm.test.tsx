import { LoginForm, LoginFormPage, ProConfigProvider, ProFormText } from '@antdv/components'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mountAttached } from '../testUtils'

describe('login form layouts', () => {
  it('renders LoginForm header, message, actions, and login submitter', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProConfigProvider>
          <LoginForm
            logo="https://example.com/logo.svg"
            title="Antdv"
            subTitle="Welcome back"
            message={<div id="login-message">Login error</div>}
            actions={<a id="login-action">Forgot password</a>}
          >
            <ProFormText name="username" />
          </LoginForm>
        </ProConfigProvider>
      ),
    })

    await nextTick()

    expect(wrapper.find('.ant-pro-form-login-logo img').attributes('src')).toBe('https://example.com/logo.svg')
    expect(wrapper.find('.ant-pro-form-login-title').text()).toBe('Antdv')
    expect(wrapper.find('.ant-pro-form-login-desc').text()).toBe('Welcome back')
    expect(wrapper.find('#login-message').exists()).toBe(true)
    expect(wrapper.find('#login-action').exists()).toBe(true)
    expect(wrapper.find('.ant-btn-primary').text().replace(/\s/g, '')).toBe('登录')
  })

  it('renders LoginFormPage activity and media backgrounds', async () => {
    const wrapper = mountAttached({
      render: () => (
        <ProConfigProvider>
          <LoginFormPage
            logo={<span id="page-logo">L</span>}
            title="Console"
            subTitle="Secure login"
            backgroundImageUrl="https://example.com/bg.png"
            backgroundVideoUrl="https://example.com/bg.mp4"
            activityConfig={{
              title: 'Campaign',
              subTitle: 'Join us',
              action: <a id="activity-action">Open</a>,
            }}
            actions={<span id="page-action">Other login</span>}
          >
            <ProFormText name="account" />
          </LoginFormPage>
        </ProConfigProvider>
      ),
    })

    await nextTick()

    expect(wrapper.find('.ant-pro-form-login-page-title').text()).toBe('Console')
    expect(wrapper.find('#page-logo').exists()).toBe(true)
    expect(wrapper.find('.ant-pro-form-login-page-notice-activity-title').text()).toBe('Campaign')
    expect(wrapper.find('#activity-action').exists()).toBe(true)
    expect(wrapper.find('video').attributes('src')).toBe('https://example.com/bg.mp4')
    expect(wrapper.find('#page-action').exists()).toBe(true)
    expect(wrapper.find('.ant-btn-primary').text().replace(/\s/g, '')).toBe('登录')
  })
})
