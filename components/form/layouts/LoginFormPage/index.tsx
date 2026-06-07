import type { CSSProperties, VNodeChild } from 'vue'
import type { ProFormProps } from '../ProForm'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { LoginFormHeader } from '../_shared/LoginFormHeader'
import ProForm from '../ProForm'
import { useStyle } from './style'

export type LoginFormPageProps<T = Record<string, any>> = {
  message?: VNodeChild | false
  title?: VNodeChild | false
  subTitle?: VNodeChild | false
  actions?: VNodeChild
  logo?: VNodeChild | string
  style?: CSSProperties
  activityConfig?: {
    title?: VNodeChild
    subTitle?: VNodeChild
    action?: VNodeChild
    style?: CSSProperties
  }
  backgroundImageUrl?: string
  backgroundVideoUrl?: string
  containerStyle?: CSSProperties
  mainStyle?: CSSProperties
  otherStyle?: CSSProperties
} & Omit<ProFormProps<T>, 'title'>

export const LoginFormPage = defineComponent({
  name: 'LoginFormPage',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const baseClassName = useProPrefixCls('pro-form-login-page')
    const { wrapSSR, hashId } = useStyle(baseClassName.value)
    const getCls = (className: string) => `${baseClassName.value}-${className}`
    return () => {
      const {
        logo,
        message,
        style,
        activityConfig,
        backgroundImageUrl,
        backgroundVideoUrl,
        title,
        subTitle,
        actions,
        containerStyle,
        otherStyle,
        mainStyle,
        ...proFormProps
      } = attrs as Partial<LoginFormPageProps>
      const submitter = proFormProps.submitter === false
        ? false
        : {
            searchConfig: { submitText: '登录' },
            render: (_: any, dom: VNodeChild[]) => [...dom].pop(),
            ...proFormProps.submitter,
            submitButtonProps: (proFormProps.submitter as any)?.submitButtonProps === false
              ? false
              : {
                  size: 'large',
                  style: { width: '100%' },
                  ...(proFormProps.submitter as any)?.submitButtonProps,
                },
          }

      return wrapSSR(
        <div
          class={clsx(baseClassName.value, hashId)}
          style={{
            ...style,
            position: 'relative',
            backgroundImage: backgroundImageUrl ? `url("${backgroundImageUrl}")` : undefined,
          }}
        >
          {backgroundVideoUrl
            ? (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', overflow: 'hidden', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                  <video src={backgroundVideoUrl} controls={false} autoplay playsinline loop muted crossorigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )
            : null}
          <div class={baseClassName.value}>
            <div class={getCls('notice')}>
              {activityConfig
                ? (
                    <div class={getCls('notice-activity')} style={activityConfig.style}>
                      {activityConfig.title ? <div class={getCls('notice-activity-title')}>{activityConfig.title}</div> : null}
                      {activityConfig.subTitle ? <div class={getCls('notice-activity-subTitle')}>{activityConfig.subTitle}</div> : null}
                      {activityConfig.action ? <div class={getCls('notice-activity-action')}>{activityConfig.action}</div> : null}
                    </div>
                  )
                : null}
            </div>
            <div class={getCls('left')}>
              <div class={getCls('container')} style={containerStyle}>
                <LoginFormHeader logo={logo} title={title} subTitle={subTitle} prefixCls={baseClassName.value} />
                <div class={getCls('main')} style={mainStyle}>
                  <ProForm isKeyPressSubmit {...proFormProps as any} submitter={submitter}>
                    {message}
                    {slots.default?.()}
                  </ProForm>
                  {actions ? <div class={clsx(getCls('other'))} style={otherStyle}>{actions}</div> : null}
                </div>
              </div>
            </div>
          </div>
        </div>,
      )
    }
  },
})

export default LoginFormPage
