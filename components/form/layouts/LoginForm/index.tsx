import type { CSSProperties, VNodeChild } from 'vue'
import type { ProFormProps } from '../ProForm'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { LoginFormHeader } from '../_shared/LoginFormHeader'
import ProForm from '../ProForm'
import { useStyle } from './style'

export type LoginFormProps<T = Record<string, any>> = {
  message?: VNodeChild | false
  title?: VNodeChild | false
  subTitle?: VNodeChild | false
  actions?: VNodeChild
  logo?: VNodeChild | string
  contentStyle?: CSSProperties
  containerStyle?: CSSProperties
  otherStyle?: CSSProperties
} & Omit<ProFormProps<T>, 'title'>

export const LoginForm = defineComponent({
  name: 'LoginForm',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const baseClassName = useProPrefixCls('pro-form-login')
    const { wrapSSR, hashId } = useStyle(baseClassName.value)
    const getCls = (className: string) => `${baseClassName.value}-${className}`
    return () => {
      const { logo, message, contentStyle, title, subTitle, actions, containerStyle, otherStyle, ...proFormProps } = attrs as Partial<LoginFormProps>
      const submitter = proFormProps.submitter === false
        ? false
        : {
            searchConfig: { submitText: '登录' },
            ...proFormProps.submitter,
            submitButtonProps: {
              size: 'large',
              style: { width: '100%' },
              ...(proFormProps.submitter as any)?.submitButtonProps,
            },
            render: (submitterProps: any, dom: VNodeChild[]) => {
              const nextDom = [...dom]
              const loginButton = nextDom.pop()
              if (typeof (proFormProps.submitter as any)?.render === 'function')
                return (proFormProps.submitter as any).render(submitterProps, nextDom)
              return loginButton
            },
          }

      return wrapSSR(
        <div class={clsx(getCls('container'), hashId)} style={containerStyle}>
          <LoginFormHeader logo={logo} title={title} subTitle={subTitle} prefixCls={baseClassName.value} />
          <div class={getCls('main')} style={{ width: 328, ...contentStyle }}>
            <ProForm isKeyPressSubmit {...proFormProps as any} submitter={submitter}>
              {message}
              {slots.default?.()}
            </ProForm>
            {actions ? <div class={clsx(getCls('main-other'))} style={otherStyle}>{actions}</div> : null}
          </div>
        </div>,
      )
    }
  },
})

export default LoginForm
