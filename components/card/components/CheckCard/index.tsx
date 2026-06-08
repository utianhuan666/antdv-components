import type { ComputedRef, CSSProperties, VNodeChild } from 'vue'
import type { CheckCardGroupProps, CheckCardValueType } from './Group'
import { clsx, useMergedState } from '@v-c/util'
import { Avatar } from 'antdv-next'
import { computed, defineComponent, inject, watch } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import ProCardActions from '../Actions'
import CheckCardGroup, { CardLoading, CheckCardGroupContext } from './Group'
import { useStyle } from './style'

/**
 * Props for the CheckCard component.
 */
export interface CheckCardProps {
  prefixCls?: string
  onChange?: (checked: boolean) => void
  onClick?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  defaultChecked?: boolean
  checked?: boolean
  disabled?: boolean
  style?: CSSProperties
  class?: any
  className?: any
  avatar?: VNodeChild
  title?: VNodeChild
  subTitle?: VNodeChild
  description?: VNodeChild
  value?: any
  loading?: boolean
  cover?: VNodeChild
  size?: 'large' | 'default' | 'small'
  bordered?: boolean
  extra?: VNodeChild
  bodyStyle?: CSSProperties
  styles?: {
    body?: CSSProperties
  }
  actions?: VNodeChild[]
  ghost?: boolean
}

const CheckCard = defineComponent<CheckCardProps>({
  name: 'CheckCard',
  inheritAttrs: false,
  props: [
    'prefixCls',
    'defaultChecked',
    'checked',
    'disabled',
    'style',
    'class',
    'className',
    'avatar',
    'title',
    'subTitle',
    'description',
    'value',
    'loading',
    'cover',
    'size',
    'bordered',
    'extra',
    'bodyStyle',
    'styles',
    'actions',
    'ghost',
  ],
  emits: ['change', 'click', 'mouseenter', 'mouseleave'],
  setup(rawProps, { emit, slots }) {
    const props = rawProps

    const [stateChecked, setStateCheckedInner] = useMergedState<boolean>(props.defaultChecked || false, {
      value: computed(() => props.checked) as ComputedRef<boolean>,
    })

    const setStateChecked = (updater: boolean | ((prev: boolean) => boolean)) => {
      const prev = stateChecked.value
      const next = typeof updater === 'function' ? updater(prev) : updater
      emit('change', next)
      setStateCheckedInner(next)
    }

    const checkCardGroup = inject(CheckCardGroupContext, null)

    const handleClick = (e: MouseEvent) => {
      emit('click', e)
      const newChecked = !stateChecked.value
      checkCardGroup?.toggleOption?.({ value: props.value as CheckCardValueType })
      setStateChecked?.(newChecked)
    }

    // small => sm large => lg
    const getSizeCls = (size?: string) => {
      if (size === 'large')
        return 'lg'
      if (size === 'small')
        return 'sm'
      return ''
    }

    watch(
      () => props.value,
      (value, _oldValue, onCleanup) => {
        checkCardGroup?.registerValue?.(value as CheckCardValueType)
        // checkCardGroup 来自 context，理论上引用稳定；但若上层 Provider value 重建，
        // 这里需要重新走一遍 register/cancel，避免向已失效的 group 注册。
        onCleanup(() => checkCardGroup?.cancelValue?.(value as CheckCardValueType))
      },
      { immediate: true },
    )

    const mergedPrefixCls = useProPrefixCls('pro-checkcard', computed(() => props.prefixCls))
    const { wrapSSR, hashId } = useStyle(mergedPrefixCls.value)

    /**
     * 头像自定义
     */
    const renderCover = (cls: string, coverDom: VNodeChild) => {
      return (
        <div class={clsx(`${cls}-cover`, hashId)}>
          {typeof coverDom === 'string' ? <img src={coverDom} alt="checkcard" /> : coverDom}
        </div>
      )
    }

    return () => {
      const prefixCls = mergedPrefixCls.value

      const avatar = slots.avatar?.() ?? props.avatar
      const title = slots.title?.() ?? props.title
      const subTitle = slots.subTitle?.() ?? props.subTitle
      const description = slots.description?.() ?? props.description
      const cover = slots.cover?.() ?? props.cover
      const extra = slots.extra?.() ?? props.extra

      const checkCardProps: {
        disabled?: boolean
        size?: 'large' | 'default' | 'small'
        loading?: boolean
        bordered?: boolean
        checked?: boolean
      } = {
        disabled: props.disabled,
        size: props.size,
        loading: props.loading,
        bordered: props.bordered,
        checked: stateChecked.value,
      }

      let multiple = false

      if (checkCardGroup) {
        // 受组控制模式
        checkCardProps.disabled = props.disabled || checkCardGroup.disabled
        checkCardProps.loading = props.loading || checkCardGroup.loading
        checkCardProps.bordered = props.bordered || checkCardGroup.bordered

        // multiple 在 Context 类型上是 boolean | undefined，本地变量需收窄成 boolean
        multiple = checkCardGroup.multiple ?? false

        // 多选时 value 必为数组、单选时为单值；用 Array.isArray 守卫，避免对单值调 includes
        const groupValue = checkCardGroup.value
        const isChecked = multiple
          ? Array.isArray(groupValue) && groupValue.includes(props.value)
          : groupValue === props.value

        // loading时check为false
        checkCardProps.checked = checkCardProps.loading ? false : isChecked
        checkCardProps.size = props.size || checkCardGroup.size
      }

      const {
        disabled = false,
        size,
        loading: cardLoading,
        bordered = true,
        checked,
      } = checkCardProps
      const sizeCls = getSizeCls(size)

      const classString = clsx(prefixCls, props.class, props.className, hashId, {
        [`${prefixCls}-loading`]: cardLoading,
        [`${prefixCls}-${sizeCls}`]: sizeCls,
        [`${prefixCls}-checked`]: checked,
        [`${prefixCls}-multiple`]: multiple,
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-bordered`]: bordered,
        [`${prefixCls}-ghost`]: props.ghost,
      })

      const metaDom = (() => {
        if (cardLoading) {
          return <CardLoading prefixCls={prefixCls || ''} hashId={hashId} />
        }

        if (cover) {
          return renderCover(prefixCls || '', cover)
        }

        const avatarDom = avatar
          ? (
              <div class={clsx(`${prefixCls}-avatar`, hashId)}>
                {typeof avatar === 'string'
                  ? <Avatar size={48} shape="square" src={avatar} />
                  : avatar}
              </div>
            )
          : null

        const headerDom = (title ?? extra) != null
          ? (
              <div class={clsx(`${prefixCls}-header`, hashId)}>
                <div class={clsx(`${prefixCls}-header-left`, hashId)}>
                  <div
                    class={clsx(`${prefixCls}-title`, hashId, {
                      [`${prefixCls}-title-with-ellipsis`]: typeof title === 'string',
                    })}
                  >
                    {title}
                  </div>
                  {subTitle
                    ? <div class={clsx(`${prefixCls}-subTitle`, hashId)}>{subTitle}</div>
                    : null}
                </div>
                {extra && (
                  <div class={clsx(`${prefixCls}-extra`, hashId)}>{extra}</div>
                )}
              </div>
            )
          : null

        const descriptionDom = description
          ? <div class={clsx(`${prefixCls}-description`, hashId)}>{description}</div>
          : null

        const metaClass = clsx(`${prefixCls}-content`, hashId, {
          [`${prefixCls}-avatar-header`]: avatarDom && headerDom && !descriptionDom,
        })

        return (
          <div class={metaClass}>
            {avatarDom}
            {headerDom || descriptionDom
              ? (
                  <div class={clsx(`${prefixCls}-detail`, hashId)}>
                    {headerDom}
                    {descriptionDom}
                  </div>
                )
              : null}
          </div>
        )
      })()

      return wrapSSR(
        <div
          class={classString}
          style={props.style}
          onClick={(e: MouseEvent) => {
            if (!cardLoading && !disabled) {
              handleClick(e)
            }
          }}
          onMouseenter={(e: MouseEvent) => emit('mouseenter', e)}
        >
          {metaDom}
          {slots.default
            ? (
                <div class={clsx(`${prefixCls}-body`, hashId)} style={props.styles?.body || props.bodyStyle}>
                  {slots.default()}
                </div>
              )
            : null}
          {props.actions ? <ProCardActions actions={props.actions} prefixCls={prefixCls} /> : null}
        </div>,
      )
    }
  },
})

// 用 Object.assign 挂载子组件
const CheckCardWithGroup = Object.assign(CheckCard, {
  Group: CheckCardGroup,
})

export type { CheckCardGroupProps }
export { CheckCardGroup }
export default CheckCardWithGroup
