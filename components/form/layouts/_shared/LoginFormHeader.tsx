import type { FunctionalComponent, VNodeChild } from 'vue'
import { clsx } from '@v-c/util'

export interface LoginFormHeaderProps {
  logo?: VNodeChild
  title?: VNodeChild | false
  subTitle?: VNodeChild | false
  prefixCls: string
  hashId?: string
}

export const LoginFormHeader: FunctionalComponent<LoginFormHeaderProps> = (props) => {
  const getCls = (className: string) => `${props.prefixCls}-${className}`

  const logoDom = () => {
    if (!props.logo)
      return null
    if (typeof props.logo === 'string')
      return <img src={props.logo} alt="" />
    return props.logo
  }

  return (
    <div class={clsx(getCls('top'), props.hashId)}>
      {props.title || logoDom()
        ? (
            <div class={clsx(getCls('header'), props.hashId)}>
              {logoDom()
                ? <span class={clsx(getCls('logo'), props.hashId)}>{logoDom()}</span>
                : null}
              {props.title
                ? <span class={clsx(getCls('title'), props.hashId)}>{props.title}</span>
                : null}
            </div>
          )
        : null}
      {props.subTitle
        ? <div class={clsx(getCls('desc'), props.hashId)}>{props.subTitle}</div>
        : null}
    </div>
  )
}
