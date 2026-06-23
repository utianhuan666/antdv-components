import type { VNodeChild } from 'vue'
import type { LightFilterFooterRender } from '../../../form/typing'
import { clsx } from '@v-c/util'
import { Button } from 'antdv-next'
import { defineComponent } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useStyle } from './style'

type OnClick = (event?: MouseEvent) => void

export interface DropdownFooterProps {
  onClear?: OnClick
  onConfirm?: OnClick
  disabled?: boolean
  footerRender?: LightFilterFooterRender
  children?: VNodeChild
}

export const DropdownFooter = defineComponent<DropdownFooterProps>({
  name: 'ProDropdownFooter',
  props: ['onClear', 'onConfirm', 'disabled', 'footerRender', 'children'],
  setup(rawProps, { slots }) {
    const props = rawProps
    const intl = useIntl()
    const prefixCls = useProPrefixCls('pro-core-dropdown-footer')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const defaultFooter = [
        <Button
          key="clear"
          style={{ visibility: props.onClear ? 'visible' : 'hidden' }}
          type="link"
          size="small"
          disabled={props.disabled}
          onClick={(event: MouseEvent) => {
            props.onClear?.(event)
            event.stopPropagation()
          }}
        >
          {intl.getMessage('form.lightFilter.clear', '清除')}
        </Button>,
        <Button key="confirm" data-type="confirm" type="primary" size="small" onClick={props.onConfirm} disabled={props.disabled}>
          {intl.getMessage('form.lightFilter.confirm', '确认')}
        </Button>,
      ]

      if (props.footerRender === false)
        return null
      const custom = typeof props.footerRender === 'function' ? props.footerRender(props.onConfirm, props.onClear) : undefined
      if (custom === false)
        return null
      const renderDom = custom || slots.default?.() || props.children || defaultFooter

      return wrapSSR(
        <div
          class={clsx(prefixCls.value, hashId)}
          onClick={(event: MouseEvent) => {
            if ((event.target as Element).getAttribute('data-type') !== 'confirm')
              event.stopPropagation()
          }}
        >
          {renderDom}
        </div>,
      )
    }
  },
})

export default DropdownFooter
