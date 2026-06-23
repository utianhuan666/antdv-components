import type { CascaderProps } from 'antdv-next'
import type { FieldCascaderExpose } from '../../../field'
import type { ProFormFieldItemProps, ProFormFieldRemoteProps } from '../../typing'
import { defineComponent, ref } from 'vue'
import { FieldCascader } from '../../../field'
import { ProConfigProvider } from '../../../provider'
import { createRefProxy } from '../../../utils/createRefProxy'
import { useFieldContext } from '../../FieldContext'
import ProFormField from '../Field'
import { proFormFieldPropNames } from '../FormItem/warpField'

export type ProFormCascaderProps = ProFormFieldItemProps<CascaderProps> & ProFormFieldRemoteProps

/**
 * 级联选择框
 */
const ProFormCascader = defineComponent<ProFormCascaderProps>({
  name: 'ProFormCascader',
  inheritAttrs: false,
  props: proFormFieldPropNames,
  setup(rawProps, { expose }) {
    const props = rawProps
    const context = useFieldContext()
    const cascaderRef = ref<FieldCascaderExpose | null>(null)

    expose(createRefProxy<FieldCascaderExpose>(cascaderRef))

    return () => {
      const { fieldProps, request, params, proFieldProps, ...rest } = props

      return (
        <ProConfigProvider
          valueTypeMap={{
            cascader: {
              render: (text, currentProps) => (
                <FieldCascader
                  {...currentProps}
                  text={text}
                  placeholder={currentProps.placeholder as string}
                />
              ),
              formItemRender: (text, currentProps) => (
                <FieldCascader
                  {...currentProps}
                  text={text}
                  placeholder={currentProps.placeholder as string}
                />
              ),
            },
          }}
        >
          <ProFormField
            ref={cascaderRef}
            {...rest}
            valueType="cascader"
            fieldProps={{
              getPopupContainer: context.getPopupContainer,
              ...fieldProps,
            }}
            request={request}
            params={params}
            customLightMode
            proFieldProps={proFieldProps}
          />
        </ProConfigProvider>
      )
    }
  },
})

export default ProFormCascader
