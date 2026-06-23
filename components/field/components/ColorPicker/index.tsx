import type { ColorPickerProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import { defineComponent, ref } from 'vue'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldColorPickerEdit from './FieldColorPickerEdit'
import FieldColorPickerRead from './FieldColorPickerRead'

export type FieldColorPickerOwnProps = {
  text: string
  mode?: 'read' | 'edit' | 'update'
} & Partial<Omit<ColorPickerProps, 'value' | 'mode'>>

type FieldColorPickerInstance = InstanceType<typeof import('antdv-next')['ColorPicker']>
export type FieldColorPickerExpose = Partial<FieldColorPickerInstance>

export type FieldColorPickerProps = NonNullable<ProFieldFC<FieldColorPickerOwnProps>['__props']>

/**
 * 颜色组件
 * Antd > 5.5.0 的版本 使用 antd 的 ColorPicker
 */
const FieldColorPicker = defineComponent<FieldColorPickerProps>({
  name: 'FieldColorPicker',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
  ],
  setup(rawProps, { expose }) {
    const props = rawProps as FieldColorPickerProps
    const innerRef = ref<FieldColorPickerInstance | null>(null)

    expose(createRefProxy<FieldColorPickerInstance>(innerRef))

    return () => {
      const text = props.text ?? ''
      const mode = props.mode ?? 'read'

      if (isProFieldReadMode(mode)) {
        return FieldColorPickerRead({ ...props, text, mode })
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldColorPickerEdit({ ...props, text, mode }, innerRef)
      }

      return null
    }
  },
})

export default FieldColorPicker
