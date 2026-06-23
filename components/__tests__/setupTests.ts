import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import { afterEach, expect, vi } from 'vitest'

dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(localeData)
dayjs.extend(weekday)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument: () => T
    toHaveAttribute: (name: string, value?: string) => T
    toHaveClass: (...classNames: string[]) => T
  }
}

expect.extend({
  toBeInTheDocument(received: Element | null) {
    const pass = !!received && document.body.contains(received)
    return {
      pass,
      message: () => pass ? 'expected element not to be in the document' : 'expected element to be in the document',
    }
  },
  toHaveAttribute(received: Element | null, name: string, value?: string) {
    const actual = received?.getAttribute(name)
    const pass = value === undefined ? actual !== null : actual === value
    return {
      pass,
      message: () => pass
        ? `expected element not to have attribute ${name}`
        : `expected element to have attribute ${name}${value === undefined ? '' : `=${value}`}`,
    }
  },
  toHaveClass(received: Element | null, ...classNames: string[]) {
    const actual = Array.from(received?.classList || [])
    const pass = !!received && classNames.every(className => actual.includes(className))
    return {
      pass,
      message: () => pass
        ? `expected element not to have class ${classNames.join(' ')}`
        : `expected element to have class ${classNames.join(' ')}`,
    }
  },
})

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

const originalGetComputedStyle = window.getComputedStyle.bind(window)
window.getComputedStyle = ((element: Element, pseudoElt?: string | null) => {
  try {
    return originalGetComputedStyle(element, pseudoElt)
  }
  catch {
    return {
      display: 'block',
      visibility: 'visible',
      width: '0px',
      height: '0px',
      overflow: 'visible',
      overflowX: 'visible',
      overflowY: 'visible',
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration
  }
}) as typeof window.getComputedStyle

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
