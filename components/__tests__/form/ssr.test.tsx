import { expect, it, vi } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { DrawerForm, ModalForm, ProForm } from '../../form'

if (typeof window === 'undefined') {
  ;(globalThis as any).window = {
    matchMedia: vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
    innerWidth: 1024,
    innerHeight: 768,
    document: {
      body: {
        offsetWidth: 1024,
        offsetHeight: 768,
        offsetLeft: 0,
      },
    },
  }
}

it('ssr', async () => {
  await expect(renderToString(createSSRApp(() => <ProForm />))).resolves.toBeDefined()
  await expect(renderToString(createSSRApp(() => <ModalForm />))).resolves.toBeDefined()
  await expect(renderToString(createSSRApp(() => <DrawerForm />))).resolves.toBeDefined()
})
