import type { VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

export interface LoginFormHeaderProps {
  logo?: VNodeChild | string
  title?: VNodeChild | false
  subTitle?: VNodeChild | false
  prefixCls?: string
  hashId?: string
}

export const LoginFormHeader = defineComponent({
  name: 'ProLoginFormHeader',
  props: ['logo', 'title', 'subTitle', 'prefixCls', 'hashId'],
  setup(rawProps) {
    const props = rawProps as LoginFormHeaderProps
    const defaultPrefixCls = useProPrefixCls('pro-form-login')
    const prefixCls = computed(() => props.prefixCls || defaultPrefixCls.value)
    const getCls = (className: string) => `${prefixCls.value}-${className}`
    const logoDom = computed(() => {
      if (!props.logo)
        return null
      return typeof props.logo === 'string' ? <img src={props.logo} alt="" /> : props.logo
    })

    return () => (
      <div class={clsx(getCls('top'), props.hashId)}>
        {props.title || logoDom.value
          ? (
              <div class={clsx(getCls('header'), props.hashId)}>
                {logoDom.value ? <span class={clsx(getCls('logo'), props.hashId)}>{logoDom.value}</span> : null}
                {props.title ? <span class={clsx(getCls('title'), props.hashId)}>{props.title}</span> : null}
              </div>
            )
          : null}
        {props.subTitle ? <div class={clsx(getCls('desc'), props.hashId)}>{props.subTitle}</div> : null}
      </div>
    )
  },
})

export default LoginFormHeader
