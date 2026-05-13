import type { App } from 'vue'
import { BaseForm } from './BaseForm'
import {
  ProFormCascader,
  ProFormCheckbox,
  ProFormCheckboxGroup,
  ProFormColorPicker,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormDigitRange,
  ProFormField,
  ProFormFieldSet,
  ProFormGroup,
  ProFormItem,
  ProFormList,
  ProFormMoney,
  ProFormRadio,
  ProFormRadioButton,
  ProFormRadioGroup,
  ProFormRate,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTimePicker,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
} from './components'
import { MyFormItem } from './form-item.tsx'
import Form from './form.vue'
import ProForm from './layouts/ProForm'

Form.install = (app: App) => {
  app.component(Form.name!, Form)
  app.component(MyFormItem.name!, MyFormItem)
}

export const ProFormModule = {
  install(app: App) {
    const list = [
      ProForm,
      ProFormItem,
      ProFormGroup,
      ProFormField,
      ProFormFieldSet,
      ProFormDependency,
      ProFormList,
      ProFormText,
      ProFormTextPassword,
      ProFormTextArea,
      ProFormSelect,
      ProFormDigit,
      ProFormDigitRange,
      ProFormMoney,
      ProFormSwitch,
      ProFormRadio,
      ProFormRadioGroup,
      ProFormRadioButton,
      ProFormCheckbox,
      ProFormCheckboxGroup,
      ProFormCascader,
      ProFormTreeSelect,
      ProFormSlider,
      ProFormRate,
      ProFormSegmented,
      ProFormColorPicker,
      ProFormDatePicker,
      ProFormDateTimePicker,
      ProFormTimePicker,
      ProFormDateRangePicker,
      ProFormDateTimeRangePicker,
      ProFormUploadButton,
      ProFormUploadDragger,
    ] as any[]
    list.forEach((c) => {
      if (c?.name) {
        app.component(c.name, c)
      }
    })
  },
}

export {
  BaseForm,
  Form,
  MyFormItem,
  ProForm,
  ProFormCascader,
  ProFormCheckbox,
  ProFormCheckboxGroup,
  ProFormColorPicker,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormDigitRange,
  ProFormField,
  ProFormFieldSet,
  ProFormGroup,
  ProFormItem,
  ProFormList,
  ProFormMoney,
  ProFormRadio,
  ProFormRadioButton,
  ProFormRadioGroup,
  ProFormRate,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTimePicker,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
}

export type { FormListActionType } from './components'
export type {
  BaseFormProps,
  CommonFormProps,
  ProFormFieldItemProps,
  ProFormFieldSetProps,
  ProFormGridConfig,
  ProFormGroupProps,
  ProFormItemCreateConfig,
  ProFormItemProps,
  ProFormProps,
  ProFormUploadButtonProps,
  ProFormUploadDraggerProps,
  SubmitterProps,
} from './typing'
