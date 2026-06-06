import type { CSSProperties, PropType } from 'vue'
import type { ContentWidth } from '../PageContainer/context'
import { clsx } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent } from 'vue'
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
    const prefixCls = computed(() => props.prefixCls || config.value.getPrefixCls('pro'))
    const className = computed(() => `${prefixCls.value}-grid-content`)
    const { hashId, cssVarCls } = useStyle(className)

    return () => {
      const contentWidth = props.contentWidth || routeContext.contentWidth
      const isWide = contentWidth === 'Fixed' && routeContext.layout === 'top'

      return (
        <div
          class={clsx(className.value, hashId.value, props.class, props.className, {
            [`${className.value}-wide`]: isWide,
          }, cssVarCls.value)}
          style={props.style}
          data-testid="pro-grid-content"
        >
          <div
            class={clsx(`${prefixCls.value}-grid-content-children`, hashId.value, cssVarCls.value)}
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
