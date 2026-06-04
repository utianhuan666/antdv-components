import type { ButtonProps, InputProps, InputRef } from 'antdv-next'
import type { FunctionalComponent, VNodeChild } from 'vue'
import type { NamePath, ProFormFieldItemProps } from '../../typing'
import { Button, Input } from 'antdv-next'
import { computed, defineComponent, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useFieldContext } from '../../FieldContext'
import ProFormItem from '../FormItem'

type CaptFieldRefHolder = { value?: CaptFieldRef } | { current?: CaptFieldRef }

export type ProFormCaptchaProps = Omit<ProFormFieldItemProps<InputProps>, 'fieldRef'> & {
  countDown?: number
  phoneName?: NamePath
  onGetCaptcha: (mobile: string) => Promise<void>
  onTiming?: (count: number) => void
  captchaTextRender?: (timing: boolean, count: number) => VNodeChild
  captchaProps?: ButtonProps & Record<string, any>
  value?: InputProps['value']
  onChange?: InputProps['onChange']
  fieldRef?: CaptFieldRefHolder
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

const captchaPropNames = [
  'name',
  'label',
  'tooltip',
  'rules',
  'required',
  'initialValue',
  'transform',
  'convertValue',
  'formItemProps',
  'fieldProps',
  'captchaProps',
  'countDown',
  'phoneName',
  'onGetCaptcha',
  'onTiming',
  'captchaTextRender',
  'fieldRef',
  'ignoreFormItem',
]

function isEnabledProp(value: unknown) {
  return value === true || value === ''
}

function getCountDown(value: unknown) {
  const count = Number(value ?? 60)
  return Number.isNaN(count) ? 60 : count
}

const ProFormCaptchaImpl = defineComponent({
  name: 'ProFormCaptcha',
  inheritAttrs: false,
  props: captchaPropNames,
  emits: ['change'],
  setup(rawProps, { emit, attrs, expose }) {
    const props = rawProps as unknown as ProFormCaptchaProps
    const fieldContext = useFieldContext()
    const containerRef = ref<HTMLDivElement>()
    const inputRef = ref<InputRef>()
    const count = ref(getCountDown(props.countDown))
    const timing = ref(false)
    const loading = ref(false)
    let timer: number | undefined
    const ignoreFormItem = computed(() => isEnabledProp(props.ignoreFormItem))

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
        count.value = getCountDown(props.countDown)
    }

    function startTiming() {
      stopTimer(false)
      timing.value = true
      count.value = getCountDown(props.countDown)
      timer = window.setInterval(() => {
        if (count.value <= 1) {
          stopTimer()
          return
        }
        count.value -= 1
      }, 1000)
    }

    async function handleCaptchaClick(event: MouseEvent) {
      props.captchaProps?.onClick?.(event as Parameters<NonNullable<ButtonProps['onClick']>>[0])
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

    function handleChange(event: Parameters<NonNullable<InputProps['onChange']>>[0]) {
      const nextValue = (event as { target?: { value?: unknown } })?.target?.value ?? event
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
      else if ('current' in props.fieldRef)
        props.fieldRef.current = captchaApi
    })
    expose(captchaApi)

    const defaultCaptchaTextRender = (isTiming: boolean, currentCount: number) =>
      isTiming ? `${currentCount} 秒后重新获取` : '获取验证码'

    return () => {
      const fieldProps = props.fieldProps || {}
      const captchaProps = props.captchaProps || {}
      const {
        onChange: _onChange,
        style: fieldStyle,
        ...inputProps
      } = fieldProps
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
            {...captchaProps}
            disabled={timing.value || isEnabledProp(captchaProps.disabled)}
            loading={loading.value || captchaProps.loading}
            onClick={handleCaptchaClick}
          >
            {captchaTextRender(timing.value, count.value)}
          </Button>
        </div>
      )

      if (ignoreFormItem.value || props.name === undefined)
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

const ProFormCaptcha = ProFormCaptchaImpl as unknown as FunctionalComponent<ProFormCaptchaProps>

export default ProFormCaptcha
