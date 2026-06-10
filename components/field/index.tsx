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
import FieldSelect, { proFieldParsingValueEnumToArray } from './components/Select'
import FieldSlider from './components/Slider'
import FieldStatus, { ProFieldBadgeColor } from './components/Status'
import FieldSwitch from './components/Switch'
import FieldText from './components/Text'
import FieldTextArea from './components/TextArea'
import FieldTimePicker, { FieldTimeRangePicker } from './components/TimePicker'
import FieldTreeSelect from './components/TreeSelect'
import { PureProField } from './PureProField'

export type {
  ConfigContextPropsType as ProConfigContextType,
  ProFieldFCRenderProps,
  ProRenderFieldPropsType,
} from '../provider'
export { omitUndefined, pickProProps } from '../utils'
export type {
  ProFieldBuiltinValueType,
  ProFieldSchemaLayoutValueType,
  ProFieldTextType,
  ProFieldValueObjectType,
  ProFieldValueType,
  ProFieldValueTypeInput,
} from '../utils/typing'
export { PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES } from '../utils/typing'
export type { FieldCascaderExpose } from './components/Cascader'
export type { FieldCascaderProps } from './components/Cascader/types'
export type { FieldCheckboxExpose } from './components/Checkbox'
export type { FieldColorPickerExpose } from './components/ColorPicker'
export type { FieldCodeExpose } from './components/Code'
export type { FieldDigitExpose } from './components/Digit'
export type { FieldDigitRangeExpose } from './components/DigitRange'
export type { FieldDigitRangeProps } from './components/DigitRange/types'
export type { FieldDatePickerExpose } from './components/DatePicker'
export type { FieldFromNowExpose } from './components/FromNow'
export type { FieldImageExpose } from './components/Image'
export type { FieldIndexColumnExpose } from './components/IndexColumn'
export type { FieldMoneyExpose } from './components/Money'
export type { FieldMoneyProps } from './components/Money/types'
export type { FieldPasswordExpose } from './components/Password'
export type { FieldPercentExpose } from './components/Percent'
export type { FieldProgressExpose } from './components/Progress'
export type { FieldRateExpose } from './components/Rate'
export type { FieldRadioExpose } from './components/Radio'
export type { FieldRangePickerExpose } from './components/RangePicker'
export type { FieldSecondExpose } from './components/Second'
export type { FieldSelectExpose } from './components/Select'
export type { FieldSelectProps } from './components/Select/types'
export type { FieldSegmentedExpose } from './components/Segmented'
export type { FieldSliderExpose } from './components/Slider'
export type { FieldSwitchExpose } from './components/Switch'
export type { FieldTimePickerExpose } from './components/TimePicker'
export type { FieldTimeRangePickerExpose } from './components/TimePicker'
export type { FieldTextExpose } from './components/Text'
export type { FieldTextAreaExpose } from './components/TextArea'
export type { FieldTreeSelectExpose } from './components/TreeSelect'
export type { FieldTreeSelectProps } from './components/TreeSelect/types'
export { createProField } from './ProFieldCore'
export type { ProFieldMoneyProps } from './PureProField'
export type {
  ProFieldEmptyText,
  ProFieldLightProps,
  ProFieldPropsType,
  ProFieldRenderProps,
  ProFieldValueTypeFunction,
} from './types'

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
  proFieldParsingValueEnumToArray,
  PureProField,
}

export default FieldModule
