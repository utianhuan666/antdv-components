// 复刻 React pro-components tests/setupTests.ts 中与 table 相关的全局桩。
// React 端是全局生效，这里限定在 table 测试范围内（被各 table 测试文件 import），
// 以保证迁移测试的断言与 React 完全一致，同时不影响仓库内其它已存在的测试套件。
import MockDate from 'mockdate'
import { afterAll, beforeAll, vi } from 'vitest'

// 2016-11-22 15:22:44 —— 与 React setupTests 固定时间一致
const MOCK_NOW = 1479828164000

const localStorageMock = (() => {
  let store: Record<string, any> = {
    umi_locale: 'zh-CN',
  }
  return {
    getItem(key: string) {
      return store[key] ?? null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    removeItem(key: string) {
      store[key] = null
    },
    clear() {
      store = {}
    },
  }
})()

beforeAll(() => {
  MockDate.set(MOCK_NOW)
  // 与 React 一致：固定 Math.random，保证 id 等生成的确定性
  vi.spyOn(Math, 'random').mockReturnValue(0.8404419276253765)

  if (!('open' in globalThis) || typeof (globalThis as any).open !== 'function')
    Object.defineProperty(globalThis, 'open', { value: vi.fn(), writable: true, configurable: true })
  else
    vi.spyOn(globalThis as any, 'open').mockImplementation(() => null)

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  })
})

afterAll(() => {
  MockDate.reset()
  vi.restoreAllMocks()
})
