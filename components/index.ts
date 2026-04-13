import type { App } from 'vue'
import { version } from '../package.json'
import { Button } from './button'
import { FieldModule, ProField, PureProField } from './field'
import { Form, MyFormItem as FormItem } from './form'
import { ProSkeleton } from './skeleton'

export default {
  install(app: App) {
    app.use(Button as any)
    app.use(Form as any)
    app.use(ProSkeleton as any)
    app.use(FieldModule)
  },
  version,
}

export { Button, Form, FormItem, ProField, ProSkeleton, PureProField, version }
export {
  defaultRenderText,
  FieldCascader,
  FieldCheckbox,
  FieldCode,
  FieldColorPicker,
  FieldDatePicker,
  FieldDigit,
  FieldDigitRange,
  FieldFromNow,
  FieldImage,
  FieldIndexColumn,
  FieldMoney,
  FieldOptions,
  FieldPassword,
  FieldPercent,
  FieldProgress,
  FieldRadio,
  FieldRangePicker,
  FieldRate,
  FieldSecond,
  FieldSegmented,
  FieldSelect,
  FieldSlider,
  FieldStatus,
  FieldSwitch,
  FieldText,
  FieldTextArea,
  FieldTimePicker,
  FieldTimeRangePicker,
  FieldTreeSelect,
  ProFieldBadgeColor,
} from './field'
export type {
  FieldCascaderProps,
  FieldDigitRangeProps,
  FieldMoneyProps,
  FieldSelectProps,
  FieldTreeSelectProps,
  ProConfigContextType,
  ProFieldEmptyText,
  ProFieldFCRenderProps,
  ProFieldPropsType,
  ProFieldRenderProps,
  ProFieldTextType,
  ProFieldValueType,
  ProFieldValueTypeInput,
  ProRenderFieldPropsType,
} from './field'
export { DescriptionsPageSkeleton, DescriptionsSkeleton, TableItemSkeleton, TableSkeleton } from './skeleton'
export { ListPageSkeleton, ListSkeleton, ListSkeletonItem, ListToolbarSkeleton, PageHeaderSkeleton } from './skeleton'
export { ResultPageSkeleton } from './skeleton'
