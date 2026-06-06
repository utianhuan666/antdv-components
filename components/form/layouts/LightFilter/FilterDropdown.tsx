import type { PopoverProps, TooltipPlacement } from 'antdv-next'
import type { VNodeChild } from 'vue'
import { Button, Popover } from 'antdv-next'
import { defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'

export type FooterRender
  = | ((onConfirm?: (event?: MouseEvent) => void, onClear?: (event?: MouseEvent) => void) => VNodeChild | false)
    | false

export interface FilterFooter {
  onConfirm?: (event?: MouseEvent) => void
  onClear?: (event?: MouseEvent) => void
}

export interface FilterDropdownProps {
  label?: VNodeChild
  open?: boolean
  placement?: TooltipPlacement
  disabled?: boolean
  padding?: number
  popoverProps?: Omit<PopoverProps, 'children' | 'content' | 'trigger' | 'open' | 'onOpenChange' | 'placement'>
  footer?: FilterFooter
  footerRender?: FooterRender
}

const filterDropdownPropNames = [
  'label',
  'open',
  'placement',
  'disabled',
  'padding',
  'popoverProps',
  'footer',
  'footerRender',
] as const

function resolveBoolean(value: unknown, fallback = false) {
  if (value === undefined)
    return fallback
  return value === '' || value === true
}

/**
 * 对标 React `src/utils/components/FilterDropdown/index.tsx`：
 * Popover 包裹的轻量筛选下拉，触发器为 `label`，内容由 default 插槽提供，
 * 可附加默认或自定义底部按钮（`确认`/`清除`）。
 */
const FilterDropdown = defineComponent({
  name: 'ProFilterDropdown',
  props: [...filterDropdownPropNames],
  emits: ['update:open', 'openChange'],
  setup(rawProps, { slots, emit }) {
    const props = rawProps as Readonly<FilterDropdownProps>
    const prefixCls = useProPrefixCls('pro-core-field-dropdown')

    function renderFooter(): VNodeChild | null {
      if (!props.footer)
        return null
      const { onConfirm, onClear } = props.footer
      if (props.footerRender === false)
        return null
      if (typeof props.footerRender === 'function')
        return props.footerRender(onConfirm, onClear) || null
      return (
        <div class={`${prefixCls.value}-footer`}>
          <Button size="small" type="link" onClick={(event: MouseEvent) => onClear?.(event)}>
            清除
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
        open={resolveBoolean(props.open, false)}
        placement={props.placement ?? 'bottomLeft'}
        onOpenChange={(open: boolean) => {
          emit('update:open', open)
          emit('openChange', open)
        }}
        {...(props.popoverProps || {})}
      >
        {{
          default: () => (
            <span class={`${prefixCls.value}-label`}>
              {props.label}
            </span>
          ),
          content: () => (
            <div class={`${prefixCls.value}-overlay`} style={{ padding: `${props.padding ?? 24}px` }}>
              <div class={`${prefixCls.value}-content`}>
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
