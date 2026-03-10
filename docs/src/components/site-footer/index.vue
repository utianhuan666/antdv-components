<script setup lang="ts">
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteFooter' })

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <div class="site-footer-columns">
        <div
          v-for="col in siteConfig.footer.columns"
          :key="col.title"
          class="site-footer-col"
        >
          <div class="site-footer-col-title">
            {{ col.title }}
          </div>
          <ul class="site-footer-col-list">
            <li v-for="item in col.items" :key="item.url">
              <a
                :href="item.url"
                :target="item.openExternal ? '_blank' : undefined"
                :rel="item.openExternal ? 'noopener noreferrer' : undefined"
                class="site-footer-link"
              >
                {{ item.title }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="site-footer-divider" />

      <div class="site-footer-bottom">
        <span>{{ siteConfig.footer.copyright ?? `Copyright © ${year}` }}</span>
        <span>Built with ❤️ and Ant Design Vue</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--ant-color-bg-layout);
  border-top: 1px solid var(--ant-color-split);
}

.site-footer-inner {
  max-width: var(--site-content-max-width);
  margin: 0 auto;
  padding: 48px 24px 32px;
}

.site-footer-columns {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.site-footer-col {
  flex: 1;
  min-width: 150px;
}

.site-footer-col-title {
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ant-color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.site-footer-col-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.site-footer-link {
  font-size: 14px;
  color: var(--ant-color-text-secondary);
  transition: color 0.2s;
}

.site-footer-link:hover {
  color: var(--ant-color-primary);
}

.site-footer-divider {
  height: 1px;
  background: var(--ant-color-split);
  margin-bottom: 24px;
}

.site-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: var(--ant-color-text-tertiary);
}
</style>
