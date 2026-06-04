import type { PropType, VNodeChild } from 'vue'
import type { NamePath, ProFormFieldItemProps } from '../../typing'
import { Button, Input } from 'antdv-next'
import { computed, defineComponent, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

export interface ProFormCaptchaProps extends ProFormFieldItemProps {
  countDown?: number
  phoneName?: NamePath
  onGetCaptcha: (mobile: string) => Promise<void>
  onTiming?: (count: number) => void
  captchaTextRender?: (timing: boolean, count: number) => VNodeChild
  captchaProps?: Record<string, any>
}

export interface CaptFieldRef {
  nativeElement?: HTMLDivElement
  focus: () => void
  startTiming: () => void
  endTiming: () => void
}

function getValueByNamePath(model: Record<string, any>, name: NamePath) {
  const path = Array.isArray(name) ? name : [name]
  return path.reduce<any>((current, key) => current?.[key], model)
}

function setValueByNamePath(model: Record<string, any>, name: NamePath, value: any) {
  const path = Array.isArray(name) ? name : [name]
  const last = path[path.length - 1]
  if (last === undefined)
    return
  const parent = path.slice(0, -1).reduce<Record<string, any>>((current, key) => {
    if (!current[key] || typeof current[key] !== 'object')
      current[key] = {}
    return current[key]
  }, model)
  parent[last] = value
}

const ProFormCaptcha = defineComponent({
  name: 'ProFormCaptcha',
  inheritAttrs: false,
  props: {
    name: { type: [String, Number, Array] as PropType<NamePath>, default: undefined },
    label: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    tooltip: { type: [String, Number, Object] as PropType<VNodeChild>, default: undefined },
    rules: { type: Array as PropType<any[]>, default: undefined },
    required: { type: Boolean, default: undefined },
    initialValue: { type: null as unknown as PropType<ProFormFieldItemProps['initialValue']>, default: undefined },
    transform: { type: Function as PropType<NonNullable<ProFormFieldItemProps['transform']>>, default: undefined },
    convertValue: { type: Function as PropType<NonNullable<ProFormFieldItemProps['convertValue']>>, default: undefined },
    formItemProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    captchaProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    countDown: { type: Number, default: 60 },
    phoneName: { type: [String, Number, Array] as PropType<NamePath>, default: undefined },
    onGetCaptcha: { type: Function as PropType<(mobile: string) => Promise<void>>, required: true },
    onTiming: { type: Function as PropType<(count: number) => void>, default: undefined },
    captchaTextRender: {
      type: Function as PropType<(timing: boolean, count: number) => VNodeChild>,
      default: undefined,
    },
    fieldRef: { type: Object as PropType<Record<string, any>>, default: undefined },
    ignoreFormItem: { type: Boolean, default: false },
  },
  emits: ['change'],
  setup(props, { emit, attrs, expose }) {
    const fieldContext = useFieldContext()
    const containerRef = ref<HTMLDivElement>()
    const inputRef = ref<any>()
    const count = ref(props.countDown)
    const timing = ref(false)
    const loading = ref(false)
    let timer: number | undefined

    const value = computed(() => {
      if (props.name === undefined)
        return props.fieldProps?.value
      return getValueByNamePath(fieldContext.model || {}, props.name)
    })

    function setCellValue(nextValue: any) {
      if (props.name === undefined)
        return
      setValueByNamePath(fieldContext.model || {}, props.name, nextValue)
    }

    function stopTimer(resetCount = true) {
      if (timer)
        window.clearInterval(timer)
      timer = undefined
      timing.value = false
      if (resetCount)
        count.value = props.countDown
    }

    function startTiming() {
      stopTimer(false)
      timing.value = true
      count.value = props.countDown
      timer = window.setInterval(() => {
        if (count.value <= 1) {
          stopTimer()
          return
        }
        count.value -= 1
      }, 1000)
    }

    async function handleCaptchaClick(event: MouseEvent) {
      props.captchaProps?.onClick?.(event)
      const mobile = props.phoneName === undefined
        ? ''
        : getValueByNamePath(fieldContext.model || {}, props.phoneName)
      try {
        loading.value = true
        await props.onGetCaptcha(String(mobile ?? ''))
        startTiming()
      }
      finally {
        loading.value = false
      }
    }

    function handleChange(event: any) {
      const nextValue = event?.target?.value ?? event
      setCellValue(nextValue)
      emit('change', event)
      props.fieldProps?.onChange?.(event)
    }

    function applyInitialValue() {
      if (props.name === undefined || props.initialValue === undefined)
        return
      if (getValueByNamePath(fieldContext.model || {}, props.name) === undefined)
        setCellValue(props.initialValue)
    }

    watch(() => props.initialValue, applyInitialValue, { immediate: true })
    watch(count, nextCount => props.onTiming?.(nextCount))
    onUnmounted(() => stopTimer(false))

    const captchaApi = {
      get nativeElement() {
        return containerRef.value
      },
      focus: () => inputRef.value?.focus?.(),
      startTiming,
      endTiming: () => stopTimer(),
    }

    watchEffect(() => {
      if (!props.fieldRef)
        return
      if ('value' in props.fieldRef)
        props.fieldRef.value = captchaApi
      else
        props.fieldRef.current = captchaApi
    })
    expose(captchaApi)

    const defaultCaptchaTextRender = (isTiming: boolean, currentCount: number) =>
      isTiming ? `${currentCount} 秒后重新获取` : '获取验证码'

    return () => {
      const {
        onChange: _onChange,
        style: fieldStyle,
        ...inputProps
      } = props.fieldProps || {}
      const captchaTextRender = props.captchaTextRender || defaultCaptchaTextRender
      const captchaNode = (
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            ...(fieldStyle || {}),
          }}
        >
          <Input
            {...attrs}
            {...inputProps}
            ref={inputRef}
            value={value.value}
            style={{
              flex: 1,
              transition: 'width .3s',
              marginRight: 8,
              ...(fieldStyle || {}),
            }}
            onChange={handleChange}
          />
          <Button
            {...props.captchaProps}
            disabled={timing.value || props.captchaProps?.disabled}
            loading={loading.value || props.captchaProps?.loading}
            onClick={handleCaptchaClick}
          >
            {captchaTextRender(timing.value, count.value)}
          </Button>
        </div>
      )

      if (props.ignoreFormItem || props.name === undefined)
        return captchaNode

      return (
        <ProFormItem
          name={props.name}
          label={props.label}
          tooltip={props.tooltip}
          rules={props.rules}
          required={props.required}
          initialValue={props.initialValue}
          transform={props.transform}
          convertValue={props.convertValue}
          formItemProps={{
            ...(fieldContext.formItemProps || {}),
            ...(props.formItemProps || {}),
          }}
        >
          {captchaNode}
        </ProFormItem>
      )
    }
  },
})

export default ProFormCaptcha
