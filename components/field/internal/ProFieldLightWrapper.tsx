import type { VNode } from 'vue'
import { cloneVNode, defineComponent, ref } from 'vue'

export interface ProFieldLightInjectedProps {
  lightLabel?: {
    labelRef: { value: HTMLElement | null }
    clearRef: { value: HTMLElement | null }
  }
  labelTrigger?: boolean
}

const ProFieldLightWrapper = defineComponent({
  name: 'ProFieldLightWrapper',
  props: {
    isLight: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const labelTrigger = ref(false)
    const lightLabel = {
      labelRef: ref<HTMLElement | null>(null),
      clearRef: ref<HTMLElement | null>(null),
    }

    return () => {
      const child = slots.default?.()[0] as VNode | undefined
      if (!props.isLight || !child)
        return child ?? null

      return cloneVNode(child, {
        lightLabel,
        labelTrigger: labelTrigger.value,
        onMousedown: (event: MouseEvent) => {
          labelTrigger.value = lightLabel.labelRef.value?.contains(event.target as Node) ?? false
        },
        onMouseup: () => {
          labelTrigger.value = false
        },
      })
    }
  },
})

export function wrapProFieldLight(light: boolean | undefined, child: VNode, mode?: string) {
  const currentMode = mode ?? (child.props as Record<string, any> | null)?.mode
  if (!light || (currentMode !== 'edit' && currentMode !== 'update'))
    return child
  return <ProFieldLightWrapper isLight>{child}</ProFieldLightWrapper>
}

export default ProFieldLightWrapper
