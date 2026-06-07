import type { ButtonProps, InputProps } from 'antdv-next'
import type { NamePath } from '../../../utils/typing'
import type { ProFormFieldItemProps } from '../../typing'
import { Button, Input } from 'antdv-next'
import { defineComponent, onBeforeUnmount, ref, watch } from 'vue'
import { mergeFieldProps, renderFormItem } from '../_util'

export type ProFormCaptchaProps = ProFormFieldItemProps<InputProps> & {
  countDown?: number
  phoneName?: NamePath
  onGetCaptcha: (mobile: string) => Promise<void>
  onTiming?: (count: number) => void
  captchaTextRender?: (timing: boolean, count: number) => any
  captchaProps?: ButtonProps
  value?: any
  onChange?: any
}

export interface CaptFieldRef {
  nativeElement: HTMLDivElement | null
  focus: () => void
  startTiming: () => void
  endTiming: () => void
}

const ProFormCaptcha = defineComponent({
  name: 'ProFormCaptcha',
  inheritAttrs: false,
  setup(props: ProFormCaptchaProps, { attrs, expose }) {
    const containerRef = ref<HTMLDivElement | null>(null)
    const inputRef = ref<any>()
    const count = ref(props.countDown || 60)
    const timing = ref(false)
    const loading = ref(false)
    let timer: ReturnType<typeof setInterval> | undefined

    const stopTimer = () => {
      if (timer)
        clearInterval(timer)
      timer = undefined
    }

    const startTiming = () => {
      stopTimer()
      timing.value = true
      timer = setInterval(() => {
        count.value -= 1
        if (count.value <= 0) {
          stopTimer()
          timing.value = false
          count.value = props.countDown || 60
        }
      }, 1000)
    }

    const endTiming = () => {
      stopTimer()
      timing.value = false
      count.value = props.countDown || 60
    }

    watch(count, value => props.onTiming?.(value))
    onBeforeUnmount(stopTimer)

    expose({
      nativeElement: containerRef,
      focus: () => inputRef.value?.focus?.(),
      startTiming,
      endTiming,
    })

    return () => {
      const current = { ...attrs, ...props } as ProFormCaptchaProps
      const { style, ...fieldProps } = mergeFieldProps(current)
      const captchaTextRender = current.captchaTextRender || ((isTiming: boolean, currentCount: number) =>
        isTiming ? `${currentCount} 秒后重新获取` : '获取验证码')

      const dom = (
        <div
          ref={containerRef}
          style={{ ...style, display: 'flex', alignItems: 'center' }}
        >
          <Input
            {...fieldProps}
            ref={inputRef}
            style={{ flex: 1, transition: 'width .3s', marginRight: 8, ...style }}
          />
          <Button
            style={{ display: 'block' }}
            disabled={timing.value}
            loading={loading.value}
            {...current.captchaProps}
            onClick={async () => {
              try {
                loading.value = true
                await current.onGetCaptcha?.('')
                startTiming()
              }
              finally {
                loading.value = false
              }
            }}
          >
            {captchaTextRender(timing.value, count.value)}
          </Button>
        </div>
      )

      return renderFormItem(current, dom)
    }
  },
}) as any

ProFormCaptcha.displayName = 'ProFormComponent'

export default ProFormCaptcha
