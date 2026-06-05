import type { CSSProperties, InjectionKey, VNodeChild } from 'vue'
import { RightOutlined } from '@antdv-next/icons'
import { clsx } from '@v-c/util'
import { Skeleton } from 'antdv-next'
import { computed, defineComponent, provide, ref } from 'vue'
import { ProConfigProvider } from '../../../provider'
import CheckCard from './index'
import { useStyle } from './style'

export type CheckCardValueType = string | number | boolean
export type CheckGroupValueType = CheckCardValueType[] | CheckCardValueType | undefined

export interface CheckCardOptionType {
  title?: VNodeChild
  value: CheckCardValueType
  description?: VNodeChild
  size?: 'large' | 'default' | 'small'
  avatar?: VNodeChild
  cover?: VNodeChild
  disabled?: boolean
  onChange?: (checked: boolean) => void
  children?: CheckCardOptionType[]
}

export interface CheckCardGroupProps {
  prefixCls?: string
  class?: any
  className?: any
  options?: (CheckCardOptionType | string)[]
  disabled?: boolean
  style?: CSSProperties
  size?: 'large' | 'default' | 'small'
  multiple?: boolean
  defaultValue?: CheckGroupValueType
  value?: CheckGroupValueType
  loading?: boolean
  bordered?: boolean
}

export interface CheckCardGroupContextType {
  value: { value: CheckGroupValueType }
  disabled: { value: boolean }
  size: { value?: 'large' | 'default' | 'small' }
  loading: { value: boolean }
  bordered: { value: boolean }
  multiple: { value: boolean }
  toggleOption: (option: CheckCardOptionType) => void
  registerValue: (value?: CheckCardValueType) => void
  cancelValue: (value?: CheckCardValueType) => void
}

export const CheckCardGroupContext: InjectionKey<CheckCardGroupContextType | null> = Symbol('CheckCardGroupContext')

function hasOwn(target: object, key: string) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

function normalizeOptions(options: (CheckCardOptionType | string)[] = []) {
  return options.map((option) => {
    if (typeof option === 'string')
      return { title: option, value: option } as CheckCardOptionType
    return option
  })
}

export const CardLoading = defineComponent({
  name: 'ProCheckCardLoading',
  props: ['prefixCls'],
  setup(rawProps) {
    const props = rawProps as { prefixCls?: string }
    return () => (
      <div class={clsx(`${props.prefixCls || 'ant-pro-checkcard'}-loading-content`)}>
        <Skeleton loading active paragraph={{ rows: 4 }} title={false} />
      </div>
    )
  },
})

const SubCheckCardGroup = defineComponent({
  name: 'ProSubCheckCardGroup',
  props: ['title', 'prefix'],
  setup(props, { slots }) {
    const collapse = ref(false)
    const baseCls = computed(() => `${props.prefix || 'ant-pro-checkcard-group'}-sub-check-card`)

    return () => (
      <div class={baseCls.value}>
        <div class={`${baseCls.value}-title`} onClick={() => { collapse.value = !collapse.value }}>
          <RightOutlined style={{ transform: `rotate(${collapse.value ? 90 : 0}deg)`, transition: 'transform 0.3s' }} />
          {props.title}
        </div>
        <div class={clsx(`${baseCls.value}-panel`, { [`${baseCls.value}-panel-collapse`]: collapse.value })}>
          {slots.default?.()}
        </div>
      </div>
    )
  },
})

const CheckCardGroupBase = defineComponent({
  name: 'CheckCardGroup',
  inheritAttrs: false,
  props: [
    'prefixCls',
    'class',
    'className',
    'options',
    'disabled',
    'style',
    'size',
    'multiple',
    'defaultValue',
    'value',
    'loading',
    'bordered',
  ],
  emits: ['change', 'update:value'],
  setup(rawProps, { attrs, emit, slots }) {
    const props = rawProps as CheckCardGroupProps
    const { wrapSSR, hashId } = useStyle(props.prefixCls || 'ant-pro-checkcard')
    const innerValue = ref<CheckGroupValueType>(props.defaultValue)
    const registeredValues = new Map<CheckCardValueType, true>()
    const controlledValue = computed(() => hasOwn(rawProps, 'value') && props.value !== undefined)
    const mergedValue = computed(() => controlledValue.value ? props.value : innerValue.value)

    const getOptions = () => normalizeOptions(props.options)
    const setValue = (value: CheckGroupValueType) => {
      if (!controlledValue.value)
        innerValue.value = value
      emit('update:value', value)
      emit('change', value)
    }

    const registerValue = (value?: CheckCardValueType) => {
      if (value !== undefined)
        registeredValues.set(value, true)
    }

    const cancelValue = (value?: CheckCardValueType) => {
      if (value !== undefined)
        registeredValues.delete(value)
    }

    const toggleOption = (option: CheckCardOptionType) => {
      if (!props.multiple) {
        setValue(mergedValue.value === option.value ? undefined : option.value)
        return
      }

      const currentValue = Array.isArray(mergedValue.value) ? mergedValue.value : []
      const toggled = currentValue.includes(option.value)
        ? currentValue.filter(item => item !== option.value)
        : [...currentValue, option.value]
      const options = getOptions()
      const sortedValue = toggled
        .filter(value => registeredValues.has(value))
        .sort((a, b) => {
          const indexA = options.findIndex(item => item.value === a)
          const indexB = options.findIndex(item => item.value === b)
          return indexA - indexB
        })

      setValue(sortedValue)
    }

    provide(CheckCardGroupContext, {
      value: mergedValue,
      disabled: computed(() => !!props.disabled),
      size: computed(() => props.size),
      loading: computed(() => !!props.loading),
      bordered: computed(() => props.bordered ?? true),
      multiple: computed(() => !!props.multiple),
      toggleOption,
      registerValue,
      cancelValue,
    })

    const renderOptions = (options: CheckCardOptionType[], groupPrefixCls: string): VNodeChild[] => {
      const optionValue = mergedValue.value
      return options.map((option) => {
        if (option.children?.length) {
          return (
            <SubCheckCardGroup title={option.title} prefix={groupPrefixCls} key={String(option.value ?? option.title)}>
              {renderOptions(option.children, groupPrefixCls)}
            </SubCheckCardGroup>
          )
        }

        return (
          <CheckCard
            key={String(option.value)}
            disabled={option.disabled}
            size={option.size ?? props.size}
            value={option.value}
            checked={props.multiple
              ? Array.isArray(optionValue) && optionValue.includes(option.value)
              : optionValue === option.value}
            onChange={option.onChange}
            title={option.title}
            avatar={option.avatar}
            description={option.description}
            cover={option.cover}
          />
        )
      })
    }

    return () => {
      const prefixCls = props.prefixCls || 'ant-pro-checkcard'
      const groupPrefixCls = `${prefixCls}-group`
      const options = getOptions()
      const children = props.loading
        ? Array.from({ length: options.length || slots.default?.().length || 1 }).map((_, index) => <CheckCard key={index} loading />)
        : options.length
          ? renderOptions(options, groupPrefixCls)
          : slots.default?.()

      return wrapSSR(
        <div {...attrs} class={clsx(groupPrefixCls, hashId, props.class, props.className)} style={props.style}>
          {children}
        </div>,
      )
    }
  },
})

const CheckCardGroupWithProvider = defineComponent({
  name: 'CheckCardGroup',
  inheritAttrs: false,
  props: CheckCardGroupBase.props as any,
  emits: ['change', 'update:value'],
  setup(props, { attrs, emit, slots }) {
    return () => (
      <ProConfigProvider needDeps>
        <CheckCardGroupBase
          {...attrs}
          {...props}
          onChange={(value: CheckGroupValueType) => emit('change', value)}
          onUpdate:value={(value: CheckGroupValueType) => emit('update:value', value)}
        >
          {slots.default?.()}
        </CheckCardGroupBase>
      </ProConfigProvider>
    )
  },
})

export default CheckCardGroupWithProvider
