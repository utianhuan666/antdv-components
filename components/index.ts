import type { App } from 'vue'
import { version } from '../package.json'
import { Button } from './button'
import { Form, MyFormItem as FormItem } from './form'

export default {
  install(app: App) {
    app.use(Button as any)
    app.use(Form as any)
  },
  version,
}

export { Button, Form, FormItem, version }
