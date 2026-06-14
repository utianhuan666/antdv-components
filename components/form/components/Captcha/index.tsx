import type { ButtonProps, InputProps } from 'antdv-next'
import type { NamePath } from '../../../utils/typing'
import type { ProFormFieldItemProps } from '../../typing'
import { Button, Input } from 'antdv-next'
import { computed, defineComponent, ref, watch } from 'vue'
import { useProFormContext } from '../../../utils'
import { mergeFieldProps } from '../_util'
import { proFormFieldPropNames, warpField } from '../FormItem/warpField'

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

const captchaPropNames = [
  'countDown',
  'phoneName',
  'onGetCaptcha',
  'onTiming',
  'captchaTextRender',
  'captchaProps',
  'value',
  'onChange',
  'fieldProps',
]

const BaseProFormCaptcha = defineComponent<ProFormCaptchaProps>({
  name: 'BaseProFormCaptcha',
  inheritAttrs: false,
  props: captchaPropNames,
  setup(rawProps, { expose }) {
    const props = rawProps
    const proFormContext = useProFormContext()
    const form = computed(() => proFormContext.formRef?.value)
    const containerRef = ref<HTMLDivElement | null>(null)
    const inputRef = ref<any>()
    const count = ref(props.countDown || 60)
    const timing = ref(false)
    const loading = ref<boolean>()

    const startTiming = () => {
      timing.value = true
    }

    const endTiming = () => {
      timing.value = false
    }

    const onGetCaptcha = async (mobile: string) => {
      try {
        loading.value = true
        await props.onGetCaptcha(mobile)
        loading.value = false
        timing.value = true
      }
      catch (error) {
        timing.value = false
        loading.value = false
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }

    watch(
      timing,
      (isTiming, _preTiming, onCleanup) => {
        let interval: ReturnType<typeof setInterval> | undefined
        const { countDown } = props

        if (isTiming) {
          interval = setInterval(() => {
            if (count.value <= 1) {
              timing.value = false
              if (interval)
                clearInterval(interval)
              count.value = countDown || 60
              return
            }
            count.value -= 1
          }, 1000)
        }

        onCleanup(() => {
          if (interval)
            clearInterval(interval)
        })
      },
    )

    watch(
      [count, () => props.onTiming],
      ([value]) => {
        props.onTiming?.(value as number)
      },
      { immediate: true },
    )

    expose({
      nativeElement: containerRef,
      focus: () => inputRef.value?.focus?.(),
      startTiming,
      endTiming,
    })

    return () => {
      const { style, ...fieldProps } = mergeFieldProps(props)
      const {
        captchaProps,
        captchaTextRender = (paramsTiming: boolean, paramsCount: number) => {
          return paramsTiming ? `${paramsCount} 秒后重新获取` : '获取验证码'
        },
      } = props

      return (
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
            {...captchaProps}
            onClick={async () => {
              try {
                if (props.phoneName) {
                  const namePath = [props.phoneName].flat(1) as string[]
                  await form.value?.validateFields?.(namePath)
                  const mobile = form.value?.getFieldValue?.(namePath)
                  await onGetCaptcha(mobile)
                }
                else {
                  await onGetCaptcha('')
                }
              }
              catch (error) {
                // eslint-disable-next-line no-console
                console.log(error)
              }
            }}
          >
            {captchaTextRender(timing.value, count.value)}
          </Button>
        </div>
      )
    }
  },
})

const proFormCaptchaPropNames = [...proFormFieldPropNames, ...captchaPropNames]

const ProFormCaptcha = warpField(
  BaseProFormCaptcha,
  [],
  proFormCaptchaPropNames,
) as typeof BaseProFormCaptcha

export default ProFormCaptcha
