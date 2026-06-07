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
export type { FieldCascaderProps } from './components/Cascader/types'
export type { FieldDigitRangeProps } from './components/DigitRange/types'
export type { FieldMoneyProps } from './components/Money/types'
export type { FieldSelectProps } from './components/Select/types'
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
