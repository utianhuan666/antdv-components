import type { CSSProperties, PropType, VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { defineComponent } from 'vue'
import { useStyle } from './style'

export interface FooterLink {
  key?: string
  title: VNodeChild
  href: string
  blankTarget?: boolean
}

export type WithFalse<T> = T | false

export interface GlobalFooterProps {
  links?: WithFalse<FooterLink[]>
  copyright?: VNodeChild | false
  style?: CSSProperties
  prefixCls?: string
  className?: string
}

export const GlobalFooter = defineComponent({
  name: 'GlobalFooter',
  props: {
    class: String,
    className: String,
    prefixCls: String,
    links: {
      type: [Array, Boolean] as PropType<WithFalse<FooterLink[]>>,
      default: undefined,
    },
    copyright: {
      type: null as any,
      default: undefined,
    },
    style: Object as PropType<CSSProperties>,
  },
  setup(props) {
    const config = useConfig()
    const baseClassName = config.value.getPrefixCls(props.prefixCls || 'pro-global-footer')
    const { hashId } = useStyle(baseClassName)

    return () => {
      const links = props.links
      const copyright = props.copyright as VNodeChild | false | undefined

      if (
        (links == null || links === false || (Array.isArray(links) && links.length === 0))
        && (copyright == null || copyright === false)
      ) {
        return null
      }

      return (
        <div
          class={clsx(baseClassName, hashId, props.class, props.className)}
          style={props.style}
          data-testid="pro-global-footer"
        >
          {links
            ? (
                <div
                  class={clsx(`${baseClassName}-list`, hashId)}
                  data-testid="pro-global-footer-list"
                >
                  {links.map(link => (
                    <a
                      class={clsx(`${baseClassName}-list-link`, hashId)}
                      data-testid="pro-global-footer-list-link"
                      key={link.key}
                      title={link.key}
                      target={link.blankTarget ? '_blank' : '_self'}
                      href={link.href}
                      rel="noreferrer"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              )
            : null}
          {copyright
            ? (
                <div
                  class={clsx(`${baseClassName}-copyright`, hashId)}
                  data-testid="pro-global-footer-copyright"
                >
                  {copyright}
                </div>
              )
            : null}
        </div>
      )
    }
  },
})

export default GlobalFooter
