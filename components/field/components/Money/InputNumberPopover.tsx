import type { InputNumberProps, PopoverProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { FieldMoneyProps } from './types'
import { InputNumber, Popover } from 'antdv-next'
import { computed, defineComponent, ref, watch } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'

export type InputNumberPopoverContentProps = InputNumberProps & {
  value?: InputNumberProps['value']
}

export type InputNumberPopoverProps = InputNumberProps & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentRender?: (props: InputNumberPopoverContentProps) => VNodeChild
  numberFormatOptions?: FieldMoneyProps['numberFormatOptions']
  numberPopoverRender?: FieldMoneyProps['numberPopoverRender']
}

type InputNumberPopoverExpose = Partial<InstanceType<typeof InputNumber>>
type InputNumberValue = InputNumberProps['value']
type InputNumberChangeValue = Parameters<NonNullable<InputNumberProps['onChange']>>[0]

export default defineComponent({
  name: 'InputNumberPopover',
  inheritAttrs: false,
  props: [
    'open',
    'onOpenChange',
    'contentRender',
    'numberFormatOptions',
    'numberPopoverRender',
    'value',
    'defaultValue',
    'onChange',
    'onBlur',
  ],
  setup(props, { attrs, expose }) {
    const typedProps = props as unknown as InputNumberPopoverProps
    const localValue = ref<InputNumberValue>(typedProps.value ?? typedProps.defaultValue)
    const localOpen = ref(typedProps.open ?? false)
    const inputRef = ref<InstanceType<typeof InputNumber> | null>(null)

    expose(createRefProxy<InstanceType<typeof InputNumber>>(inputRef))
    const mergedValue = computed(() => typedProps.value !== undefined ? typedProps.value : localValue.value)

    watch(() => typedProps.value, (val) => {
      if (typedProps.value !== undefined)
        localValue.value = val
    })

    watch(() => typedProps.open, (val) => {
      if (val !== undefined)
        localOpen.value = val
    })

    const handleChange = (val: InputNumberChangeValue) => {
      if (typedProps.value === undefined)
        localValue.value = val
      typedProps.onChange?.(val)
    }

    const handleOpenChange = (visible: boolean) => {
      typedProps.onOpenChange?.(visible)
      if (typedProps.open === undefined) {
        localOpen.value = visible
      }
    }

    return () => {
      const dom = typedProps.contentRender?.({ ...attrs, value: mergedValue.value } as InputNumberPopoverContentProps)

      if (!dom) {
        return (
          <InputNumber
            ref={inputRef}
            {...attrs}
            value={mergedValue.value}
            onChange={handleChange}
            onBlur={typedProps.onBlur}
          />
        )
      }

      return (
        <Popover
          placement="topLeft"
          open={localOpen.value}
          onOpenChange={handleOpenChange}
          trigger={['focus', 'click']}
          content={dom as PopoverProps['content']}
          getPopupContainer={(triggerNode: HTMLElement) => {
            return triggerNode?.parentElement || document.body
          }}
        >
          <InputNumber
            ref={inputRef}
            {...attrs}
            value={mergedValue.value}
            onChange={handleChange}
            onBlur={typedProps.onBlur}
          />
        </Popover>
      )
    }
  },
})
