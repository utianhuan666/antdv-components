import { describe, expect, it } from 'vitest'
import { genBreadcrumbProps, getBreadcrumb, getBreadcrumbProps } from '../../layout/utils/getBreadcrumbProps'
import { getMenuData } from '../../layout/utils/getMenuData'
import { urlToList } from '../../layout/utils/pathTools'
import { clearMenuItem, genStringToTheme, getOpenKeysFromMenuData } from '../../layout/utils/utils'

describe('layout utils', () => {
  it('urlToList converts path segments', () => {
    expect(urlToList()).toEqual(['/'])
    expect(urlToList('/')).toEqual(['/'])
    expect(urlToList('/a//b/')).toEqual(['/a', '/a/b'])
    expect(urlToList('a/b')).toEqual(['/a', '/a/b'])
    expect(urlToList('/a?x=1')).toEqual(['/a?x=1'])
    expect(urlToList('/a#hash')).toEqual(['/a#hash'])
    expect(urlToList('https://x/y')).toEqual(['/https:', '/https:/x', '/https:/x/y'])
    expect(urlToList('/userInfo/2144/id')).toEqual([
      '/userInfo',
      '/userInfo/2144',
      '/userInfo/2144/id',
    ])
  })

  it('getOpenKeysFromMenuData skips flat menu parents', () => {
    expect(getOpenKeysFromMenuData([
      {
        key: 'root',
        children: [
          {
            key: 'flat',
            flatMenu: true,
            children: [{ key: 'child' }],
          },
        ],
      },
    ])).toEqual(['root', 'child'])
  })

  it('genStringToTheme maps preset colors and preserves custom values', () => {
    expect(genStringToTheme('daybreak')).toBe('#1890ff')
    expect(genStringToTheme('#000')).toBe('#000')
    expect(genStringToTheme()).toBe('')
  })

  it('clearMenuItem removes hidden and nameless menu items', () => {
    expect(clearMenuItem([
      {
        name: 'root',
        children: [
          { name: 'visible', path: '/visible' },
          { name: 'hidden', hideInMenu: true },
          { path: '/empty' },
        ],
      },
    ])).toEqual([
      {
        name: 'root',
        children: [{ name: 'visible', path: '/visible' }],
      },
    ])
  })

  it('getBreadcrumb matches dynamic paths and skips external links', () => {
    const breadcrumbMap = new Map([
      ['https://ant.design', { path: 'https://ant.design', name: 'external' }],
      ['/users/:id', { path: '/users/:id', name: 'user detail' }],
    ])

    expect(getBreadcrumb(breadcrumbMap, '/users/1').name).toBe('user detail')
  })

  it('genBreadcrumbProps builds breadcrumb items from location', () => {
    const breadcrumbMap = new Map([
      ['/users', { path: '/users', name: 'users' }],
      ['/users/:id', { path: '/users/:id', name: 'detail', locale: 'menu.detail' }],
    ])

    expect(genBreadcrumbProps({
      location: { pathname: '/users/1' },
      breadcrumbMap,
      menu: { locale: true },
      formatMessage: ({ id }) => `${id}`,
    })).toEqual([
      {
        linkPath: '/users',
        breadcrumbName: 'users',
        title: 'users',
        component: undefined,
      },
      {
        linkPath: '/users/1',
        breadcrumbName: 'menu.detail',
        title: 'menu.detail',
        component: undefined,
      },
    ])
  })

  it('getBreadcrumbProps respects minLength and breadcrumbRender=false', () => {
    const breadcrumbMap = new Map([
      ['/users', { path: '/users', name: 'users' }],
    ])

    expect(getBreadcrumbProps({
      location: { pathname: '/users' },
      breadcrumbMap,
    }).items).toBeUndefined()

    expect(getBreadcrumbProps({
      location: { pathname: '/users' },
      breadcrumbMap,
      breadcrumbRender: false,
    }, {
      breadcrumbProps: { minLength: 1 },
    }).items).toBeUndefined()
  })

  it('getMenuData returns menu data and breadcrumb map', () => {
    const { breadcrumb, breadcrumbMap, menuData } = getMenuData([
      {
        path: '/',
        name: 'home',
        children: [
          {
            path: '/welcome',
            name: 'welcome',
          },
        ],
      },
    ])

    expect(menuData[0]?.name).toBe('home')
    expect(breadcrumb['/welcome']?.name).toBe('welcome')
    expect(breadcrumbMap.get('/welcome')?.name).toBe('welcome')
  })
})
