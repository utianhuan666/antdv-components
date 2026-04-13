import type { PropType } from 'vue'
import { InputNumber, Popover } from 'antdv-next'
import { defineComponent, ref, watch } from 'vue'

export type InputNumberPopoverProps = Record<string, any> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onBlur?: (e: FocusEvent) => void
  contentRender?: (props: Record<string, any>) => JSX.Element | null
  numberFormatOptions?: any
  numberPopoverRender?: any
}

export default defineComponent({
  name: 'InputNumberPopover',
  props: {
    open: { type: Boolean, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    contentRender: { type: Function as PropType<(props: Record<string, any>) => JSX.Element | null>, default: undefined },
    numberFormatOptions: { type: Object, default: undefined },
    numberPopoverRender: { type: [Function, Boolean], default: undefined },
    // InputNumber props pass-through
    value: { type: [Number, String] as PropType<number | string>, default: undefined },
    defaultValue: { type: [Number, String] as PropType<number | string>, default: undefined },
    onChange: { type: Function as PropType<(value: any) => void>, default: undefined },
    onBlur: { type: Function as PropType<(e: FocusEvent) => void>, default: undefined },
  },
  setup(props, { attrs }) {
    const localValue = ref(props.value ?? props.defaultValue)
    const localOpen = ref(props.open ?? false)

    watch(() => props.value, (val) => {
      if (val !== undefined)
        localValue.value = val
    })

    watch(() => props.open, (val) => {
      if (val !== undefined)
        localOpen.value = val
    })

    const handleChange = (val: any) => {
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
      const dom = props.contentRender?.({ ...attrs, value: localValue.value })

      if (!dom) {
        return (
          <InputNumber
            {...attrs}
            value={localValue.value}
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
          content={dom}
          getPopupContainer={(triggerNode: HTMLElement) => {
            return triggerNode?.parentElement || document.body
          }}
        >
          <InputNumber
            {...attrs}
            value={localValue.value}
            onChange={handleChange}
            onBlur={props.onBlur}
          />
        </Popover>
      )
    }
  },
})
