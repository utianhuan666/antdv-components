import type { VNodeChild } from 'vue'
import { Result } from 'antdv-next'
import { defineComponent, onErrorCaptured, ref } from 'vue'

export const ErrorBoundary = defineComponent({
  name: 'ProErrorBoundary',
  setup(_, { slots }) {
    const errorInfo = ref('')
    onErrorCaptured((error) => {
      console.warn('ErrorBoundary caught an error', error)
      errorInfo.value = error instanceof Error ? error.message : String(error)
      return false
    })
    return (): VNodeChild => {
      if (errorInfo.value) {
        return (
          <Result
            status="error"
            title="Something went wrong."
            extra={errorInfo.value}
          />
        )
      }
      return slots.default?.()
    }
  },
})

export default ErrorBoundary
