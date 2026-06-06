import type { VueWrapper } from '@vue/test-utils'
import type { VNodeChild } from 'vue'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import { defineComponent, nextTick, shallowRef } from 'vue'

type Matcher = string | RegExp | ((content: string, element: Element | null) => boolean)

const mountedWrappers = new Set<VueWrapper<any>>()

interface RenderQueries {
  baseElement: HTMLElement
  container: HTMLElement
  queryByText: (matcher: Matcher) => HTMLElement | null
  queryAllByText: (matcher: Matcher) => HTMLElement[]
  getByText: (matcher: Matcher) => HTMLElement
  getAllByText: (matcher: Matcher) => HTMLElement[]
  findByText: (matcher: Matcher, queryOptions?: unknown, waitOptions?: { timeout?: number }) => Promise<HTMLElement>
  findAllByText: (matcher: Matcher, queryOptions?: unknown, waitOptions?: { timeout?: number }) => Promise<HTMLElement[]>
  queryByDisplayValue: (value: string | RegExp) => HTMLElement | null
  getByDisplayValue: (value: string | RegExp) => HTMLElement
  findByDisplayValue: (value: string | RegExp, queryOptions?: unknown, waitOptions?: { timeout?: number }) => Promise<HTMLElement>
  findAllByDisplayValue: (value: string | RegExp, queryOptions?: unknown, waitOptions?: { timeout?: number }) => Promise<HTMLElement[]>
  queryAllByRole: (role: string, options?: { name?: Matcher }) => HTMLElement[]
  getByRole: (role: string, options?: { name?: Matcher }) => HTMLElement
  findByRole: (role: string, options?: { name?: Matcher }, waitOptions?: { timeout?: number }) => Promise<HTMLElement>
  getByTestId: (testId: string) => HTMLElement
  queryByTestId: (testId: string) => HTMLElement | null
  findByTestId: (testId: string, queryOptions?: unknown, waitOptions?: { timeout?: number }) => Promise<HTMLElement>
}

interface RenderResult extends RenderQueries {
  rerender: (next: VNodeChild) => Promise<void>
  unmount: () => void
  asFragment: () => HTMLElement
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function matches(text: string, matcher: Matcher, element: Element | null = null) {
  const normalized = normalizeText(text)
  if (typeof matcher === 'string')
    return normalized === matcher || normalized.includes(matcher)
  if (matcher instanceof RegExp)
    return matcher.test(normalized)
  return matcher(normalized, element)
}

function elementMatchesText(element: Element, matcher: Matcher) {
  return matches(element.textContent || '', matcher, element)
}

function queryAllByTextFrom(container: ParentNode, matcher: Matcher) {
  return Array.from(container.querySelectorAll('*')).filter((element) => {
    if (!elementMatchesText(element, matcher))
      return false
    return !Array.from(element.children).some(child => elementMatchesText(child, matcher))
  }) as HTMLElement[]
}

function queryByTextFrom(container: ParentNode, matcher: Matcher) {
  return queryAllByTextFrom(container, matcher)[0] || null
}

function getByTextFrom(container: ParentNode, matcher: Matcher) {
  const element = queryByTextFrom(container, matcher)
  if (!element)
    throw new Error(`Unable to find element with text: ${String(matcher)}`)
  return element
}

function queryAllByDisplayValueFrom(container: ParentNode, value: string | RegExp) {
  return Array.from(container.querySelectorAll('input,textarea,select')).filter((element: any) =>
    matches(String(element.value ?? ''), value, element),
  ) as HTMLElement[]
}

function getByDisplayValueFrom(container: ParentNode, value: string | RegExp) {
  const element = queryAllByDisplayValueFrom(container, value)[0]
  if (!element)
    throw new Error(`Unable to find input with value: ${String(value)}`)
  return element
}

function queryAllByRoleFrom(container: ParentNode, role: string, options?: { name?: Matcher }) {
  const selectorByRole: Record<string, string> = {
    button: 'button,[role="button"],input[type="button"],input[type="submit"]',
    img: '[role="img"],svg,img',
    menuitem: '[role="menuitem"],li,.ant-dropdown-menu-item,.ant-menu-item',
  }
  const selector = selectorByRole[role] || `[role="${role}"]`
  let elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[]
  if (options?.name !== undefined)
    elements = elements.filter(element => matches(element.textContent || element.getAttribute('aria-label') || '', options.name!, element))
  return elements
}

function getByRoleFrom(container: ParentNode, role: string, options?: { name?: Matcher }) {
  const element = queryAllByRoleFrom(container, role, options)[0]
  if (!element)
    throw new Error(`Unable to find element with role: ${role}`)
  return element
}

function queryByTestIdFrom(container: ParentNode, testId: string) {
  return container.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
}

function getByTestIdFrom(container: ParentNode, testId: string) {
  const element = queryByTestIdFrom(container, testId)
  if (!element)
    throw new Error(`Unable to find element by data-testid: ${testId}`)
  return element
}

export async function waitFor<T>(
  assertion: () => T | Promise<T>,
  options: number | { timeout?: number, interval?: number } = 1000,
): Promise<T> {
  const timeout = typeof options === 'number' ? options : options.timeout ?? 1000
  const interval = typeof options === 'number' ? 10 : options.interval ?? 10
  const startedAt = Date.now()
  let lastError: unknown

  while (Date.now() - startedAt < timeout) {
    try {
      const result = await assertion()
      await nextTick()
      return result
    }
    catch (error) {
      lastError = error
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }

  throw lastError
}

export function mountAttached(component: any): any {
  const wrapper = mount(component, { attachTo: document.body })
  mountedWrappers.add(wrapper)
  return wrapper
}

export async function act<T>(callback: () => T | Promise<T>): Promise<T> {
  const result = await callback()
  await nextTick()
  if (vi.isFakeTimers())
    await vi.advanceTimersByTimeAsync(0)
  await Promise.resolve()
  await nextTick()
  return result
}

export function waitForWaitTime(time = 100) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export const waitTime = waitForWaitTime

function buildQueries(container: HTMLElement): RenderQueries {
  return {
    baseElement: document.body,
    container,
    queryByText: (matcher: Matcher) => queryByTextFrom(container, matcher),
    queryAllByText: (matcher: Matcher) => queryAllByTextFrom(container, matcher),
    getByText: (matcher: Matcher) => getByTextFrom(container, matcher),
    getAllByText: (matcher: Matcher) => queryAllByTextFrom(container, matcher),
    findByText: (matcher: Matcher, _queryOptions?: unknown, waitOptions?: { timeout?: number }) =>
      waitFor(() => getByTextFrom(container, matcher), waitOptions || 1000),
    findAllByText: (matcher: Matcher, _queryOptions?: unknown, waitOptions?: { timeout?: number }) =>
      waitFor(() => {
        const elements = queryAllByTextFrom(container, matcher)
        if (!elements.length)
          throw new Error(`Unable to find elements with text: ${String(matcher)}`)
        return elements
      }, waitOptions || 1000),
    queryByDisplayValue: (value: string | RegExp) => queryAllByDisplayValueFrom(container, value)[0] || null,
    getByDisplayValue: (value: string | RegExp) => getByDisplayValueFrom(container, value),
    findByDisplayValue: (value: string | RegExp, _queryOptions?: unknown, waitOptions?: { timeout?: number }) =>
      waitFor(() => getByDisplayValueFrom(container, value), waitOptions || 1000),
    findAllByDisplayValue: (value: string | RegExp, _queryOptions?: unknown, waitOptions?: { timeout?: number }) =>
      waitFor(() => {
        const elements = queryAllByDisplayValueFrom(container, value)
        if (!elements.length)
          throw new Error(`Unable to find inputs with value: ${String(value)}`)
        return elements
      }, waitOptions || 1000),
    queryAllByRole: (role: string, options?: { name?: Matcher }) => queryAllByRoleFrom(container, role, options),
    getByRole: (role: string, options?: { name?: Matcher }) => getByRoleFrom(container, role, options),
    findByRole: (role: string, options?: { name?: Matcher }, waitOptions?: { timeout?: number }) =>
      waitFor(() => getByRoleFrom(container, role, options), waitOptions || 1000),
    getByTestId: (testId: string) => getByTestIdFrom(container, testId),
    queryByTestId: (testId: string) => queryByTestIdFrom(container, testId),
    findByTestId: (testId: string, _queryOptions?: unknown, waitOptions?: { timeout?: number }) =>
      waitFor(() => getByTestIdFrom(container, testId), waitOptions || 1000),
  }
}

export function render(vnode: VNodeChild): RenderResult {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const current = shallowRef<any>(vnode)
  const Host = defineComponent({
    name: 'TestRenderHost',
    setup() {
      return () => current.value as any
    },
  })
  const wrapper = mount(Host, { attachTo: root })
  mountedWrappers.add(wrapper)

  return {
    ...buildQueries(document.body),
    rerender(next: VNodeChild) {
      current.value = next
      return nextTick()
    },
    unmount() {
      wrapper.unmount()
      mountedWrappers.delete(wrapper)
      root.remove()
    },
    asFragment(): HTMLElement {
      return root.cloneNode(true) as HTMLElement
    },
  }
}

export function cleanup() {
  mountedWrappers.forEach(wrapper => wrapper.unmount())
  mountedWrappers.clear()
  document.body.innerHTML = ''
}

type MaybeElement = Element | null | undefined

function dispatch(element: MaybeElement, type: string, init: any = {}) {
  if (!element)
    throw new Error(`Unable to dispatch ${type}: target element is missing`)
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.entries(init || {}).forEach(([key, value]) => {
    if (key === 'target' || key === 'currentTarget')
      return
    Object.defineProperty(event, key, {
      configurable: true,
      enumerable: true,
      value,
    })
  })
  element.dispatchEvent(event)
  return event
}

function change(element: any, init: any = {}) {
  if (!element)
    throw new Error('Unable to dispatch change: target element is missing')
  if (init?.target && 'value' in init.target)
    element.value = init.target.value
  return dispatch(element, 'input', init)
}

export const fireEvent = Object.assign(
  (element: MaybeElement, event: Event) => {
    if (!element)
      throw new Error('Unable to dispatch event: target element is missing')
    return element.dispatchEvent(event)
  },
  {
    click: (element: MaybeElement, init?: any) => dispatch(element, 'click', init),
    change,
    input: change,
    blur: (element: MaybeElement, init?: any) => dispatch(element, 'blur', init),
    focus: (element: MaybeElement, init?: any) => dispatch(element, 'focus', init),
    keyDown: (element: MaybeElement, init?: any) => dispatch(element, 'keydown', init),
    keyUp: (element: MaybeElement, init?: any) => dispatch(element, 'keyup', init),
    mouseDown: (element: MaybeElement, init?: any) => dispatch(element, 'mousedown', init),
    mouseMove: (element: MaybeElement, init?: any) => dispatch(element, 'mousemove', init),
    mouseUp: (element: MaybeElement, init?: any) => dispatch(element, 'mouseup', init),
    mouseOver: (element: MaybeElement, init?: any) => dispatch(element, 'mouseover', init),
    mouseEnter: (element: MaybeElement, init?: any) => dispatch(element, 'mouseenter', init),
    mouseLeave: (element: MaybeElement, init?: any) => dispatch(element, 'mouseleave', init),
    drop: (element: MaybeElement, init?: any) => dispatch(element, 'drop', init),
  },
)

export const createEvent: Record<string, (element: MaybeElement, init?: any) => Event> = new Proxy({}, {
  get: (_, eventName: string) => (element: MaybeElement, init?: any) => {
    if (!element)
      throw new Error(`Unable to create ${eventName}: target element is missing`)
    const event = new Event(eventName.toLowerCase(), { bubbles: true, cancelable: true })
    Object.assign(event, init)
    Object.defineProperty(event, 'target', { value: element, configurable: true })
    return event
  },
})

export const screen = buildQueries(document.body)

export function within(container: HTMLElement) {
  return buildQueries(container)
}

export function createRef<T = any>() {
  return { current: undefined as T | undefined }
}

export const userEvent = {
  async click(element: MaybeElement) {
    fireEvent.click(element)
    await nextTick()
  },
  async type(element: any, text: string) {
    element.value = `${element.value || ''}${text}`
    fireEvent.change(element, { target: { value: element.value } })
    await nextTick()
  },
}
