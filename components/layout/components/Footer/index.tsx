import type { CSSProperties } from 'vue'
import type { FooterLink, WithFalse } from '../GlobalFooter'
import { CopyrightOutlined } from '@antdv-next/icons'
import { LayoutFooter } from 'antdv-next'
import { defineComponent, Fragment } from 'vue'
import { GlobalFooter } from '../GlobalFooter'

export interface FooterProps {
  links?: WithFalse<FooterLink[]>
  copyright?: WithFalse<string>
  style?: CSSProperties
  className?: string
  prefixCls?: string
}

export const DefaultFooter = defineComponent({
  name: 'DefaultFooter',
  props: ['class', 'className', 'prefixCls', 'links', 'copyright', 'style'],
  setup(props) {
    return () => (
      <LayoutFooter
        class={props.className || props.class}
        style={{ padding: 0, ...props.style }}
        data-testid="pro-layout-footer"
      >
        <GlobalFooter
          links={props.links}
          prefixCls={props.prefixCls}
          copyright={
            props.copyright === false
              ? null
              : (
                  <Fragment>
                    <CopyrightOutlined />
                    {' '}
                    {props.copyright}
                  </Fragment>
                )
          }
        />
      </LayoutFooter>
    )
  },
})

export default DefaultFooter
