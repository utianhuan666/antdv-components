import type { VNodeChild } from 'vue'
import type { SelectProps } from 'antdv-next'
import type { ProFieldLightProps } from '../../../types'
import type { RequestOptionsType } from '../types'
import { SearchOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Input, Select } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import FieldLabel from '../../../../form/layouts/LightFilter/FieldLabel'

function getValueOrLabel(valueMap: Record<string, VNodeChild>, value: LightSelectProps['value']): VNodeChild {
  if (Array.isArray(value))
    return value.map(item => getValueOrLabel(valueMap, item)).join(',')
  if (value && typeof value === 'object')
    return valueMap[value.value] || value.label
  return valueMap[value] || value
}

export type LightSelectProps = {
  label?: string
  placeholder?: any
  valueMaxLength?: number
  style?: Record<string, any>
  className?: string
  fetchData: (keyWord?: string) => void
  fetchDataOnSearch?: boolean
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  labelVariant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
} & ProFieldLightProps & SelectProps

const lightSelectPropNames = [
  'label',
  'id',
  'loading',
  'placeholder',
  'valueMaxLength',
  'labelVariant',
  'variant',
  'options',
  'value',
  'mode',
  'size',
  'disabled',
  'showSearch',
  'allowClear',
  'labelInValue',
  'fieldNames',
  'optionFilterProp',
  'optionLabelProp',
  'fetchDataOnSearch',
  'fetchData',
  'onSearch',
  'onChange',
  'onOpenChange',
  'className',
  'style',
  'placement',
  'lightLabel',
  'labelTrigger',
]

function booleanValue(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined)
    return defaultValue
  return value === '' ? true : !!value
}

function withLightSelectDefaults(props: LightSelectProps): LightSelectProps {
  return new Proxy(props, {
    get(target, key: string) {
      const value = (target as unknown as Record<string, unknown>)[key]
      if (key === 'loading' || key === 'disabled' || key === 'showSearch' || key === 'labelInValue' || key === 'fetchDataOnSearch' || key === 'labelTrigger')
        return booleanValue(value, false)
      if (key === 'allowClear')
        return booleanValue(value, true)
      if (value !== undefined)
        return value
      if (key === 'valueMaxLength')
        return 41
      if (key === 'variant')
        return 'outlined'
      if (key === 'options')
        return []
      if (key === 'optionLabelProp')
        return ''
      if (key === 'placement')
        return 'bottomLeft'
      return undefined
    },
  }) as LightSelectProps
}

const LightSelect = defineComponent({
  name: 'LightSelect',
  inheritAttrs: false,
  props: lightSelectPropNames,
  setup(rawProps, { attrs, expose }) {
    const props = withLightSelectDefaults(rawProps as unknown as LightSelectProps)
    const selectRef = ref<any>(null)
    const open = ref(false)
    const keyword = ref('')

    expose({ selectRef })

    const fieldNames = computed(() => ({
      label: props.fieldNames?.label || 'label',
      value: props.fieldNames?.value || 'value',
    }))

    const valueMap = computed(() => {
      const values: Record<string, VNodeChild> = {}
      props.options?.forEach((item) => {
        const optionLabel = props.optionLabelProp ? item[props.optionLabelProp] : item[fieldNames.value.label]
        const optionValue = item[fieldNames.value.value]
        values[optionValue as string] = optionLabel || optionValue
      })
      return values
    })

    const filteredOptions = computed(() => {
      if (props.onSearch || !keyword.value)
        return props.options
      return props.options?.filter((item) => {
        const keywordValue = keyword.value.toLowerCase()
        if (props.optionFilterProp)
          return String(item[props.optionFilterProp] ?? '').toLowerCase().includes(keywordValue)
        return (
          String(item[fieldNames.value.label] ?? '').toLowerCase().includes(keywordValue)
          || String(item[fieldNames.value.value] ?? '').toLowerCase().includes(keywordValue)
        )
      })
    })

    const mergedOpen = computed(() => {
      if (Object.prototype.hasOwnProperty.call(attrs, 'open'))
        return (attrs as Record<string, unknown>).open as boolean | undefined
      return open.value
    })

    return () => {
      const restAttrs = attrs as Partial<SelectProps> & Record<string, unknown>
      const displayValue = getValueOrLabel(valueMap.value, props.value)
      const hasValue = displayValue !== undefined && displayValue !== null && displayValue !== '' && (!Array.isArray(displayValue) || displayValue.length > 0)

      const selectDom = hasValue || mergedOpen.value
        ? (
            <Select
              ref={selectRef}
              {...restAttrs}
              id={props.id}
              allowClear={props.allowClear}
              value={props.value}
              mode={props.mode}
              labelInValue={props.labelInValue}
              size={props.size}
              disabled={props.disabled}
              variant={props.variant}
              open={mergedOpen.value}
              showSearch={props.showSearch}
              style={props.style}
              loading={props.loading}
              options={filteredOptions.value as SelectProps['options']}
              popupRender={(menuNode: any) => (
                <div>
                  {props.showSearch
                    ? (
                        <div style={{ margin: '4px 8px' }}>
                          <Input
                            value={keyword.value}
                            allowClear={!!props.allowClear}
                            prefix={<SearchOutlined />}
                            style={{ width: '100%' }}
                            onChange={(event: any) => {
                              keyword.value = event?.target?.value ?? ''
                              if (props.fetchDataOnSearch)
                                props.fetchData?.(keyword.value)
                              props.onSearch?.(keyword.value)
                            }}
                            onKeydown={(event: KeyboardEvent) => {
                              if (event.key === 'Backspace')
                                event.stopPropagation()
                              if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
                                event.preventDefault()
                            }}
                          />
                        </div>
                      )
                    : null}
                  {menuNode}
                </div>
              )}
              onChange={(value: any, option: any) => {
                props.onChange?.(value, option)
                if (props.mode !== 'multiple') {
                  open.value = false
                  props.onOpenChange?.(false)
                }
              }}
              onSearch={props.showSearch
                ? (value: string) => {
                    if (props.fetchDataOnSearch)
                      props.fetchData?.(value)
                    props.onSearch?.(value)
                  }
                : undefined}
              onOpenChange={(nextOpen: boolean) => {
                if (!nextOpen)
                  keyword.value = ''
                if (!props.labelTrigger)
                  open.value = nextOpen
                props.onOpenChange?.(nextOpen)
              }}
            />
          )
        : undefined

      return (
        <span
          class={clsx(
            'ant-pro-field-select-light-select',
            props.showSearch ? 'ant-pro-field-select-light-select-searchable' : '',
            `ant-pro-field-select-light-select-container-${props.placement}`,
            props.className,
          )}
          style={props.style}
          onClick={(event: MouseEvent) => {
            if (props.disabled)
              return
            const isLabelClick = props.lightLabel?.labelRef?.value?.contains(event.target as Node)
            if (!isLabelClick) {
              open.value = true
              props.onOpenChange?.(true)
            }
          }}
        >
          <FieldLabel
            ellipsis
            label={props.label}
            placeholder={props.placeholder ?? props.label}
            disabled={props.disabled}
            variant={props.labelVariant}
            allowClear={!!props.allowClear}
            value={selectDom || displayValue}
            onClear={() => {
              props.onChange?.(undefined, undefined)
              props.fetchData?.(undefined)
              keyword.value = ''
            }}
            onLabelClick={() => {
              if (props.disabled)
                return
              open.value = !open.value
              props.onOpenChange?.(open.value)
            }}
          />
        </span>
      )
    }
  },
})

export default LightSelect
