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

export type LoginFormProps<T = Record<string, any>> = {
  message?: VNodeChild | false
  title?: VNodeChild | false
  subTitle?: VNodeChild | false
  actions?: VNodeChild
  logo?: VNodeChild
  children?: VNodeChild | VNodeChild[]
  contentStyle?: CSSProperties
  containerStyle?: CSSProperties
  otherStyle?: CSSProperties
} & Omit<ProFormProps<T>, 'title'>

function isSubmitterWithRender(
  submitter: SubmitterProps<{ form?: FormInstance }> | false | undefined,
): submitter is SubmitterProps<{ form?: FormInstance }> & {
  render: Exclude<SubmitterProps<{ form?: FormInstance }>['render'], false | undefined>
} {
  return !!submitter && typeof submitter.render === 'function'
}

type LoginSubmitterRenderProps = Parameters<
  Exclude<SubmitterProps<{ form?: FormInstance }>['render'], false | undefined>
>[0]

export const LoginForm = defineComponent<LoginFormProps>(
  (props, { slots }) => {
    const intl = useIntl()
    const config = useConfig()
    const baseClassName = config.value.getPrefixCls('pro-form-login')
    const { wrapSSR, hashId } = useStyle(baseClassName)
    const getCls = (className: string) => `${baseClassName}-${className}`

    return () => {
      const {
        logo,
        message,
        contentStyle,
        title,
        subTitle,
        actions,
        containerStyle,
        otherStyle,
        ...proFormProps
      } = props

      const typedProFormProps = proFormProps as Omit<ProFormProps, 'title'>
      const currentSubmitter: SubmitterProps<{ form?: FormInstance }> | false | undefined
        = typedProFormProps.submitter
      const submitter
        = currentSubmitter === false
          ? false
          : ({
              searchConfig: {
                submitText: intl.getMessage('loginForm.submitText', '登录'),
              },
              ...currentSubmitter,
              submitButtonProps: {
                size: 'large',
                block: true,
                ...(currentSubmitter ? currentSubmitter.submitButtonProps : {}),
              },
              render: (submitterProps: LoginSubmitterRenderProps, dom: VNodeChild[]) => {
                const nextDom = [...dom]
                const loginButton = nextDom.pop()
                if (isSubmitterWithRender(currentSubmitter))
                  return currentSubmitter.render(submitterProps, nextDom)
                return loginButton
              },
            } satisfies ProFormProps['submitter'])

      return wrapSSR(
        <div class={clsx(getCls('container'), hashId)} style={containerStyle}>
          <LoginFormHeader
            logo={logo}
            title={title}
            subTitle={subTitle}
            prefixCls={baseClassName}
            hashId={hashId}
          />
          <div
            class={clsx(getCls('main'), hashId)}
            style={{
              width: 328,
              ...contentStyle,
            }}
          >
            <ProForm {...typedProFormProps} isKeyPressSubmit submitter={submitter}>
              {message}
              {slots.default?.()}
            </ProForm>
            {actions
              ? (
                  <div
                    class={clsx(getCls('main-other'), hashId)}
                    style={otherStyle}
                  >
                    {actions}
                  </div>
                )
              : null}
          </div>
        </div>,
      )
    }
  },
  {
    name: 'LoginForm',
    inheritAttrs: false,
  },
)

export default LoginForm
