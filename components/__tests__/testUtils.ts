import type { VueWrapper } from '@vue/test-utils'
import type { VNodeChild } from 'vue'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
// Custom matchers for testing library compatibility
import { expect } from 'vitest'

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

// 同步冲刷 Vue 调度器：
// React 的 `act(() => fireEvent.click(x))` 会同步冲刷，使打开的下拉/浮层在紧接着的
// 下一条同步 `act(() => fireEvent.click(menuItem))` 语句里就已经在 DOM 中。Vue 的渲染
// 走微任务（nextTick），同步语句之间还来不及提交，导致第二次点击「target element is
// missing」。忠实复用的 React 测试在两个 act 之间并不 await（见 “🎏 size icon test”）。
//
// Vue 的调度器通过 `currentFlushPromise = resolvedPromise.then(flushJobs)` 把 flushJobs
// 挂到一个微任务上。这里在一小段窗口内临时替换 `Promise.prototype.then`，只捕获名为
// `flushJobs` 的回调（Vue 调度器冲刷函数），并同步执行它，从而把待处理的渲染 job 及
// @v-c/trigger 的 Teleport 弹层在控制权返回测试前提交到 DOM。flushJobs 自身幂等
// （冲刷后 queue 清空、currentFlushPromise 置空），原 then 仍会照常再排一次微任务，
// 届时在空队列上空跑，无副作用。循环冲刷以覆盖「冲刷触发新 job」的级联场景。
// 在 `run()` 执行期间临时替换 `Promise.prototype.then`，捕获 Vue 调度器挂到微任务上的
// `flushJobs` 回调（`currentFlushPromise = resolvedPromise.then(flushJobs)`），不让它只
// 在微任务里跑，而是在 run 同步结束后立刻同步执行，把渲染 job + Teleport 弹层提交到 DOM。
// flushJobs 幂等：原微任务届时仍会再跑一次，在空队列上空转，无副作用。
function withSyncFlush<T>(run: () => T): T {
  const originalThen = Promise.prototype.then
  const captured: Array<() => void> = []
  ;(Promise.prototype as any).then = function (
    this: Promise<any>,
    onFulfilled?: any,
    ...rest: any[]
  ) {
    if (typeof onFulfilled === 'function' && onFulfilled.name === 'flushJobs')
      captured.push(onFulfilled)
    return originalThen.call(this, onFulfilled, ...rest)
  }
  let result: T
  try {
    result = run()
  }
  finally {
    ;(Promise.prototype as any).then = originalThen
  }
  // 同步冲刷已捕获的 flushJobs；冲刷过程中可能产生级联 job，循环直至稳定。
  let loops = 0
  while (captured.length && loops < 50) {
    const jobs = captured.splice(0)
    // 再次在执行 job 期间捕获新的 flushJobs（级联渲染）
    ;(Promise.prototype as any).then = function (
      this: Promise<any>,
      onFulfilled?: any,
      ...rest: any[]
    ) {
      if (typeof onFulfilled === 'function' && onFulfilled.name === 'flushJobs')
        captured.push(onFulfilled)
      return originalThen.call(this, onFulfilled, ...rest)
    }
    try {
      for (const job of jobs) {
        try {
          job()
        }
        catch {
          // 与 Vue 内部错误处理保持一致：吞掉以免打断冲刷循环
        }
      }
    }
    finally {
      ;(Promise.prototype as any).then = originalThen
    }
    loops++
  }
  return result!
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
  // 使用 performance.now() 而非 Date.now() 计时：table 测试通过 MockDate 冻结了 Date，
  // 若用 Date.now() 计算耗时，waitFor 的超时永远不会触发，断言失败会被拖到 vitest 的
  // 5000ms 测试超时（表现为 hang），掩盖真正的行为差异。performance.now() 不受 MockDate 影响。
  const startedAt = performance.now()
  let lastError: unknown

  while (performance.now() - startedAt < timeout) {
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
  // 同步执行 callback 并同步冲刷 Vue 渲染，使紧随其后的下一条同步 act 语句能看到本次
  // act 引发的 DOM 变更（React act 的同步冲刷语义）。callback 若返回 Promise 再 await。
  let result!: T
  let pending: Promise<T> | undefined
  withSyncFlush(() => {
    const ret = callback()
    if (ret && typeof (ret as any).then === 'function')
      pending = ret as Promise<T>
    else
      result = ret as T
  })
  if (pending)
    result = await pending
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
  const wrapper = withSyncFlush(() => mount(Host, { attachTo: root }))
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
  // 同步派发并同步冲刷 Vue 渲染：事件处理器改变响应式状态后，Vue 把渲染挂到微任务；
  // 这里同步执行 flushJobs，使 DOM（含 Teleport 弹层）在控制权返回测试下一条同步语句
  // 前就已提交，从而忠实复用 React 同步 act 风格的测试。
  withSyncFlush(() => element.dispatchEvent(event))
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
    // React 会从原生 mouseover 合成 onMouseEnter；Vue 无此合成，@v-c/trigger 监听的是
    // mouseenter/pointerenter。为忠实复用 React 测试里的 fireEvent.mouseOver/mouseEnter，
    // 这里同时派发 mouseenter + pointerenter（冒泡，便于命中祖先 trigger 元素上的监听）。
    mouseOver: (element: MaybeElement, init?: any) => {
      const event = dispatch(element, 'mouseover', init)
      dispatch(element, 'mouseenter', init)
      dispatch(element, 'pointerenter', init)
      return event
    },
    mouseEnter: (element: MaybeElement, init?: any) => {
      const event = dispatch(element, 'mouseenter', init)
      dispatch(element, 'pointerenter', init)
      return event
    },
    mouseOut: (element: MaybeElement, init?: any) => {
      const event = dispatch(element, 'mouseout', init)
      dispatch(element, 'mouseleave', init)
      dispatch(element, 'pointerleave', init)
      return event
    },
    mouseLeave: (element: MaybeElement, init?: any) => {
      const event = dispatch(element, 'mouseleave', init)
      dispatch(element, 'pointerleave', init)
      return event
    },
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
  // React refs expose `.current`; Vue's form/action layers write through `.value`.
  // Bridge both names to a single backing slot so a ref handed to ProTable as either
  // formRef (set via `.value` by the form layer) or actionRef is always readable as
  // `.current` from the React-style test, and vice versa.
  let inner: T | undefined
  return {
    get current() {
      return inner
    },
    set current(next: T | undefined) {
      inner = next
    },
    get value() {
      return inner
    },
    set value(next: T | undefined) {
      inner = next
    },
  }
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

expect.extend({
  toHaveValue(received: any, expected: any) {
    const element = received as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const actual = element?.value
    const pass = actual === expected
    return {
      pass,
      message: () => pass
        ? `expected element not to have value ${expected}`
        : `expected element to have value ${expected}, but got ${actual}`,
    }
  },
})
