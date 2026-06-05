import { shallowRef } from 'vue'

export default function useForceRender() {
  const tick = shallowRef(true)
  return () => {
    tick.value = !tick.value
  }
}
