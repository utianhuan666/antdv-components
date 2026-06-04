import type { PropType, VNodeChild } from 'vue'
import { InputNumber, Popover } from 'antdv-next'
import { computed, defineComponent, ref, watch } from 'vue'

export type InputNumberPopoverProps = Record<string, any> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onBlur?: (e: FocusEvent) => void
  contentRender?: (props: Record<string, any>) => VNodeChild
  numberFormatOptions?: any
  numberPopoverRender?: any
}

export default defineComponent({
  name: 'InputNumberPopover',
  props: {
    open: { type: Boolean, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    contentRender: { type: Function as PropType<(props: Record<string, any>) => VNodeChild>, default: undefined },
    numberFormatOptions: { type: Object, default: undefined },
    numberPopoverRender: { type: [Function, Boolean], default: undefined },
    // InputNumber props pass-through
    value: { type: [Number, String] as PropType<number | string>, default: undefined },
    defaultValue: { type: [Number, String] as PropType<number | string>, default: undefined },
    precision: { type: Number, default: undefined },
    onChange: { type: Function as PropType<(value: any) => void>, default: undefined },
    onBlur: { type: Function as PropType<(e: FocusEvent) => void>, default: undefined },
  },
  setup(props, { attrs }) {
    const localValue = ref(props.value ?? props.defaultValue)
    const localOpen = ref(props.open ?? false)
    const mergedValue = computed(() => props.value !== undefined ? props.value : localValue.value)

    watch(() => props.value, (val) => {
      if (props.value !== undefined)
        localValue.value = val
    })

    watch(() => props.open, (val) => {
      if (val !== undefined)
        localOpen.value = val
    })

    const handleChange = (val: any) => {
      if (props.value === undefined)
        localValue.value = val
      props.onChange?.(val)
    }

    const handleOpenChange = (visible: boolean) => {
      props.onOpenChange?.(visible)
      if (props.open === undefined) {
        localOpen.value = visible
      }
    }

    return () => {
      const dom = props.contentRender?.({ ...attrs, value: mergedValue.value })

      if (!dom) {
        return (
          <InputNumber
            {...attrs}
            value={mergedValue.value}
            onChange={handleChange}
            onBlur={props.onBlur}
          />
        )
      }

      return (
        <Popover
          placement="topLeft"
          open={localOpen.value}
          onOpenChange={handleOpenChange}
          trigger={['focus', 'click']}
          content={dom as any}
          getPopupContainer={(triggerNode: HTMLElement) => {
            return triggerNode?.parentElement || document.body
          }}
        >
          <InputNumber
            {...attrs}
            value={mergedValue.value}
            onChange={handleChange}
            onBlur={props.onBlur}
          />
        </Popover>
      )
    }
  },
})
