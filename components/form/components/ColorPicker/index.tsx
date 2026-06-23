import type { ColorPickerProps, PopoverProps } from 'antdv-next'
import type { ComponentPublicInstance } from 'vue'
import type { FieldColorPickerExpose } from '../../../field'
import type { ProFormFieldItemProps, ProFormFieldRuntimeProps } from '../../typing'
import { defineComponent, ref } from 'vue'
import { FieldColorPicker } from '../../../field'
import { createRefProxy } from '../../../utils/createRefProxy'
import { useFieldContext } from '../../FieldContext'
import { mergeFieldProps, renderFormItem } from '../_util'
import { proFormFieldPropNames } from '../FormItem/warpField'

type ProFormColorPickerPopoverProps = Partial<Pick<
  PopoverProps,
  'getPopupContainer' | 'autoAdjustOverflow' | 'destroyOnHidden'
>>

const colorPickerPropNames = [...proFormFieldPropNames, 'popoverProps', 'colors', 'onUpdate:value']

export type ProFormColorPickerProps = ProFormFieldItemProps<ColorPickerProps, FieldColorPickerExpose> & {
  popoverProps?: ProFormColorPickerPopoverProps
  colors?: string[]
}

type ProFormColorPickerRuntimeProps = ProFormFieldRuntimeProps<ColorPickerProps, FieldColorPickerExpose> & {
  'popoverProps'?: ProFormColorPickerPopoverProps
  'colors'?: string[]
  'onUpdate:value'?: (nextValue: ColorPickerProps['value']) => void
}

type FieldColorPickerComponentRef = ComponentPublicInstance & FieldColorPickerExpose

export const ProFormColorPicker = defineComponent<ProFormColorPickerProps>({
  name: 'ProFormColorPicker',
  inheritAttrs: false,
  props: colorPickerPropNames,
  setup(rawProps, { expose }) {
    const props = rawProps as ProFormColorPickerRuntimeProps
    const fieldContext = useFieldContext()
    const innerRef = ref<FieldColorPickerComponentRef | null>(null)

    expose(createRefProxy<FieldColorPickerComponentRef>(innerRef))

    return () => {
      const current: ProFormColorPickerRuntimeProps = {
        ...props,
        valueType: 'color' as const,
        fieldProps: {
          ...props.popoverProps,
          ...(props.colors === undefined ? {} : { presets: [{ label: 'Recommended', colors: props.colors }] }),
          ...(props.fieldProps || {}),
        },
      }
      const mergedFieldProps = mergeFieldProps(current, {}, fieldContext)
      const domFieldProps: Record<string, any> = {
        'width': '100%',
        ...mergedFieldProps,
        'onUpdate:value': (nextValue: any) => {
          ;(mergedFieldProps as Record<string, any>)['onUpdate:value']?.(nextValue)
          mergedFieldProps.onChange?.(nextValue)
        },
      }
      const dom = (
        <FieldColorPicker
          ref={innerRef}
          text={domFieldProps.value}
          mode={current.readonly ? 'read' : current.proFieldProps?.mode || current.mode || 'edit'}
          render={current.render as any}
          formItemRender={current.formItemRender as any}
          fieldProps={domFieldProps}
        />
      )

      return renderFormItem(current, dom)
    }
  },
})
export default ProFormColorPicker
