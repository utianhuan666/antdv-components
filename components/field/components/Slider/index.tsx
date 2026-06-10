import type { SliderProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import { defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSliderEdit from './FieldSliderEdit'
import FieldSliderRead from './FieldSliderRead'

interface FieldSliderFCProps {
  text: string
  fieldProps?: SliderProps
}
type FieldSliderInstance = InstanceType<typeof import('antdv-next')['Slider']>
export type FieldSliderExpose = Partial<FieldSliderInstance>
type FieldSliderProps = NonNullable<ProFieldFC<FieldSliderFCProps>['__props']>

const FieldSlider = defineComponent<FieldSliderProps>({
  name: 'FieldSlider',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
  ],
  setup(rawProps, { expose }) {
    const sliderRef = ref<FieldSliderInstance | null>(null)

    expose(
      new Proxy({} as FieldSliderExpose, {
        get(_target, key: string) {
          return sliderRef.value?.[key as keyof FieldSliderInstance]
        },
        has(_target, key: string) {
          return !!sliderRef.value && key in sliderRef.value
        },
      }),
    )

    return () => {
      const props = rawProps as FieldSliderProps
      const {
        text = '',
        mode = 'read',
        render,
        formItemRender,
        fieldProps = {},
      } = props

      if (isProFieldReadMode(mode)) {
        return FieldSliderRead({
          text,
          mode,
          render,
          formItemRender,
          fieldProps,
        })
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldSliderEdit({
          text,
          mode,
          render,
          formItemRender,
          fieldProps,
        }, sliderRef)
      }

      return null
    }
  },
})

export default FieldSlider as unknown as ProFieldFC<FieldSliderFCProps>
