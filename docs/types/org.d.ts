export {}

declare module 'vue' {
  export interface GlobalComponents {
    MyButton: typeof import('@antdv/components')['Button']
    MyForm: typeof import('@antdv/components')['Form']
    MyFormItem: typeof import('@antdv/components')['FormItem']
  }
}
