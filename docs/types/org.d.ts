export {}

declare module 'vue' {
  export interface GlobalComponents {
    MyButton: typeof import('@org/components')['Button']
    MyForm: typeof import('@org/components')['Form']
    MyFormItem: typeof import('@org/components')['FormItem']
  }
}
