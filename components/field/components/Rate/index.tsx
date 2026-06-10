import type { RateProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import { defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldRateEdit from './FieldRateEdit'
import FieldRateRead from './FieldRateRead'

interface FieldRateFCProps {
  text: string
  fieldProps?: RateProps
}
type FieldRateInstance = InstanceType<typeof import('antdv-next')['Rate']>
export type FieldRateExpose = Partial<FieldRateInstance>
type FieldRateProps = NonNullable<ProFieldFC<FieldRateFCProps>['__props']>

const FieldRate = defineComponent<FieldRateProps>({
  name: 'FieldRate',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
  ],
  setup(rawProps, { expose }) {
    const rateRef = ref<FieldRateInstance | null>(null)

    expose(
      new Proxy({} as FieldRateExpose, {
        get(_target, key: string) {
          return rateRef.value?.[key as keyof FieldRateInstance]
        },
        has(_target, key: string) {
          return !!rateRef.value && key in rateRef.value
        },
      }),
    )

    return () => {
      const props = rawProps as FieldRateProps
      const mergedProps: FieldRateProps = {
        ...props,
        text: props.text ?? '',
        mode: props.mode ?? 'read',
        fieldProps: props.fieldProps ?? {},
      }

      if (isProFieldReadMode(mergedProps.mode))
        return FieldRateRead(mergedProps, rateRef)

      if (isProFieldEditOrUpdateMode(mergedProps.mode))
        return FieldRateEdit(mergedProps, rateRef)

      return null
    }
  },
})

export default FieldRate
