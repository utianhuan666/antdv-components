import type { PropType } from 'vue'
import type { RequestOptionsType } from '../types'
import { SearchOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Input, Select } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import FieldLabel from '../../../../form/layouts/LightFilter/FieldLabel'

function getValueOrLabel(valueMap: Record<string, any>, value: any): any {
  if (Array.isArray(value))
    return value.map(item => getValueOrLabel(valueMap, item)).join(',')
  if (value && typeof value === 'object')
    return valueMap[value.value] || value.label
  return valueMap[value] || value
}

export default defineComponent({
  name: 'LightSelect',
  inheritAttrs: false,
  props: {
    label: { type: null as unknown as PropType<any>, default: undefined },
    id: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
    placeholder: { type: null as unknown as PropType<any>, default: undefined },
    labelVariant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: undefined },
    variant: { type: String as PropType<'outlined' | 'borderless' | 'filled' | 'underlined'>, default: 'outlined' },
    options: { type: Array as PropType<RequestOptionsType[]>, default: () => [] },
    value: { type: null as unknown as PropType<any>, default: undefined },
    mode: { type: String as PropType<'multiple' | 'tags'>, default: undefined },
    disabled: { type: Boolean, default: false },
    showSearch: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    labelInValue: { type: Boolean, default: false },
    fieldNames: { type: Object as PropType<Record<string, string>>, default: undefined },
    optionFilterProp: { type: String, default: undefined },
    optionLabelProp: { type: String, default: '' },
    fetchDataOnSearch: { type: Boolean, default: false },
    fetchData: { type: Function as PropType<(keyWord?: string) => void>, default: undefined },
    onSearch: { type: Function as PropType<(value: string) => void>, default: undefined },
    onChange: { type: Function as PropType<(value: any, option: any) => void>, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, any>>, default: undefined },
    placement: { type: String, default: 'bottomLeft' },
    lightLabel: { type: Object as PropType<any>, default: undefined },
    labelTrigger: { type: Boolean, default: false },
  },
  setup(props, { attrs, expose }) {
    const selectRef = ref<any>(null)
    const open = ref(false)
    const keyword = ref('')

    expose({ selectRef })

    const fieldNames = computed(() => ({
      label: props.fieldNames?.label || 'label',
      value: props.fieldNames?.value || 'value',
    }))

    const valueMap = computed(() => {
      const values: Record<string, any> = {}
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
        return (attrs as Record<string, any>).open
      return open.value
    })

    return () => {
      const restAttrs = attrs as Record<string, any>
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
              disabled={props.disabled}
              variant={props.variant}
              open={mergedOpen.value}
              showSearch={props.showSearch}
              style={props.style}
              loading={props.loading}
              options={filteredOptions.value as any}
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
