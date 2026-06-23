import type { FormInstance } from 'antdv-next'
import type { CSSProperties, VNodeChild } from 'vue'
import type { SubmitterProps } from '../../BaseForm/Submitter'
import type { ProFormProps } from '../ProForm'
import { clsx } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { defineComponent } from 'vue'
import { useIntl } from '../../../provider'
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

type LoginPageSubmitterRenderProps = Parameters<
  Exclude<SubmitterProps<{ form?: FormInstance }>['render'], false | undefined>
>[0]

export const LoginFormPage = defineComponent<LoginFormPageProps>(
  (props, { slots }) => {
    const intl = useIntl()
    const config = useConfig()
    const baseClassName = config.value.getPrefixCls('pro-form-login-page')
    const { wrapSSR, hashId } = useStyle(baseClassName)
    const getCls = (className: string) => `${baseClassName}-${className}`

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
      } = props

      const typedProFormProps = proFormProps as Omit<ProFormProps, 'title'>
      const currentSubmitter: SubmitterProps<{ form?: FormInstance }> | false | undefined
        = typedProFormProps.submitter
      const genSubmitButtonProps = () => {
        if (typedProFormProps.submitter === false)
          return false
        if (typedProFormProps.submitter?.submitButtonProps === false)
          return false
        return {
          size: 'large',
          style: {
            width: '100%',
          },
          ...typedProFormProps.submitter?.submitButtonProps,
        }
      }

      const submitter = {
        searchConfig: {
          submitText: intl.getMessage('loginForm.submitText', '登录'),
        },
        render: (_: LoginPageSubmitterRenderProps, dom: VNodeChild[]) => [...dom].pop(),
        ...currentSubmitter,
        submitButtonProps: genSubmitButtonProps(),
      } as ProFormProps['submitter']

      return wrapSSR(
        <div
          class={clsx(baseClassName, hashId)}
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
          <div class={clsx(baseClassName, hashId)}>
            <div class={clsx(getCls('notice'), hashId)}>
              {activityConfig
                ? (
                    <div class={clsx(getCls('notice-activity'), hashId)} style={activityConfig.style}>
                      {activityConfig.title ? <div class={clsx(getCls('notice-activity-title'), hashId)}>{activityConfig.title}</div> : null}
                      {activityConfig.subTitle ? <div class={clsx(getCls('notice-activity-subTitle'), hashId)}>{activityConfig.subTitle}</div> : null}
                      {activityConfig.action ? <div class={clsx(getCls('notice-activity-action'), hashId)}>{activityConfig.action}</div> : null}
                    </div>
                  )
                : null}
            </div>
            <div class={clsx(getCls('left'), hashId)}>
              <div class={clsx(getCls('container'), hashId)} style={containerStyle}>
                <LoginFormHeader logo={logo} title={title} subTitle={subTitle} prefixCls={baseClassName} hashId={hashId} />
                <div class={clsx(getCls('main'), hashId)} style={mainStyle}>
                  <ProForm isKeyPressSubmit {...typedProFormProps} submitter={submitter}>
                    {message}
                    {slots.default?.()}
                  </ProForm>
                  {actions ? <div class={clsx(getCls('other'), hashId)} style={otherStyle}>{actions}</div> : null}
                </div>
              </div>
            </div>
          </div>
        </div>,
      )
    }
  },
  {
    name: 'LoginFormPage',
    inheritAttrs: false,
  },
)

export default LoginFormPage
