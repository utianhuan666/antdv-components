/// <reference types="vue/jsx" />

import type {
  ComponentObjectPropsOptions,
  ComponentOptions,
  ComponentOptionsMixin,
  DefineComponent,
  EmitsOptions,
  PublicProps,
  RenderFunction,
  SetupContext,
  SlotsType,
} from 'vue'

type EmitArgs<T> = T extends (...a: infer A) => any ? A : T extends any[] ? T : never

type EmitFnFromRecord<E> = <K extends Extract<keyof E, string>>(event: K, ...args: EmitArgs<E[K]>) => void

type NormalizeEmits<E extends object> = {
  [K in Extract<keyof E, string>]: (...args: EmitArgs<E[K]>) => any
}

type SetupContextLoose<E, S extends SlotsType> = Omit<SetupContext<EmitsOptions, S>, 'emit'> & {
  emit: EmitFnFromRecord<E>
}

declare module 'vue' {
  /**
   * - E 不要求 EmitsOptions（无需索引签名）
   * - 返回尽量贴近 Vue 原生 DefineComponent 产物形状
   */
  export function defineComponent<
    Props extends Record<string, any>,
    E extends object = {},
    EE extends string = string,
    S extends SlotsType = any,
  >(
    setup: (props: Props, ctx: SetupContextLoose<E, S>) => RenderFunction | Promise<RenderFunction>,
    options?: Pick<ComponentOptions, 'name' | 'inheritAttrs'> & {
      props?: (keyof Props)[]
      emits?: EE[] // runtime emits 用字符串数组就好
      slots?: S
      /**
       * @private
       */
      __typeEmits?: E
      __typeProps?: Props
    },
  ): DefineComponent<
    Props,
    {},
    {},
    {},
    {},
    ComponentOptionsMixin,
    ComponentOptionsMixin,
    NormalizeEmits<E>,
    EE,
    PublicProps,
    Readonly<Props>,
    {},
    S
  >

  export function defineComponent<
    Props extends Record<string, any>,
    E extends object = {},
    EE extends string = string,
    S extends SlotsType = any,
  >(
    setup: (props: Props, ctx: SetupContextLoose<E, S>) => RenderFunction | Promise<RenderFunction>,
    options?: Pick<ComponentOptions, 'name' | 'inheritAttrs'> & {
      props?: ComponentObjectPropsOptions<Props>
      emits?: EE[]
      slots?: S
      /**
       * @private
       */
      __typeEmits?: E
      __typeProps?: Props
    },
  ): DefineComponent<
    Props,
    {},
    {},
    {},
    {},
    ComponentOptionsMixin,
    ComponentOptionsMixin,
    NormalizeEmits<E>,
    EE,
    PublicProps,
    Readonly<Props>,
    {},
    S
  >
}

export {}
