<script setup lang="ts">
import { siteConfig } from '@/config'

defineOptions({ name: 'SiteFooter' })

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <div class="site-footer-columns">
        <div v-for="col in siteConfig.footer.columns" :key="col.title" class="site-footer-col">
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

      <div class="site-footer-bottom">
        <span>{{ siteConfig.footer.copyright ?? `Copyright © ${year}` }}</span>
        <span>{{ siteConfig.footer.bottomMessage ?? 'Built with Vue 3 and Ant Design Vue' }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  width: 100%;
  background: var(--ant-color-bg-layout);
  border-top: 1px solid var(--ant-color-split);
}

.site-footer-inner {
  max-width: var(--site-content-max-width);
  margin: 0 auto;
  padding: 60px 24px 20px;
}

.site-footer-columns {
  display: flex;
  justify-content: space-around;
  gap: 48px;
  margin-bottom: 24px;
}

.site-footer-col {
  flex: 1 1 0;
  min-width: 150px;
  text-align: center;
}

.site-footer-col-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--ant-color-text);
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

.site-footer-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--ant-color-border-secondary);
  font-size: 14px;
  color: var(--ant-color-text-tertiary);
  text-align: center;
}

@media (max-width: 768px) {
  .site-footer-inner {
    padding: 40px 24px 20px;
  }

  .site-footer-columns {
    display: block;
  }

  .site-footer-col {
    margin-bottom: 40px;
  }

  .site-footer-col:last-child {
    margin-bottom: 0;
  }
}
</style>
