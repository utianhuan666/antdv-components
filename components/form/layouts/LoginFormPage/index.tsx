import type { CSSProperties, FunctionalComponent, VNodeChild } from 'vue'
import type { ProFormProps } from '../../typing'
import { clsx } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { defineComponent } from 'vue'
import { useIntl } from '../../../provider'
import { LoginFormHeader } from '../_shared/LoginFormHeader'
import ProForm from '../ProForm'
import { useStyle } from './style'

export type LoginFormPageProps<T = Record<string, any>, U = Record<string, any>> = Omit<ProFormProps<T, U>, 'title'> & {
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
}

const loginFormPagePropNames = [
  'logo',
  'message',
  'style',
  'activityConfig',
  'backgroundImageUrl',
  'backgroundVideoUrl',
  'title',
  'subTitle',
  'actions',
  'containerStyle',
  'otherStyle',
  'mainStyle',
] as const

const LoginFormPageImpl = defineComponent({
  name: 'LoginFormPage',
  inheritAttrs: false,
  props: [...loginFormPagePropNames],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps as Readonly<LoginFormPageProps>
    const intl = useIntl()
    const config = useConfig()
    const baseClassName = config.value.getPrefixCls('pro-form-login-page')
    const { wrapSSR, hashId } = useStyle(baseClassName)
    const getCls = (className: string) => `${baseClassName}-${className}`

    return () => {
      const proFormProps = attrs as Partial<ProFormProps>
      const submitter = proFormProps.submitter === false
        ? false
        : ({
            searchConfig: {
              submitText: intl.getMessage('loginForm.submitText', '登录'),
            },
            render: (_submitterProps, dom) => dom.pop(),
            ...(typeof proFormProps.submitter === 'object' ? proFormProps.submitter : {}),
            submitButtonProps: proFormProps.submitter?.submitButtonProps === false
              ? false
              : {
                  size: 'large',
                  style: {
                    width: '100%',
                  },
                  ...(typeof proFormProps.submitter?.submitButtonProps === 'object'
                    ? proFormProps.submitter.submitButtonProps
                    : {}),
                },
          } as ProFormProps['submitter'])

      return wrapSSR(
        <div
          class={clsx(baseClassName, hashId)}
          style={{
            ...(props.style || {}),
            position: 'relative',
            backgroundImage: props.backgroundImageUrl
              ? `url("${props.backgroundImageUrl}")`
              : undefined,
          }}
        >
          {props.backgroundVideoUrl
            ? (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    overflow: 'hidden',
                    height: '100%',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                >
                  <video
                    src={props.backgroundVideoUrl}
                    controls={false}
                    autoplay
                    playsinline
                    loop
                    muted
                    crossorigin="anonymous"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )
            : null}
          <div class={clsx(baseClassName, hashId)}>
            <div class={clsx(getCls('notice'), hashId)}>
              {props.activityConfig
                ? (
                    <div
                      class={clsx(getCls('notice-activity'), hashId)}
                      style={props.activityConfig.style}
                    >
                      {props.activityConfig.title
                        ? <div class={clsx(getCls('notice-activity-title'), hashId)}>{props.activityConfig.title}</div>
                        : null}
                      {props.activityConfig.subTitle
                        ? <div class={clsx(getCls('notice-activity-subTitle'), hashId)}>{props.activityConfig.subTitle}</div>
                        : null}
                      {props.activityConfig.action
                        ? <div class={clsx(getCls('notice-activity-action'), hashId)}>{props.activityConfig.action}</div>
                        : null}
                    </div>
                  )
                : null}
            </div>
            <div class={clsx(getCls('left'), hashId)}>
              <div
                class={clsx(getCls('container'), hashId)}
                style={props.containerStyle}
              >
                <LoginFormHeader
                  logo={props.logo}
                  title={props.title}
                  subTitle={props.subTitle}
                  prefixCls={baseClassName}
                  hashId={hashId}
                />
                <div class={clsx(getCls('main'), hashId)} style={props.mainStyle}>
                  <ProForm isKeyPressSubmit {...proFormProps} submitter={submitter}>
                    {props.message}
                    {slots.default?.()}
                  </ProForm>
                  {props.actions
                    ? (
                        <div
                          class={clsx(getCls('other'), hashId)}
                          style={props.otherStyle}
                        >
                          {props.actions}
                        </div>
                      )
                    : null}
                </div>
              </div>
            </div>
          </div>
        </div>,
      )
    }
  },
})

const LoginFormPage = LoginFormPageImpl as unknown as FunctionalComponent<LoginFormPageProps>

export default LoginFormPage
export { LoginFormPage }
