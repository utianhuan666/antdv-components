import type { ComputedRef, CSSProperties, InjectionKey, VNodeChild } from 'vue'
import { RightOutlined } from '@antdv-next/icons'
import { clsx, omit, useMergedState } from '@v-c/util'
import { Skeleton } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { computed, defineComponent, provide, reactive, ref } from 'vue'
import { ProConfigProvider, proTheme } from '../../../provider'
import { useRefFunction } from '../../../utils'
import CheckCard from './index'
import { useStyle } from './style'

export type CheckCardValueType = string | number | boolean

/**
 * Represents the possible value types for a CheckGroup.
 * It can be an array of CheckCardValueTypes, a single CheckCardValueType, or undefined.
 */
export type CheckGroupValueType = CheckCardValueType[] | CheckCardValueType | undefined

/**
 * Represents an option for a CheckCard component.
 */
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
  'prefixCls'?: string
  'class'?: any
  'className'?: any
  'options'?: (CheckCardOptionType | string)[]
  'disabled'?: boolean
  'style'?: CSSProperties
  'size'?: 'large' | 'default' | 'small'
  'multiple'?: boolean
  'defaultValue'?: CheckGroupValueType
  'value'?: CheckGroupValueType
  'loading'?: boolean
  'bordered'?: boolean
  'onChange'?: (checkedValue: CheckGroupValueType) => void
  'onUpdate:value'?: (checkedValue: CheckGroupValueType) => void
  'children'?: VNodeChild
}

/**
 * CheckCardGroup 内部 context 的类型定义。
 * 由 Group 组件向下传递，CheckCard 子组件通过 inject 消费。
 * 对应 React 的 CheckCardGroupContextType（纯值，非 ref）。
 */
export interface CheckCardGroupContextType {
  /** 切换选项选中状态 */
  toggleOption?: (option: CheckCardOptionType) => void
  /** 当前选中值（单选为单值，多选为数组） */
  value?: CheckGroupValueType
  /** 是否整组失效 */
  disabled?: boolean
  /** 组件尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 是否处于 loading 状态 */
  loading?: boolean
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 注册一个值（子卡片挂载时调用） */
  registerValue?: (value: CheckCardValueType) => void
  /** 注销一个值（子卡片卸载时调用） */
  cancelValue?: (value: CheckCardValueType) => void
}

export const CheckCardGroupContext: InjectionKey<CheckCardGroupContextType | null> = Symbol('CheckCardGroupContext')

export const CardLoading = defineComponent<{ prefixCls: string, hashId?: string }>({
  name: 'ProCheckCardLoading',
  props: ['prefixCls', 'hashId'],
  setup(rawProps) {
    const props = rawProps
    return () => (
      <div class={clsx(`${props.prefixCls}-loading-content`, props.hashId)}>
        <Skeleton loading active paragraph={{ rows: 4 }} title={false} />
      </div>
    )
  },
})

/**
 * SubCheckCardGroup component.
 *
 * @param title - The title of the group.
 * @param prefix - The prefix for CSS class names.
 */
const SubCheckCardGroup = defineComponent({
  name: 'ProSubCheckCardGroup',
  props: ['title', 'prefix'],
  setup(props, { slots }) {
    const collapse = ref(false)
    const { hashId } = proTheme.useToken()
    const baseCls = computed(() => `${props.prefix}-sub-check-card`)

    return () => (
      <div class={clsx(baseCls.value, hashId.value)}>
        <div
          class={clsx(`${baseCls.value}-title`, hashId.value)}
          onClick={() => { collapse.value = !collapse.value }}
        >
          <RightOutlined style={{ transform: `rotate(${collapse.value ? 90 : 0}deg)`, transition: 'transform 0.3s' }} />
          {props.title}
        </div>
        <div class={clsx(`${baseCls.value}-panel`, hashId.value, { [`${baseCls.value}-panel-collapse`]: collapse.value })}>
          {slots.default?.()}
        </div>
      </div>
    )
  },
})

const CheckCardGroup = defineComponent<CheckCardGroupProps>({
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
    const props = rawProps
    const antdContext = useConfig()

    const getOptions = () => {
      return (props.options as CheckCardOptionType[] ?? [])?.map((option) => {
        if (typeof option === 'string') {
          return {
            title: option,
            value: option,
          } as CheckCardOptionType
        }
        return option
      })
    }

    const prefixCls = computed(() => antdContext.value.getPrefixCls('pro-checkcard', props.prefixCls))
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    const [stateValue, setStateValueInner] = useMergedState<CheckGroupValueType>(props.defaultValue, {
      value: computed(() => props.value) as ComputedRef<CheckGroupValueType>,
    })

    // 使用 useRefFunction 锁住最新的 onChange 引用，避免每次外部 onChange 变化都重建 setStateValue。
    const onChangeCallback = useRefFunction((next: CheckGroupValueType) => {
      emit('update:value', next)
      emit('change', next)
    })

    /**
     * 使用 queueMicrotask 延迟回调调用，避免在渲染阶段触发外部回调导致的 React 警告
     * "Cannot update a component while rendering a different component"。
     * 与 ProCard 的 setCollapsed 模式保持一致。
     */
    const setStateValue = (
      updater: CheckGroupValueType | ((prev: CheckGroupValueType) => CheckGroupValueType),
    ) => {
      const prev = stateValue.value
      const next = typeof updater === 'function'
        ? (updater as (p: CheckGroupValueType) => CheckGroupValueType)(prev)
        : updater
      setStateValueInner(next)
      queueMicrotask(() => {
        onChangeCallback(next)
      })
    }

    const registerValueMap = new Map<CheckCardValueType, any>()

    const registerValue = (value: CheckCardValueType) => {
      registerValueMap.set(value, true)
    }

    const cancelValue = (value: CheckCardValueType) => {
      registerValueMap.delete(value)
    }

    const toggleOption = (option: CheckCardOptionType) => {
      // 单选模式：再次点击当前选中项时清空，否则切到新值
      if (!props.multiple) {
        const nextValue = stateValue.value === option.value ? undefined : option.value
        setStateValue(nextValue)
        return
      }

      // 多选模式：toggle option.value，并按选项原始顺序排序
      const stateValues = (stateValue.value as CheckCardValueType[]) ?? []
      const hasOption = stateValues.includes(option.value)
      const toggled = hasOption
        ? stateValues.filter(itemValue => itemValue !== option.value)
        : [...stateValues, option.value]

      const newOptions = getOptions()
      const newValue = toggled
        .filter(val => registerValueMap.has(val))
        .sort((a, b) => {
          const indexA = newOptions.findIndex(opt => opt.value === a)
          const indexB = newOptions.findIndex(opt => opt.value === b)
          return indexA - indexB
        })

      setStateValue(newValue)
    }

    // 用 reactive + getter 锁住 Provider value 的引用并保持响应式，
    // 对外暴露与 React 一致的「纯值」结构（CheckCardGroupContextType）。
    const contextValue = reactive<CheckCardGroupContextType>({
      toggleOption,
      get bordered() { return props.bordered ?? true },
      get value() { return stateValue.value },
      get disabled() { return props.disabled },
      get size() { return props.size },
      get loading() { return props.loading },
      get multiple() { return props.multiple },
      // https://github.com/ant-design/ant-design/issues/16376
      registerValue,
      cancelValue,
    })
    provide(CheckCardGroupContext, contextValue)

    return () => {
      const groupPrefixCls = `${prefixCls.value}-group`
      const options = props.options ?? []
      const domProps: Record<string, any> = omit(attrs as Record<string, any>, [
        'children',
        'defaultValue',
        'value',
        'disabled',
        'size',
      ])

      const renderOptions = (list: CheckCardOptionType[]): VNodeChild[] => {
        const optionValue = stateValue.value
        return list.map((option) => {
          if (option.children && option.children.length > 0) {
            return (
              <SubCheckCardGroup
                title={option.title}
                prefix={groupPrefixCls}
                key={String(option.value ?? option.title)}
              >
                {renderOptions(option.children)}
              </SubCheckCardGroup>
            )
          }
          return (
            <CheckCard
              key={String(option.value)}
              disabled={option.disabled}
              size={option.size ?? props.size}
              value={option.value}
              checked={
                props.multiple
                  ? Array.isArray(optionValue) && optionValue.includes(option.value)
                  : optionValue === option.value
              }
              onChange={option.onChange}
              title={option.title}
              avatar={option.avatar}
              description={option.description}
              cover={option.cover}
            />
          )
        })
      }

      const children = props.loading
        ? new Array(options.length || slots.default?.()?.length || 1)
            .fill(0)
            .map((_, index) => <CheckCard key={index} loading />)
        : options.length > 0
          ? renderOptions(getOptions())
          : slots.default?.()

      const classString = clsx(groupPrefixCls, props.class, props.className, hashId)

      return wrapSSR(
        <div class={classString} style={props.style} {...domProps}>
          {children}
        </div>,
      )
    }
  },
})

const CheckCardGroupWithProvider = defineComponent({
  name: 'CheckCardGroup',
  inheritAttrs: false,
  props: CheckCardGroup.props as any,
  emits: ['change', 'update:value'],
  setup(props, { attrs, emit, slots }) {
    return () => (
      <ProConfigProvider needDeps>
        <CheckCardGroup
          {...attrs}
          {...props}
          onChange={(value: CheckGroupValueType) => emit('change', value)}
          onUpdate:value={(value: CheckGroupValueType) => emit('update:value', value)}
        >
          {slots.default?.()}
        </CheckCardGroup>
      </ProConfigProvider>
    )
  },
})

export default CheckCardGroupWithProvider
