import type { FormProps, PopoverProps } from 'antdv-next'
import type { TooltipPlacement } from 'antdv-next/dist/tooltip'
import type { VNodeChild } from 'vue'
import type { CommonFormProps, ProFormInstance } from '../../BaseForm'
import type { LightFilterFooterRender } from '../../typing'
import { FilterOutlined } from '@antdv-next/icons'
import { clsx, omit } from '@v-c/util'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, ref, watch } from 'vue'
import { useIntl } from '../../../provider'
import { FieldLabel, FilterDropdown } from '../../../utils'
import BaseForm from '../../BaseForm'
import { cloneElement, getVNodeChildren, getVNodeTypeName, setRefValue } from '../_shared/vueHelpers'
import { lightFilterFieldComponents } from './lightFilterFieldComponents'
import { LightWrapper } from './LightWrapper'
import { useStyle } from './style'

export type LightFilterLayoutProps<T = Record<string, any>, U = Record<string, any>> = {
  collapse?: boolean
  collapseLabel?: VNodeChild
  variant?: 'outlined' | 'filled' | 'borderless'
  ignoreRules?: boolean
  footerRender?: LightFilterFooterRender
  placement?: TooltipPlacement
  popoverProps?: Omit<
    PopoverProps,
    'children' | 'content' | 'trigger' | 'open' | 'onOpenChange' | 'placement'
  >
} & Omit<FormProps, 'onFinish'> & CommonFormProps<T, U>

interface LightFilterContainerProps {
  items: VNodeChild[]
  prefixCls: string
  size?: 'small' | 'middle' | 'large'
  values: Record<string, any>
  onValuesChange: (values: Record<string, any>) => void
  collapse?: boolean
  collapseLabel?: VNodeChild
  variant?: 'outlined' | 'filled' | 'borderless'
  footerRender?: LightFilterFooterRender
  placement?: TooltipPlacement
  popoverProps?: Omit<
    PopoverProps,
    'children' | 'content' | 'trigger' | 'open' | 'onOpenChange' | 'placement'
  >
}

interface FormGroupVNode {
  type?: { displayName?: string, name?: string } | string
  props?: Record<string, unknown> & {
    secondary?: boolean
    fieldProps?: Record<string, unknown> & { placement?: TooltipPlacement }
    proFieldProps?: Record<string, unknown>
    label?: VNodeChild
    name?: string
    valuePropName?: string
  }
  key?: string | number | null
}

const LightFilterContainer = defineComponent<LightFilterContainerProps>({
  name: 'LightFilterContainer',
  props: [
    'items',
    'prefixCls',
    'size',
    'values',
    'onValuesChange',
    'collapse',
    'collapseLabel',
    'variant',
    'footerRender',
    'placement',
    'popoverProps',
  ],
  setup(rawProps) {
    const props = rawProps
    const intl = useIntl()
    const lightFilterClassName = computed(() => `${props.prefixCls}-light-filter`)
    const { wrapSSR, hashId } = useStyle(lightFilterClassName.value)

    const open = ref(false)
    const moreValues = ref<Record<string, any>>({
      ...props.values,
    })

    watch(
      () => props.values,
      (value) => {
        moreValues.value = {
          ...value,
        }
      },
      { deep: true },
    )

    const collapseLabelNode = computed(() => {
      if (props.collapseLabel)
        return props.collapseLabel
      if (props.collapse) {
        return (
          <FilterOutlined
            class={clsx(`${lightFilterClassName.value}-collapse-icon`, hashId)}
          />
        )
      }
      return (
        <FieldLabel
          variant={props.variant}
          size={props.size}
          label={intl.getMessage('form.lightFilter.more', '更多筛选')}
        />
      )
    })

    const collapseItems = computed(() => {
      const collapseItemsArr: VNodeChild[] = []
      props.items.forEach((item) => {
        const typedItem = item as FormGroupVNode
        const { secondary } = typedItem?.props || {}
        if (secondary || props.collapse)
          collapseItemsArr.push(item)
      })
      return collapseItemsArr
    })

    const outsideItems = computed(() => {
      const outsideItemsArr: VNodeChild[] = []
      props.items.forEach((item) => {
        const typedItem = item as FormGroupVNode
        const { secondary } = typedItem?.props || {}
        if (!(secondary || props.collapse))
          outsideItemsArr.push(item)
      })
      return outsideItemsArr
    })

    const isEffective = computed(() =>
      Object.keys(props.values || {}).some((key) => {
        const value = props.values[key]
        return Array.isArray(value) ? value.length > 0 : value
      }))

    return () => wrapSSR(
      <div
        class={clsx(
          lightFilterClassName.value,
          hashId,
          `${lightFilterClassName.value}-${props.size || 'middle'}`,
          {
            [`${lightFilterClassName.value}-effective`]: isEffective.value,
          },
        )}
      >
        <div class={clsx(`${lightFilterClassName.value}-container`, hashId)}>
          {outsideItems.value.map((child, index) => {
            const typedChild = child as FormGroupVNode
            if (!typedChild?.props)
              return child
            const { key } = typedChild
            const { fieldProps } = typedChild.props || {}
            const newPlacement = fieldProps?.placement
              ? fieldProps.placement
              : props.placement

            return (
              <div
                class={clsx(`${lightFilterClassName.value}-item`, hashId)}
                key={key ?? index}
              >
                {typedChild && typeof typedChild === 'object'
                  ? (
                      cloneElement(child, {
                        ...typedChild.props,
                        fieldProps: {
                          ...typedChild.props.fieldProps,
                          placement: newPlacement,
                          variant: 'borderless',
                        },
                        proFieldProps: {
                          ...typedChild.props.proFieldProps,
                          label: typedChild.props.label,
                          variant: props.variant,
                        },
                        variant: props.variant,
                      })
                    )
                  : child}
              </div>
            )
          })}
          {collapseItems.value.length
            ? (
                <div
                  class={clsx(`${lightFilterClassName.value}-item`, hashId)}
                  key="more"
                >
                  <FilterDropdown
                    padding={24}
                    open={open.value}
                    onOpenChange={(changeOpen: boolean) => {
                      open.value = changeOpen
                    }}
                    placement={props.placement}
                    popoverProps={props.popoverProps}
                    label={collapseLabelNode.value}
                    footerRender={props.footerRender}
                    footer={{
                      onConfirm: () => {
                        props.onValuesChange({
                          ...moreValues.value,
                        })
                        open.value = false
                      },
                      onClear: () => {
                        const clearValues: Record<string, any> = {}
                        collapseItems.value.forEach((child) => {
                          const typedChild = child as FormGroupVNode
                          const { name } = typedChild.props || {}
                          if (typeof name === 'string')
                            clearValues[name] = undefined
                        })
                        props.onValuesChange(clearValues)
                      },
                    }}
                  >
                    {collapseItems.value.map((child) => {
                      const typedChild = child as FormGroupVNode
                      const { key } = typedChild
                      const { name, fieldProps } = typedChild.props || {}
                      const newFieldProps = {
                        ...fieldProps,
                        onChange: (e: unknown) => {
                          if (typeof name !== 'string')
                            return false
                          moreValues.value = {
                            ...moreValues.value,
                            [name]: getEventValue(e),
                          }
                          return false
                        },
                      } as Record<string, unknown>
                      if (
                        typeof name === 'string'
                        && Object.prototype.hasOwnProperty.call(moreValues.value, name)
                      ) {
                        newFieldProps[typedChild.props?.valuePropName || 'value'] = moreValues.value[name]
                      }

                      const newPlacement = fieldProps?.placement
                        ? fieldProps.placement
                        : props.placement
                      return (
                        <div
                          class={clsx(`${lightFilterClassName.value}-line`, hashId)}
                          key={key ?? (typeof name === 'string' ? name : undefined)}
                        >
                          {cloneElement(child, {
                            ...typedChild.props,
                            fieldProps: {
                              ...newFieldProps,
                              placement: newPlacement,
                              variant: props.variant,
                            },
                          })}
                        </div>
                      )
                    })}
                  </FilterDropdown>
                </div>
              )
            : null}
        </div>
      </div>,
    )
  },
})

const LightFilterComponent = defineComponent(
  (props: LightFilterLayoutProps) => {
    const config = useConfig()
    const prefixCls = computed(() => config.value.getPrefixCls('pro-form'))
    const values = ref<Record<string, any>>({
      ...(props.initialValues as Record<string, any>),
    })
    const formRef = ref<ProFormInstance>()

    watch(
      () => props.initialValues as Record<string, any> | undefined,
      (nextInitialValues) => {
        values.value = { ...(nextInitialValues || {}) }
      },
      { deep: true },
    )

    watch(
      formRef,
      form => setRefValue(props.formRef, form),
      { immediate: true },
    )

    return () => {
      const {
        size,
        collapse,
        collapseLabel,
        initialValues,
        onValuesChange,
        placement,
        formRef: _userFormRef,
        variant,
        footerRender,
        popoverProps,
        ...reset
      } = props as LightFilterLayoutProps

      return (
        <BaseForm
          size={size}
          formComponentType="LightFilter"
          initialValues={initialValues}
          contentRender={(items: VNodeChild[]) => (
            <LightFilterContainer
              key={JSON.stringify(values.value || {})}
              prefixCls={prefixCls.value}
              items={items?.flatMap((item) => {
                const typedItem = item as FormGroupVNode
                if (!typedItem || !typedItem?.type)
                  return item
                if (getVNodeTypeName(item) === 'ProForm-Group')
                  return getVNodeChildren(item)
                return item
              })}
              size={size as 'small' | 'middle' | 'large' | undefined}
              variant={variant || 'borderless'}
              collapse={collapse}
              collapseLabel={collapseLabel}
              placement={placement}
              popoverProps={popoverProps}
              values={values.value || {}}
              footerRender={footerRender}
              onValuesChange={(newValues: Record<string, any>) => {
                const newAllValues = {
                  ...values.value,
                  ...newValues,
                }
                values.value = newAllValues
                formRef.value?.setFieldsValue?.(newAllValues)
                formRef.value?.submit?.()
                onValuesChange?.(newValues, newAllValues)
              }}
            />
          )}
          formRef={formRef}
          formItemProps={{
            colon: false,
            labelAlign: 'left',
          }}
          fieldProps={{
            style: {
              width: undefined,
            },
          }}
          {...omit(reset as Record<string, unknown>, ['labelWidth'])}
          onValuesChange={(_: Record<string, any>, allValues: Record<string, any>) => {
            values.value = allValues
            onValuesChange?.(_, allValues)
            formRef.value?.submit?.()
          }}
        />
      )
    }
  },
  {
    name: 'LightFilter',
    inheritAttrs: false,
  },
)

export const LightFilter = Object.assign(LightFilterComponent, lightFilterFieldComponents)
;(LightFilter as { displayName?: string }).displayName = 'LightFilter'
export { LightWrapper }
export default LightFilter
export type { LightFilterLayoutProps as LightFilterProps }

function getEventValue(event: unknown) {
  if (event && typeof event === 'object' && 'target' in event) {
    const target = (event as { target?: { value?: unknown } }).target
    if (target && typeof target === 'object' && 'value' in target)
      return target.value
  }
  return event
}
