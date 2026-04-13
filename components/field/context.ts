import type { InjectionKey, VNodeChild } from 'vue'
import type { ProFieldFCMode } from './internal/fieldMode'
import { inject } from 'vue'

// ---------------------------------------------------------------------------
// ProRenderFieldPropsType – customisers registered in valueTypeMap
// ---------------------------------------------------------------------------

export interface ProRenderFieldPropsType {
  /**
   * Custom read-mode renderer.
   * @param text   – the display value
   * @param props  – merged field props (without value / onChange)
   * @param dom    – the default rendered VNode
   */
  render?: (
    text: any,
    props: Omit<ProFieldFCRenderProps, 'value' | 'onChange'>,
    dom: JSX.Element,
  ) => JSX.Element | undefined

  /**
   * Custom edit-mode renderer.
   * @param text   – the display value
   * @param props  – merged field props
   * @param dom    – the default rendered VNode
   */
  formItemRender?: (
    text: any,
    props: ProFieldFCRenderProps,
    dom: JSX.Element,
  ) => JSX.Element
}

// ---------------------------------------------------------------------------
// Minimal render-props type used inside ProConfigContext
// ---------------------------------------------------------------------------

export interface ProFieldFCRenderProps {
  mode?: ProFieldFCMode
  readonly?: boolean
  placeholder?: string | string[]
  value?: any
  onChange?: (...args: any[]) => void
  text?: any
  fieldProps?: any
  light?: boolean
  label?: VNodeChild
  valueEnum?: any
  proFieldKey?: string | number
}

// ---------------------------------------------------------------------------
// ProConfig provide / inject
// ---------------------------------------------------------------------------

export interface ProConfigContextType {
  /** Custom / override valueType → render mapping. */
  valueTypeMap?: Record<string, ProRenderFieldPropsType>
}

export const ProConfigKey: InjectionKey<ProConfigContextType> = Symbol('ProConfig')

/** Inject the nearest ProConfig context (returns `{}` when no provider found). */
export const useProConfig = (): ProConfigContextType => inject(ProConfigKey, {})
