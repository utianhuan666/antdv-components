import { defineComponent } from 'vue'
import { ArrowSvgIcon } from '../SiderMenu/Arrow'

export const CollapsedIcon = defineComponent({
  name: 'CollapsedIcon',
  inheritAttrs: false,
  props: ['isMobile', 'collapsed', 'className', 'data-testid'] as any,
  emits: ['click'],
  setup(rawProps, { attrs, emit }) {
    const props = rawProps as any
    return () => {
      if (props.isMobile && props.collapsed)
        return null
      return (
        <div
          {...attrs}
          class={[
            props.className,
            props.collapsed && `${props.className}-collapsed`,
            props.isMobile && `${props.className}-is-mobile`,
          ]}
          data-testid={props['data-testid'] || (attrs as any)['data-testid'] || 'pro-layout-sider-collapsed-button'}
          onClick={(event: MouseEvent) => emit('click', event)}
        >
          <ArrowSvgIcon />
        </div>
      )
    }
  },
})
