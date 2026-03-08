import { createRouter, createWebHistory } from 'vue-router'
import DocsLayout from '../layouts/docs/index.vue'
import HomeView from '../pages/home/index.vue'
import { docsRoutes } from './docs'

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
      name: 'DocsLayout',
      component: DocsLayout,
      children: docsRoutes,
    },
  ],
})

export default router
