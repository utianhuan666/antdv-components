import type { PropType, VNodeChild } from 'vue'
import { Button, Popover } from 'antdv-next'
import { defineComponent } from 'vue'

export type FooterRender
  = | ((onConfirm?: (event?: MouseEvent) => void, onClear?: (event?: MouseEvent) => void) => VNodeChild | false)
    | false

export interface FilterFooter {
  onConfirm?: (event?: MouseEvent) => void
  onClear?: (event?: MouseEvent) => void
}

/**
 * 对标 React `src/utils/components/FilterDropdown/index.tsx`：
 * Popover 包裹的轻量筛选下拉，触发器为 `label`，内容由 default 插槽提供，
 * 可附加默认或自定义底部按钮（`确认`/`重置`）。
 */
const FilterDropdown = defineComponent({
  name: 'ProFilterDropdown',
  props: {
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    open: { type: Boolean, default: false },
    placement: { type: String as PropType<any>, default: 'bottomLeft' },
    disabled: { type: Boolean, default: false },
    padding: { type: Number, default: 24 },
    popoverProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    footer: { type: Object as PropType<FilterFooter>, default: undefined },
    footerRender: { type: [Function, Boolean] as PropType<FooterRender>, default: undefined },
  },
  emits: ['update:open', 'openChange'],
  setup(props, { slots, emit }) {
    function renderFooter(): VNodeChild | null {
      if (!props.footer)
        return null
      const { onConfirm, onClear } = props.footer
      if (props.footerRender === false)
        return null
      if (typeof props.footerRender === 'function')
        return props.footerRender(onConfirm, onClear) || null
      return (
        <div class="ant-pro-core-field-dropdown-footer">
          <Button size="small" type="link" onClick={(event: MouseEvent) => onClear?.(event)}>
            重置
          </Button>
          <Button size="small" type="primary" onClick={(event: MouseEvent) => onConfirm?.(event)}>
            确认
          </Button>
        </div>
      )
    }

    return () => (
      <Popover
        trigger={['click']}
        open={props.open}
        placement={props.placement}
        onOpenChange={(open: boolean) => {
          emit('update:open', open)
          emit('openChange', open)
        }}
        {...(props.popoverProps || {})}
      >
        {{
          default: () => (
            <span class="ant-pro-core-field-dropdown-label">
              {props.label}
            </span>
          ),
          content: () => (
            <div class="ant-pro-core-field-dropdown-overlay" style={{ padding: `${props.padding}px` }}>
              <div class="ant-pro-core-field-dropdown-content">
                {slots.default?.()}
              </div>
              {renderFooter()}
            </div>
          ),
        }}
      </Popover>
    )
  },
})

export default FilterDropdown
