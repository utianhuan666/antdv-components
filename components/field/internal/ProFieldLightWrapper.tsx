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

      return (
        <div
          onMousedown={(event: MouseEvent) => {
            const target = event.target as Node
            const isLabelMouseDown = lightLabel.labelRef.value?.contains(target) ?? false
            const isClearMouseDown = lightLabel.clearRef.value?.contains(target) ?? false
            labelTrigger.value = isLabelMouseDown && !isClearMouseDown
          }}
          onMouseup={() => {
            labelTrigger.value = false
          }}
        >
          {cloneVNode(child, {
            lightLabel,
            labelTrigger: labelTrigger.value,
          })}
        </div>
      )
    }
  },
})

export function wrapProFieldLight(light: boolean | undefined, child: VNode, _mode?: string) {
  if (!light)
    return child
  return <ProFieldLightWrapper isLight>{child}</ProFieldLightWrapper>
}

export default ProFieldLightWrapper
