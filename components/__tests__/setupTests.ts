import { afterEach, vi } from 'vitest'

afterEach(() => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
})

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

if (!window.ResizeObserver)
  window.ResizeObserver = ResizeObserverMock as any

if (!window.URL.createObjectURL)
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')

if (!window.URL.revokeObjectURL)
  window.URL.revokeObjectURL = vi.fn()

class FileReaderMock {
  result: string | ArrayBuffer | null = 'data:image/png;base64,mock'
  onload: null | (() => void) = null
  onerror: null | (() => void) = null

  readAsDataURL() {
    this.onload?.()
  }
}

if (!window.FileReader)
  window.FileReader = FileReaderMock as any
