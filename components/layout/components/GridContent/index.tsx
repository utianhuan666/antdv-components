import type { CSSProperties, PropType } from 'vue'
import type { ContentWidth } from '../PageContainer/context'
import { clsx } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { defineComponent } from 'vue'
import { useRouteContext } from '../PageContainer/context'
import { useStyle } from './style'

export interface GridContentProps {
  contentWidth?: ContentWidth
  className?: string
  style?: CSSProperties
  prefixCls?: string
}

export const GridContent = defineComponent({
  name: 'GridContent',
  props: {
    class: String,
    className: String,
    contentWidth: String as PropType<ContentWidth>,
    style: Object as PropType<CSSProperties>,
    prefixCls: String,
  },
  setup(props, { slots }) {
    const routeContext = useRouteContext()
    const config = useConfig()
    const prefixCls = props.prefixCls || config.value.getPrefixCls('pro')
    const className = `${prefixCls}-grid-content`
    const { hashId } = useStyle(className)

    return () => {
      const contentWidth = props.contentWidth || routeContext.contentWidth
      const isWide = contentWidth === 'Fixed' && routeContext.layout === 'top'

      return (
        <div
          class={clsx(className, hashId, props.class, props.className, {
            [`${className}-wide`]: isWide,
          })}
          style={props.style}
          data-testid="pro-grid-content"
        >
          <div
            class={clsx(`${prefixCls}-grid-content-children`, hashId)}
            data-testid="pro-grid-content-children"
          >
            {slots.default?.()}
          </div>
        </div>
      )
    }
  },
})

export default GridContent
