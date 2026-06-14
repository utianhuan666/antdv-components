import type { ProFieldFC } from '../../types'
import type { PercentPropInt } from './types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldPercentEdit from './FieldPercentEdit'
import FieldPercentRead from './FieldPercentRead'
import { toNumber } from './util'

export type { PercentPropInt }
type FieldPercentInstance = InstanceType<typeof import('antdv-next')['InputNumber']>
type FieldPercentInnerRef = FieldPercentInstance | HTMLSpanElement
export type FieldPercentExpose = Partial<FieldPercentInstance> & Partial<HTMLSpanElement>
type FieldPercentProps = NonNullable<ProFieldFC<PercentPropInt>['__props']>

/**
 * 百分比组件
 */
const FieldPercent = defineComponent<FieldPercentProps>({
  name: 'FieldPercent',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'placeholder',
    'prefix',
    'suffix',
    'precision',
    'showColor',
    'showSymbol',
  ],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const innerRef = ref<FieldPercentInnerRef | null>(null)

    expose(createRefProxy<FieldPercentInnerRef>(innerRef))

    return () => {
      const props = rawProps as FieldPercentProps
      const {
        text = '',
        mode = 'read',
        render,
        formItemRender,
        fieldProps = {},
        placeholder,
        prefix,
        suffix = '%',
        precision,
        showColor = false,
        showSymbol: propsShowSymbol,
      } = props

      const realValue = typeof text === 'string' && text.includes('%')
        ? toNumber(text.replace('%', ''))
        : toNumber(text)

      const showSymbol = typeof propsShowSymbol === 'function'
        ? propsShowSymbol(text)
        : propsShowSymbol

      const placeholderValue = placeholder || intl.getMessage('tableForm.inputPlaceholder', '请输入')

      if (isProFieldReadMode(mode)) {
        return FieldPercentRead({
          text,
          mode,
          render,
          formItemRender,
          fieldProps,
          placeholder,
          prefix,
          suffix,
          precision,
          showColor,
          showSymbol,
          realValue,
        }, innerRef)
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        return FieldPercentEdit({
          text,
          mode,
          render,
          formItemRender,
          fieldProps,
          placeholder,
          prefix,
          suffix,
          precision,
          showColor,
          showSymbol: propsShowSymbol,
          placeholderValue,
        }, innerRef)
      }

      return null
    }
  },
})

export default FieldPercent
