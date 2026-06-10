import type { ProFieldFC } from '../../types'
import type { FieldImageProps } from './types'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldImageEdit from './FieldImageEdit'
import FieldImageRead from './FieldImageRead'

export type { FieldImageProps }

type FieldImageReadInstance = InstanceType<typeof import('antdv-next')['Image']>
type FieldImageEditInstance = InstanceType<typeof import('antdv-next')['Input']>
type FieldImageInnerRef = FieldImageReadInstance | FieldImageEditInstance
export type FieldImageExpose = Partial<FieldImageReadInstance> & Partial<FieldImageEditInstance>

type FieldImageFieldProps = NonNullable<ProFieldFC<FieldImageProps>['__props']>

/**
 * 图片组件
 */
const FieldImage = defineComponent<FieldImageFieldProps>({
  name: 'FieldImage',
  inheritAttrs: false,
  props: [
    'text',
    'mode',
    'render',
    'formItemRender',
    'fieldProps',
    'placeholder',
    'width',
  ],
  setup(rawProps, { expose }) {
    const intl = useIntl()
    const innerRef = ref<FieldImageInnerRef | null>(null)

    expose(
      new Proxy({} as FieldImageExpose, {
        get(_target, key: string) {
          return innerRef.value?.[key as keyof FieldImageInnerRef]
        },
        has(_target, key: string) {
          return innerRef.value ? key in innerRef.value : false
        },
      }),
    )

    return () => {
      const props = rawProps as FieldImageFieldProps
      const text = props.text ?? ''
      const mode = props.mode ?? 'read'

      if (isProFieldReadMode(mode)) {
        return FieldImageRead({
          text,
          mode,
          render: props.render,
          formItemRender: props.formItemRender,
          fieldProps: props.fieldProps,
          placeholder: props.placeholder,
          width: props.width,
        }, innerRef)
      }

      if (isProFieldEditOrUpdateMode(mode)) {
        const placeholderValue = (Array.isArray(props.placeholder) ? props.placeholder[0] : props.placeholder) || intl.getMessage('tableForm.inputPlaceholder', '请输入')
        return FieldImageEdit({
          text,
          mode,
          render: props.render,
          formItemRender: props.formItemRender,
          fieldProps: props.fieldProps,
          placeholder: props.placeholder,
          width: props.width,
          placeholderValue,
        }, innerRef)
      }

      return null
    }
  },
})

export default FieldImage
