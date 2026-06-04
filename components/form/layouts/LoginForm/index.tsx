import type { CSSProperties, FunctionalComponent, VNodeChild } from 'vue'
import type { ProFormProps, SubmitterProps } from '../../typing'
import { clsx } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { defineComponent } from 'vue'
import { useIntl } from '../../../provider'
import { LoginFormHeader } from '../_shared/LoginFormHeader'
import ProForm from '../ProForm'
import { useStyle } from './style'

export type LoginFormProps<T = Record<string, any>, U = Record<string, any>> = Omit<ProFormProps<T, U>, 'title'> & {
  message?: VNodeChild | false
  title?: VNodeChild | false
  subTitle?: VNodeChild | false
  actions?: VNodeChild
  logo?: VNodeChild
  contentStyle?: CSSProperties
  containerStyle?: CSSProperties
  otherStyle?: CSSProperties
}

const loginFormPropNames = [
  'logo',
  'message',
  'contentStyle',
  'title',
  'subTitle',
  'actions',
  'containerStyle',
  'otherStyle',
] as const

const LoginFormImpl = defineComponent({
  name: 'LoginForm',
  inheritAttrs: false,
  props: [...loginFormPropNames],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps as Readonly<LoginFormProps>
    const intl = useIntl()
    const config = useConfig()
    const baseClassName = config.value.getPrefixCls('pro-form-login')
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
            ...(typeof proFormProps.submitter === 'object' ? proFormProps.submitter : {}),
            submitButtonProps: {
              size: 'large',
              style: {
                width: '100%',
              },
              ...(typeof proFormProps.submitter === 'object' && typeof proFormProps.submitter.submitButtonProps === 'object'
                ? proFormProps.submitter.submitButtonProps
                : {}),
            },
            render: (submitterProps, dom) => {
              const loginButton = dom.pop()
              const originRender = (proFormProps.submitter as SubmitterProps | undefined)?.render
              if (typeof originRender === 'function')
                return originRender(submitterProps, dom)
              return loginButton
            },
          } as ProFormProps['submitter'])

      return wrapSSR(
        <div class={clsx(getCls('container'), hashId)} style={props.containerStyle}>
          <LoginFormHeader
            logo={props.logo}
            title={props.title}
            subTitle={props.subTitle}
            prefixCls={baseClassName}
            hashId={hashId}
          />
          <div
            class={clsx(getCls('main'), hashId)}
            style={{
              width: 328,
              ...(props.contentStyle || {}),
            }}
          >
            <ProForm isKeyPressSubmit {...proFormProps} submitter={submitter}>
              {props.message}
              {slots.default?.()}
            </ProForm>
            {props.actions
              ? (
                  <div
                    class={clsx(getCls('main-other'), hashId)}
                    style={props.otherStyle}
                  >
                    {props.actions}
                  </div>
                )
              : null}
          </div>
        </div>,
      )
    }
  },
})

const LoginForm = LoginFormImpl as unknown as FunctionalComponent<LoginFormProps>

export default LoginForm
export { LoginForm }
export type { SubmitterProps }
