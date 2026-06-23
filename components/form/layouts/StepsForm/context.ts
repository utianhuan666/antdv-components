import type { FormInstance } from 'antdv-next'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { StepFormProps } from './StepForm'

export interface StepsFormContextValue {
  regForm: (name: string, props: StepFormProps<any>) => void
  unRegForm: (name: string) => void
  onFormFinish: (name: string, formData: any) => void
  keyArray: Ref<string[]>
  formArrayRef: Ref<Ref<FormInstance | undefined>[]>
  loading: Ref<boolean>
  setLoading: (loading: boolean) => void
  lastStep: ComputedRef<boolean>
  formMapRef: Ref<Map<string, StepFormProps>>
  next: () => void
  current: Ref<number>
  stepCount: ComputedRef<number>
  setCurrent: (index: number) => void
}

export const StepsFormContextKey: InjectionKey<StepsFormContextValue> = Symbol('StepsFormContext')
export const StepFormContextKey: InjectionKey<(StepFormProps<any> & Record<string, any>) | null> = Symbol('StepFormContext')
