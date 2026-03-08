import { MyFormItem } from './form-item.tsx'
import Form from './form.vue'

Form.install = (app: any) => {
  app.component(Form.name!, Form)
  app.component(MyFormItem.name!, MyFormItem)
}

export { Form, MyFormItem }
