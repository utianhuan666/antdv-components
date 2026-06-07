import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'

export interface WrapContentProps {
  isChildrenLayout?: boolean
  hasPageContainer?: number
  hasHeader?: boolean
  prefixCls?: string
  className?: string
  style?: CSSProperties
}

export const WrapContent = defineComponent({
  name: 'WrapContent',
  props: ['isChildrenLayout', 'hasPageContainer', 'hasHeader', 'prefixCls', 'className', 'style'],
  setup(props, { slots }) {
    return () => (
      <div class={props.className} style={props.style} data-testid="pro-layout-wrap-content">
        {slots.default?.()}
      </div>
    )
  },
})

export default WrapContent
