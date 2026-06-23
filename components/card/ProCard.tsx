import type { CardProps } from './typing'
import { defineComponent } from 'vue'
import Card from './components/Card'
import Divider from './components/Divider'

export type ProCardProps = CardProps
export type ProCardType = typeof Card & {
  isProCard: boolean
  Divider: typeof Divider
  Group: typeof Group
}

const Group = defineComponent({
  name: 'ProCardGroup',
  inheritAttrs: false,
  props: (Card as any).props,
  emits: ['collapse', 'click', 'checked'],
  setup(props, { attrs, emit, slots }) {
    return () => (
      <Card
        {...attrs}
        {...props}
        styles={{ ...(props as CardProps).styles, body: { ...(props as CardProps).styles?.body, padding: 0 } }}
        onCollapse={(value: boolean) => emit('collapse', value)}
        onClick={(event: MouseEvent) => emit('click', event)}
        onChecked={(event: MouseEvent) => emit('checked', event)}
      >
        {slots.default?.()}
      </Card>
    )
  },
})

;(Group as any).isProCard = true

const ProCard = Object.assign(Card, {
  isProCard: true,
  Divider,
  Group,
}) as ProCardType

export default ProCard
