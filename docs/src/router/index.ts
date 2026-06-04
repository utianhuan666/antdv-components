import { createRouter, createWebHistory } from 'vue-router'
import { i18n } from '@/locales'
import DocsLayout from '../layouts/docs/index.vue'
import HomeView from '../pages/home/index.vue'
import { docsRoutes, resolveDocRoutePath } from './docs'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/docs-layout',
      component: DocsLayout,
      children: docsRoutes,
    },
  ],
})

router.beforeEach((to) => {
  const locale = i18n.global.locale.value
  const localizedPath = resolveDocRoutePath(to.path, locale)

  if (!localizedPath || localizedPath === to.path)
    return true

  return {
    path: localizedPath,
    query: to.query,
    hash: to.hash,
    replace: true,
  }
})

export default router
