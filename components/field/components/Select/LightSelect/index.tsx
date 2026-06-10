import type { SelectProps } from 'antdv-next'
import type { ComponentPublicInstance, CSSProperties, Ref, VNodeChild } from 'vue'
import type { ProFieldLightProps } from '../../../types'
import { SearchOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Input, Select } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { useStyle } from '../../../../provider'
import { useProPrefixCls } from '../../../../provider/useProPrefixCls'
import FieldLabel from '../../../../utils/components/FieldLabel'

type SelectInstance = InstanceType<typeof Select>
type SelectOnChange = NonNullable<SelectProps['onChange']>
type SelectOnChangeValue = Parameters<SelectOnChange>[0]
type SelectOnChangeOption = Parameters<SelectOnChange>[1]
type SelectPopupNode = Parameters<NonNullable<SelectProps['popupRender']>>[0]

type FieldLabelExposed = {
  labelRef?: Ref<HTMLElement | null>
  clearRef?: Ref<HTMLElement | null>
}

export type LightSelectProps = {
  label?: string
  placeholder?: SelectProps['placeholder']
  valueMaxLength?: number
  fetchData: (keyWord?: string) => void
  fetchDataOnSearch?: boolean
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  labelVariant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  style?: CSSProperties
  className?: string
} & ProFieldLightProps & SelectProps

export type LightSelectExpose = {
  selectRef: Ref<SelectInstance | null>
}

type LightSelectAttrs = Partial<SelectProps> & {
  open?: boolean
}

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
  'prefixCls',
]

function normalizeBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined)
    return defaultValue
  return value === '' ? true : !!value
}

function toJoinedText(value: unknown): string {
  if (Array.isArray(value))
    return value.map(item => toJoinedText(item)).join('')
  if (value == null)
    return ''
  return String(value)
}

function getValueOrLabel(valueMap: Record<string, VNodeChild>, value: LightSelectProps['value']): VNodeChild {
  if (Array.isArray(value))
    return value.map(item => getValueOrLabel(valueMap, item)).join(',')
  if (value && typeof value === 'object')
    return valueMap[value.value] || value.label
  return valueMap[value] || value
}

const LightSelect = defineComponent<LightSelectProps>({
  name: 'LightSelect',
  inheritAttrs: false,
  props: lightSelectPropNames,
  setup(rawProps, { attrs, expose }) {
    const props = rawProps
    const selectAttrs = attrs as LightSelectAttrs
    const selectRef = ref<SelectInstance | null>(null)
    const open = ref(false)
    const keyword = ref('')
    const prefixCls = useProPrefixCls('pro-field-select-light-select')
    const { wrapSSR, hashId } = useStyle('LightSelect', token => ({
      [`.${prefixCls.value}`]: {
        [`${token.antCls}-select`]: {
          position: 'absolute',
          width: '153px',
          height: '28px',
          visibility: 'hidden',
          opacity: 0,
          '&-selector': {
            height: 28,
          },
        },
        [`&.${prefixCls.value}-searchable`]: {
          [`${token.antCls}-select`]: {
            width: '200px',
            '&-selector': {
              height: 28,
            },
          },
        },
      },
    }))

    expose({ selectRef } satisfies LightSelectExpose)

    const fieldNames = computed(() => ({
      label: props.fieldNames?.label || 'label',
      value: props.fieldNames?.value || 'value',
    }))

    const valueMap = computed<Record<string, VNodeChild>>(() => {
      const values: Record<string, VNodeChild> = {}
      const optionLabelProp = props.optionLabelProp ?? ''
      ;(props.options ?? []).forEach((item) => {
        const optionLabel = item[optionLabelProp] || item[fieldNames.value.label]
        const optionValue = item[fieldNames.value.value]
        values[String(optionValue)] = optionLabel || optionValue
      })
      return values
    })

    const mergedOpen = computed(() => {
      if (Object.prototype.hasOwnProperty.call(selectAttrs, 'open'))
        return selectAttrs.open
      return open.value
    })

    const filterValue = computed(() => {
      if (Array.isArray(props.value))
        return props.value.map(item => getValueOrLabel(valueMap.value, item))
      return getValueOrLabel(valueMap.value, props.value)
    })

    const filteredOptions = computed(() => {
      if (props.onSearch || !keyword.value)
        return props.options

      const optionFilterProp = props.optionFilterProp
      const keywordValue = keyword.value.toLowerCase()

      return props.options?.filter((item) => {
        if (optionFilterProp) {
          return toJoinedText(item[optionFilterProp])
            .toLowerCase()
            .includes(keywordValue)
        }

        return (
          String(item[fieldNames.value.label] ?? '').toLowerCase().includes(keywordValue)
          || String(item[fieldNames.value.value] ?? '').toLowerCase().includes(keywordValue)
        )
      })
    })

    const syncLightLabelRef = (instance: Element | ComponentPublicInstance | null) => {
      if (!props.lightLabel || !instance || typeof instance !== 'object')
        return

      const exposed = instance as ComponentPublicInstance & FieldLabelExposed
      if (props.lightLabel.labelRef)
        props.lightLabel.labelRef.value = exposed.labelRef?.value ?? null
      if (props.lightLabel.clearRef)
        props.lightLabel.clearRef.value = exposed.clearRef?.value ?? null
    }

    return () => {
      const allowClear = normalizeBoolean(props.allowClear, false)
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
            {
              [`${prefixCls.value}-searchable`]: showSearch,
            },
            `${prefixCls.value}-container-${placement}`,
            props.className,
          )}
          style={props.style as CSSProperties | undefined}
          onClick={(event: MouseEvent) => {
            if (disabled)
              return
            const isLabelClick = props.lightLabel?.labelRef?.value?.contains(event.target as Node)
            if (!isLabelClick)
              open.value = true
          }}
        >
          <Select
            ref={selectRef}
            {...selectAttrs}
            id={props.id}
            allowClear={allowClear}
            value={props.value}
            mode={props.mode}
            labelInValue={labelInValue}
            size={props.size}
            disabled={disabled}
            variant={variant}
            showSearch={showSearch}
            style={props.style as CSSProperties | undefined}
            loading={loading}
            popupRender={(menuNode: SelectPopupNode) => (
              <div>
                {showSearch && (
                  <div style={{ margin: '4px 8px' }}>
                    <Input
                      value={keyword.value}
                      allowClear={allowClear}
                      onChange={(event: Event) => {
                        const nextValue = (event.target as HTMLInputElement | null)?.value ?? ''
                        keyword.value = nextValue
                        if (fetchDataOnSearch)
                          props.fetchData?.(nextValue)
                        props.onSearch?.(nextValue)
                      }}
                      onKeydown={(event: KeyboardEvent) => {
                        if (event.key === 'Backspace') {
                          event.stopPropagation()
                          return
                        }
                        if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
                          event.preventDefault()
                      }}
                      style={{ width: '100%' }}
                      prefix={<SearchOutlined />}
                    />
                  </div>
                )}
                {menuNode}
              </div>
            )}
            open={mergedOpen.value as boolean | undefined}
            onChange={(value: SelectOnChangeValue, option: SelectOnChangeOption) => {
              props.onChange?.(value, option)
              if (props.mode !== 'multiple')
                open.value = false
            }}
            onSearch={showSearch
              ? (value: string) => {
                  if (fetchDataOnSearch)
                    props.fetchData?.(value)
                  props.onSearch?.(value)
                }
              : undefined}
            onOpenChange={(isOpen: boolean) => {
              if (!isOpen)
                keyword.value = ''
              if (!labelTrigger)
                open.value = isOpen
              props.onOpenChange?.(isOpen)
            }}
            options={filteredOptions.value as SelectProps['options']}
          />
          <FieldLabel
            ellipsis
            label={props.label}
            placeholder={(props.placeholder as VNodeChild | undefined) ?? props.label}
            disabled={disabled}
            variant={props.labelVariant}
            allowClear={allowClear}
            value={
              filterValue.value
              || (props.value && typeof props.value === 'object' && 'label' in props.value
                ? props.value.label as VNodeChild
                : props.value)
            }
            onClear={() => {
              props.onChange?.(undefined, undefined)
            }}
            onClick={() => {
              if (disabled)
                return
              open.value = !open.value
            }}
            ref={syncLightLabelRef}
            valueMaxLength={valueMaxLength}
          />
        </div>,
      )
    }
  },
})

export default LightSelect
