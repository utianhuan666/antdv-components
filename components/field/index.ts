import type { App } from 'vue'
import { defaultRenderText, ProField } from './AllProField'
import FieldCascader from './components/Cascader'
import FieldCheckbox from './components/Checkbox'
import FieldCode from './components/Code'
import FieldColorPicker from './components/ColorPicker'
import FieldDatePicker from './components/DatePicker'
import FieldDigit from './components/Digit'
import FieldDigitRange from './components/DigitRange'
import FieldFromNow from './components/FromNow'
import FieldImage from './components/Image'
import FieldIndexColumn from './components/IndexColumn'
import FieldMoney from './components/Money'
import FieldOptions from './components/Options'
import FieldPassword from './components/Password'
import FieldPercent from './components/Percent'
import FieldProgress from './components/Progress'
import FieldRadio from './components/Radio'
import FieldRangePicker from './components/RangePicker'
import FieldRate from './components/Rate'
import FieldSecond from './components/Second'
import FieldSegmented from './components/Segmented'
import FieldSelect from './components/Select'
import FieldSlider from './components/Slider'
import FieldStatus, { ProFieldBadgeColor } from './components/Status'
import FieldSwitch from './components/Switch'
import FieldText from './components/Text'
import FieldTextArea from './components/TextArea'
import FieldTimePicker, { FieldTimeRangePicker } from './components/TimePicker'
import FieldTreeSelect from './components/TreeSelect'
import { PureProField } from './PureProField'

export type { FieldCascaderProps } from './components/Cascader/types'
export type { FieldDigitRangeProps } from './components/DigitRange/types'
export type { FieldMoneyProps } from './components/Money/types'
export type { FieldSelectProps } from './components/Select/types'
export type { FieldTreeSelectProps } from './components/TreeSelect/types'
export type { ProFieldFCRenderProps } from './context'
export { ProConfigKey, useProConfig } from './context'
export type { ProConfigContextType } from './context'
export { createProField } from './ProFieldCore'
export type {
  ProFieldEmptyText,
  ProFieldPropsType,
  ProFieldRenderProps,
  ProFieldTextType,
  ProFieldValueType,
  ProFieldValueTypeInput,
  ProRenderFieldPropsType,
} from './types'
export { omitUndefined, pickProProps } from './utils'

const FieldModule = {
  install(app: App) {
    app.component('ProField', ProField)
    app.component('PureProField', PureProField)
  },
}

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
  FieldModule,
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
  ProField,
  ProFieldBadgeColor,
  PureProField,
}

export default FieldModule
