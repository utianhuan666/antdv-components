import type { SwitchProps } from 'antdv-next'
import type { ProFieldFC } from '../../types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldSwitchEdit from './FieldSwitchEdit'
import FieldSwitchLightEdit from './FieldSwitchLightEdit'
import FieldSwitchRead from './FieldSwitchRead'

interface FieldSwitchFCProps {
  text: boolean
  fieldProps?: SwitchProps & {
    variant?: 'outlined' | 'borderless' | 'filled'
  }
  variant?: 'outlined' | 'borderless' | 'filled'
}
type FieldSwitchInstance = InstanceType<typeof import('antdv-next')['Switch']>
export type FieldSwitchExpose = Partial<FieldSwitchInstance>
type FieldSwitchProps = NonNullable<ProFieldFC<FieldSwitchFCProps>['__props']>

const FieldSwitch = defineComponent<FieldSwitchProps>({
  name: 'FieldSwitch',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'light',
    'label',
    'formItemRender',
    'fieldProps',
    'variant',
  ],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const switchRef = ref<FieldSwitchInstance | null>(null)

    expose(createRefProxy<FieldSwitchInstance>(switchRef))

    return () => {
      const props = rawProps as FieldSwitchProps
      const {
        text,
        mode,
        render,
        light,
        label,
        formItemRender,
        fieldProps,
        variant: propsVariant,
      } = props
      const variant = propsVariant ?? fieldProps?.variant
      const readLabel = text === undefined || text === null || `${text}`.length < 1
        ? '-'
        : text
          ? (fieldProps?.checkedChildren ?? intl.getMessage('switch.open', '打开'))
          : (fieldProps?.unCheckedChildren ?? intl.getMessage('switch.close', '关闭'))

      if (isProFieldReadMode(mode)) {
        return FieldSwitchRead({
          text,
          mode,
          render,
          formItemRender,
          fieldProps,
          light,
          label,
          readLabel,
        })
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        const editProps = {
          text,
          mode,
          render,
          label,
          formItemRender,
          fieldProps,
          variant,
        }

        if (light)
          return FieldSwitchLightEdit(editProps, switchRef)

        return FieldSwitchEdit(editProps, switchRef)
      }

      return null
    }
  },
})

export default FieldSwitch as unknown as ProFieldFC<FieldSwitchFCProps>
