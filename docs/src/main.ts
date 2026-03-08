import orgComponents from '@org/components'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import DemoGroup from './components/demo/group.vue'
import Demo from './components/demo/index.vue'
import { i18n } from './locales'
import router from './router'
import './assets/styles/index.css'
import 'uno.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(orgComponents)
app.component('Demo', Demo)
app.component('DemoGroup', DemoGroup)
app.mount('#app')
