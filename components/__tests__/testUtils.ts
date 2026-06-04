import { mount } from '@vue/test-utils'

export async function waitFor(assertion: () => void | Promise<void>, timeout = 1000) {
  const startedAt = Date.now()
  let lastError: unknown

  while (Date.now() - startedAt < timeout) {
    try {
      await assertion()
      return
    }
    catch (error) {
      lastError = error
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

  throw lastError
}

export function mountAttached(component: any) {
  return mount(component, { attachTo: document.body })
}
