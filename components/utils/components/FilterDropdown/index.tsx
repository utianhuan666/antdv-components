import type { PopoverProps, TooltipPlacement } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { DropdownFooterProps } from '../DropdownFooter'
import { clsx } from '@v-c/util'
import { Popover } from 'antdv-next'
import { defineComponent, ref } from 'vue'
import { DropdownFooter } from '../DropdownFooter'

export type FooterRender = ((onConfirm?: (e?: MouseEvent) => void, onClear?: (e?: MouseEvent) => void) => VNodeChild | false) | false

export interface DropdownProps {
  label?: VNodeChild
  footer?: DropdownFooterProps
  footerRender?: FooterRender
  padding?: number
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
  placement?: TooltipPlacement
  popoverProps?: Omit<PopoverProps, 'children' | 'content' | 'trigger' | 'open' | 'onOpenChange' | 'placement'>
  children?: VNodeChild
}

export const FilterDropdown = defineComponent({
  name: 'ProFilterDropdown',
  props: ['label', 'footer', 'footerRender', 'padding', 'disabled', 'onOpenChange', 'open', 'placement', 'popoverProps', 'children'],
  emits: ['update:open', 'openChange'],
  setup(rawProps, { slots, emit }) {
    const props = rawProps as DropdownProps
    const htmlRef = ref<HTMLDivElement | null>(null)

    return () => (
      <Popover
        {...(props.popoverProps || {})}
        placement={props.placement}
        trigger={['click']}
        open={props.open || false}
        onOpenChange={(open: boolean) => {
          props.onOpenChange?.(open)
          emit('update:open', open)
          emit('openChange', open)
        }}
        styles={{
          container: {
            padding: 0,
            ...((props.popoverProps?.styles as any)?.container || {}),
          },
          ...(props.popoverProps?.styles || {}),
        }}
      >
        {{
          default: () => <span class="ant-pro-core-field-dropdown-label">{props.label}</span>,
          content: () => (
            <div
              ref={htmlRef}
              class={clsx('ant-pro-core-field-dropdown-overlay', {
                [`ant-pro-core-field-dropdown-overlay-${props.placement}`]: props.placement,
              })}
            >
              <div class="ant-pro-core-field-dropdown-content" style={{ padding: props.padding }}>{slots.default?.() || props.children}</div>
              {props.footer
                ? (
                    <DropdownFooter
                      disabled={props.disabled}
                      footerRender={props.footerRender}
                      {...props.footer}
                    />
                  )
                : null}
            </div>
          ),
        }}
      </Popover>
    )
  },
})

export default FilterDropdown
