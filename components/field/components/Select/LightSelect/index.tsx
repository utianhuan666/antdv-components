import type { SelectProps } from 'antdv-next'
import type { VNodeChild } from 'vue'
import type { ProFieldLightProps } from '../../../types'
import { SearchOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Input, Select } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { useStyle } from '../../../../provider'
import { useProPrefixCls } from '../../../../provider/useProPrefixCls'
import FieldLabel from '../../../../utils/components/FieldLabel'

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

function normalizeBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined)
    return defaultValue
  return value === '' ? true : !!value
}

const LightSelect = defineComponent<LightSelectProps>({
  name: 'LightSelect',
  inheritAttrs: false,
  props: lightSelectPropNames,
  setup(rawProps, { attrs, expose }) {
    const props = rawProps
    const selectRef = ref<any>(null)
    const open = ref(false)
    const keyword = ref('')
    const prefixCls = useProPrefixCls('pro-field-select-light-select')
    const { wrapSSR, hashId } = useStyle('LightSelect', token => ({
      [`.${prefixCls.value}`]: {
        [`${token.antCls}-select`]: {
          'position': 'absolute',
          'width': '153px',
          'height': '28px',
          'visibility': 'hidden',
          'opacity': 0,
          '&-selector': {
            height: 28,
          },
        },
        [`&.${prefixCls.value}-searchable`]: {
          [`${token.antCls}-select`]: {
            'width': '200px',
            '&-selector': {
              height: 28,
            },
          },
        },
      },
    }))

    expose({ selectRef })

    const fieldNames = computed(() => ({
      label: props.fieldNames?.label || 'label',
      value: props.fieldNames?.value || 'value',
    }))

    const valueMap = computed(() => {
      const values: Record<string, VNodeChild> = {}
      const optionLabelProp = props.optionLabelProp ?? ''
      ;(props.options ?? []).forEach((item) => {
        const optionLabel = optionLabelProp ? item[optionLabelProp] : item[fieldNames.value.label]
        const optionValue = item[fieldNames.value.value]
        values[optionValue as string] = optionLabel || optionValue
      })
      return values
    })

    const filteredOptions = computed(() => {
      const options = props.options ?? []
      if (props.onSearch || !keyword.value)
        return options
      return options.filter((item) => {
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
        return normalizeBoolean((attrs as Record<string, unknown>).open, false)
      return open.value
    })

    const syncLightLabelRef = (instance: any) => {
      if (!props.lightLabel)
        return
      props.lightLabel.labelRef.value = instance?.labelRef?.value ?? instance?.labelRef ?? null
      props.lightLabel.clearRef.value = instance?.clearRef?.value ?? instance?.clearRef ?? null
    }

    return () => {
      const restAttrs = attrs as Partial<SelectProps> & Record<string, unknown>
      const displayValue = getValueOrLabel(valueMap.value, props.value)
      const allowClear = normalizeBoolean(props.allowClear, true)
      const disabled = normalizeBoolean(props.disabled, false)
      const fetchDataOnSearch = normalizeBoolean(props.fetchDataOnSearch, false)
      const labelInValue = normalizeBoolean(props.labelInValue, false)
      const labelTrigger = normalizeBoolean(props.labelTrigger, false)
      const loading = normalizeBoolean(props.loading, false)
      const placement = props.placement ?? 'bottomLeft'
      const showSearch = normalizeBoolean(props.showSearch, false)
      const valueMaxLength = props.valueMaxLength ?? 41
      const variant = props.variant ?? 'outlined'

      return wrapSSR(
        <div
          class={clsx(
            prefixCls.value,
            hashId,
            showSearch ? `${prefixCls.value}-searchable` : '',
            `${prefixCls.value}-container-${placement}`,
            props.className,
          )}
          style={props.style}
          onClick={(event: MouseEvent) => {
            if (disabled)
              return
            const isLabelClick = props.lightLabel?.labelRef?.value?.contains(event.target as Node)
            if (!isLabelClick) {
              open.value = true
              props.onOpenChange?.(true)
            }
          }}
        >
          <Select
            ref={selectRef}
            {...restAttrs}
            id={props.id}
            allowClear={allowClear}
            value={props.value}
            mode={props.mode}
            labelInValue={labelInValue}
            size={props.size}
            disabled={disabled}
            variant={variant}
            open={mergedOpen.value}
            showSearch={showSearch}
            style={props.style}
            loading={loading}
            options={filteredOptions.value as SelectProps['options']}
            popupRender={(menuNode: any) => (
              <div>
                {showSearch
                  ? (
                      <div style={{ margin: '4px 8px' }}>
                        <Input
                          value={keyword.value}
                          allowClear={allowClear}
                          prefix={<SearchOutlined />}
                          style={{ width: '100%' }}
                          onChange={(event: any) => {
                            keyword.value = event?.target?.value ?? ''
                            if (fetchDataOnSearch)
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
            onSearch={showSearch
              ? (value: string) => {
                  if (fetchDataOnSearch)
                    props.fetchData?.(value)
                  props.onSearch?.(value)
                }
              : undefined}
            onOpenChange={(nextOpen: boolean) => {
              if (!nextOpen)
                keyword.value = ''
              if (!labelTrigger)
                open.value = nextOpen
              props.onOpenChange?.(nextOpen)
            }}
          />
          <FieldLabel
            ref={syncLightLabelRef}
            ellipsis
            label={props.label}
            placeholder={props.placeholder ?? props.label}
            disabled={disabled}
            variant={props.labelVariant}
            allowClear={allowClear}
            value={displayValue || (props.value as any)?.label || props.value}
            valueMaxLength={valueMaxLength}
            onClear={() => {
              props.onChange?.(undefined, undefined)
            }}
            onClick={() => {
              if (disabled)
                return
              open.value = !open.value
              props.onOpenChange?.(open.value)
            }}
          />
        </div>,
      )
    }
  },
})

export default LightSelect
