import type { CSSProperties, VNodeChild } from 'vue'
import type { CheckCardGroupProps, CheckCardValueType } from './Group'
import { clsx } from '@v-c/util'
import { Avatar } from 'antdv-next'
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import ProCardActions from '../Actions'
import CheckCardGroup, { CardLoading, CheckCardGroupContext } from './Group'
import { useStyle } from './style'

export interface CheckCardProps {
  prefixCls?: string
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
  value?: CheckCardValueType
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

function hasOwn(target: object, key: string) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

function getSizeCls(size?: string) {
  if (size === 'large')
    return 'lg'
  if (size === 'small')
    return 'sm'
  return ''
}

const CheckCard = defineComponent({
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
  setup(rawProps, { attrs, emit, slots }) {
    const props = rawProps as CheckCardProps
    const mergedPrefixCls = useProPrefixCls('pro-checkcard', computed(() => props.prefixCls))
    const { wrapSSR, hashId } = useStyle(mergedPrefixCls.value)
    const group = inject(CheckCardGroupContext, null)
    const innerChecked = ref(!!props.defaultChecked)
    const controlledChecked = computed(() => hasOwn(rawProps, 'checked') && props.checked !== undefined)

    onMounted(() => group?.registerValue(props.value))
    onBeforeUnmount(() => group?.cancelValue(props.value))

    const mergedChecked = computed(() => {
      if (group) {
        const groupValue = group.value.value
        return group.multiple.value
          ? Array.isArray(groupValue) && groupValue.includes(props.value as CheckCardValueType)
          : groupValue === props.value
      }
      return controlledChecked.value ? !!props.checked : innerChecked.value
    })

    const setChecked = (checked: boolean) => {
      if (!controlledChecked.value && !group)
        innerChecked.value = checked
      emit('change', checked)
    }

    const renderCover = (prefixCls: string, cover: VNodeChild) => (
      <div class={`${prefixCls}-cover`}>
        {typeof cover === 'string' ? <img src={cover} alt="checkcard" /> : cover}
      </div>
    )

    return () => {
      const prefixCls = mergedPrefixCls.value
      const disabled = !!(props.disabled || group?.disabled.value)
      const loading = !!(props.loading || group?.loading.value)
      const bordered = props.bordered ?? group?.bordered.value ?? true
      const multiple = !!group?.multiple.value
      const size = props.size || group?.size.value
      const sizeCls = getSizeCls(size)
      const checked = loading ? false : mergedChecked.value
      const title = slots.title?.() ?? props.title
      const subTitle = slots.subTitle?.() ?? props.subTitle
      const description = slots.description?.() ?? props.description
      const extra = slots.extra?.() ?? props.extra
      const cover = slots.cover?.() ?? props.cover

      const classString = clsx(prefixCls, hashId, props.class, props.className, {
        [`${prefixCls}-loading`]: loading,
        [`${prefixCls}-${sizeCls}`]: sizeCls,
        [`${prefixCls}-checked`]: checked,
        [`${prefixCls}-multiple`]: multiple,
        [`${prefixCls}-disabled`]: disabled,
        [`${prefixCls}-bordered`]: bordered,
        [`${prefixCls}-ghost`]: props.ghost,
      })

      const avatarDom = props.avatar
        ? (
            <div class={`${prefixCls}-avatar`}>
              {typeof props.avatar === 'string'
                ? <Avatar size={48} shape="square" src={props.avatar} />
                : props.avatar}
            </div>
          )
        : null

      const headerDom = (title ?? extra) != null
        ? (
            <div class={`${prefixCls}-header`}>
              <div class={`${prefixCls}-header-left`}>
                <div class={clsx(`${prefixCls}-title`, { [`${prefixCls}-title-with-ellipsis`]: typeof title === 'string' })}>
                  {title}
                </div>
                {subTitle != null ? <div class={`${prefixCls}-subTitle`}>{subTitle}</div> : null}
              </div>
              {extra != null ? <div class={`${prefixCls}-extra`}>{extra}</div> : null}
            </div>
          )
        : null

      const descriptionDom = description
        ? <div class={`${prefixCls}-description`}>{description}</div>
        : null

      const metaDom = loading
        ? <CardLoading prefixCls={prefixCls} />
        : cover
          ? renderCover(prefixCls, cover)
          : (
              <div class={clsx(`${prefixCls}-content`, { [`${prefixCls}-avatar-header`]: avatarDom && headerDom && !descriptionDom })}>
                {avatarDom}
                {headerDom || descriptionDom
                  ? (
                      <div class={`${prefixCls}-detail`}>
                        {headerDom}
                        {descriptionDom}
                      </div>
                    )
                  : null}
              </div>
            )

      return wrapSSR(
        <div
          {...attrs}
          class={classString}
          style={props.style}
          onClick={(event: MouseEvent) => {
            if (loading || disabled)
              return
            emit('click', event)
            group?.toggleOption?.({ value: props.value as CheckCardValueType })
            setChecked(!checked)
          }}
          onMouseenter={(event: MouseEvent) => emit('mouseenter', event)}
          onMouseleave={(event: MouseEvent) => emit('mouseleave', event)}
        >
          {metaDom}
          {slots.default
            ? (
                <div class={`${prefixCls}-body`} style={props.styles?.body || props.bodyStyle}>
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

const CheckCardWithGroup = Object.assign(CheckCard, {
  Group: CheckCardGroup,
})

export type { CheckCardGroupProps }
export { CheckCardGroup }
export default CheckCardWithGroup
