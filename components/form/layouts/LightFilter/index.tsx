import type { PopoverProps, TooltipPlacement } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { LightFilterFooterRender } from '../../typing'
import type { ProFormProps } from '../ProForm'
import { FilterOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { defineComponent, ref } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { FieldLabel, FilterDropdown } from '../../../utils'
import BaseForm from '../../BaseForm'
import { cloneElement, flattenChildren, getVNodeChildren, getVNodeProps, getVNodeTypeName, omitKeys } from '../_shared/vueHelpers'
import { lightFilterFieldComponents } from './lightFilterFieldComponents'
import { LightWrapper } from './LightWrapper'
import { useStyle } from './style'

export type LightFilterProps<T = Record<string, any>, U = Record<string, any>> = ProFormProps<T, U> & {
  collapse?: boolean
  collapseLabel?: VNodeChild
  variant?: 'outlined' | 'filled' | 'borderless'
  ignoreRules?: boolean
  footerRender?: LightFilterFooterRender
  placement?: TooltipPlacement
  popoverProps?: Omit<PopoverProps, 'children' | 'content' | 'trigger' | 'open' | 'onOpenChange' | 'placement'>
}

interface LightFilterContainerProps {
  items?: VNodeChild[]
  values?: Record<string, any>
  onValuesChange?: (values: Record<string, any>) => void
  collapse?: boolean
  collapseLabel?: VNodeChild
  variant?: 'outlined' | 'filled' | 'borderless'
  footerRender?: LightFilterFooterRender
  placement?: TooltipPlacement
  popoverProps?: Omit<PopoverProps, 'children' | 'content' | 'trigger' | 'open' | 'onOpenChange' | 'placement'>
  size?: 'small' | 'middle' | 'large'
}

const LightFilterContainer = defineComponent<LightFilterContainerProps>({
  name: 'LightFilterContainer',
  props: ['items', 'values', 'onValuesChange', 'collapse', 'collapseLabel', 'variant', 'footerRender', 'placement', 'popoverProps', 'size'],
  setup(rawProps) {
    const props = rawProps
    const open = ref(false)
    const moreValues = ref<Record<string, any>>({ ...props.values })
    const intl = useIntl()
    const prefixCls = useProPrefixCls('pro-form-light-filter')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const collapseItems: VNodeChild[] = []
      const outsideItems: VNodeChild[] = []
      ;(props.items || []).forEach((item: VNodeChild) => {
        const itemProps = getVNodeProps(item)
        if (itemProps.secondary || props.collapse)
          collapseItems.push(item)
        else
          outsideItems.push(item)
      })

      const collapseLabelNode = props.collapseLabel || (
        props.collapse
          ? <FilterOutlined class={`${prefixCls.value}-collapse-icon`} />
          : <FieldLabel variant={props.variant || 'borderless'} size={props.size || 'middle'} label={intl.getMessage('form.lightFilter.more', '更多筛选')} />
      )

      return wrapSSR(
        <div class={clsx(prefixCls.value, hashId, `${prefixCls.value}-${props.size || 'middle'}`)}>
          <div class={`${prefixCls.value}-container`}>
            {outsideItems.map((child, index) => {
              const childProps = getVNodeProps(child)
              return (
                <div class={`${prefixCls.value}-item`} key={(child as any)?.key || index}>
                  {cloneElement(child, {
                    fieldProps: {
                      ...childProps.fieldProps,
                      placement: childProps.fieldProps?.placement || props.placement,
                      variant: 'borderless',
                    },
                    proFieldProps: {
                      ...childProps.proFieldProps,
                      label: childProps.label,
                      variant: props.variant || 'borderless',
                    },
                    variant: props.variant || 'borderless',
                  })}
                </div>
              )
            })}
            {collapseItems.length
              ? (
                  <div class={`${prefixCls.value}-item`} key="more">
                    <FilterDropdown
                      padding={24}
                      open={open.value}
                      onOpenChange={(nextOpen: boolean) => {
                        open.value = nextOpen
                      }}
                      placement={props.placement}
                      popoverProps={props.popoverProps}
                      label={collapseLabelNode}
                      footerRender={props.footerRender}
                      footer={{
                        onConfirm: () => {
                          props.onValuesChange({ ...moreValues.value })
                          open.value = false
                        },
                        onClear: () => {
                          const clearValues: Record<string, any> = {}
                          collapseItems.forEach((child) => {
                            clearValues[getVNodeProps(child).name] = undefined
                          })
                          props.onValuesChange(clearValues)
                        },
                      }}
                    >
                      {collapseItems.map((child) => {
                        const childProps = getVNodeProps(child)
                        const name = childProps.name
                        const fieldProps = {
                          ...childProps.fieldProps,
                          placement: childProps.fieldProps?.placement || props.placement,
                          variant: props.variant || 'borderless',
                          onChange: (event: any) => {
                            moreValues.value = {
                              ...moreValues.value,
                              [name]: event?.target ? event.target.value : event,
                            }
                            return false
                          },
                        } as Record<string, any>
                        if (Object.prototype.hasOwnProperty.call(moreValues.value, name))
                          fieldProps[childProps.valuePropName || 'value'] = moreValues.value[name]

                        return <div class={`${prefixCls.value}-line`} key={(child as any)?.key || name}>{cloneElement(child, { fieldProps })}</div>
                      })}
                    </FilterDropdown>
                  </div>
                )
              : null}
          </div>
        </div>,
      )
    }
  },
})

const LightFilterComponent = defineComponent({
  name: 'LightFilter',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const formRef = ref<any>()
    const values = ref<Record<string, any>>({ ...((attrs.initialValues as Record<string, any>) || {}) })

    return () => {
      const props = attrs as LightFilterProps
      const rest = omitKeys(props as Record<string, any>, ['labelWidth'])
      return (
        <BaseForm
          {...rest as any}
          formRef={formRef}
          layout="inline"
          formComponentType="LightFilter"
          formItemProps={{ colon: false, labelAlign: 'left' }}
          fieldProps={{ style: { width: undefined } }}
          contentRender={(items: VNodeChild[]) => (
            <LightFilterContainer
              items={flattenChildren(items).flatMap((item) => {
                if (getVNodeTypeName(item) === 'ProForm-Group')
                  return getVNodeChildren(item)
                return item
              })}
              values={values.value}
              variant={props.variant || 'borderless'}
              collapse={props.collapse}
              collapseLabel={props.collapseLabel}
              footerRender={props.footerRender}
              placement={props.placement}
              popoverProps={props.popoverProps}
              size={(props as any).size}
              onValuesChange={(newValues: Record<string, any>) => {
                const nextValues = { ...values.value, ...newValues }
                values.value = nextValues
                formRef.value?.setFieldsValue?.(nextValues)
                formRef.value?.submit?.()
                ;(props.onValuesChange as any)?.(newValues, nextValues)
              }}
            />
          )}
          onValuesChange={(changedValues: Record<string, any>, allValues: Record<string, any>) => {
            values.value = allValues
            ;(props.onValuesChange as any)?.(changedValues, allValues)
            formRef.value?.submit?.()
          }}
        >
          {slots.default?.()}
        </BaseForm>
      )
    }
  },
}) as any

export const LightFilter = Object.assign(LightFilterComponent, lightFilterFieldComponents)
export { LightWrapper }
export default LightFilter
