import type { ProFieldRenderText } from './ProFieldCore'
import type { ProFieldRenderProps, ProFieldTextType, ProFieldValueType } from './types'
import { Avatar } from 'antdv-next'
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
import FieldSwitch from './components/Switch'
import FieldText from './components/Text'
import FieldTextArea from './components/TextArea'
import FieldTimePicker, { FieldTimeRangePicker } from './components/TimePicker'
import FieldTreeSelect from './components/TreeSelect'
import { createProField } from './ProFieldCore'
import { pickProProps } from './utils'

/** Render by valueType object shorthand */
function defaultRenderTextByObject(
  text: ProFieldTextType,
  valueType: any,
  props: ProFieldRenderProps,
) {
  const pickFormItemProps = pickProProps(props.fieldProps)
  if (valueType.type === 'progress') {
    return <FieldProgress {...props} text={text as number} fieldProps={{ status: valueType.status, ...pickFormItemProps }} />
  }
  if (valueType.type === 'money') {
    return <FieldMoney locale={valueType.locale} {...props} fieldProps={pickFormItemProps} text={text as number} moneySymbol={valueType.moneySymbol} />
  }
  if (valueType.type === 'percent') {
    return <FieldPercent {...props} text={text as number} showSymbol={valueType.showSymbol} precision={valueType.precision} fieldProps={pickFormItemProps} showColor={valueType.showColor} />
  }
  if (valueType.type === 'image') {
    return <FieldImage {...props} text={text as string} width={valueType.width} />
  }
  return text as any
}

/** Built-in valueType leaf render */
function renderDefaultValueTypeLeaf(
  dataValue: ProFieldTextType,
  valueType: ProFieldValueType,
  props: ProFieldRenderProps,
) {
  if (valueType === 'money')
    return <FieldMoney {...props} text={dataValue as number} />
  if (valueType === 'date')
    return <FieldDatePicker format="YYYY-MM-DD" {...props} text={dataValue as string} />
  if (valueType === 'dateWeek')
    return <FieldDatePicker format="YYYY-wo" picker="week" {...props} text={dataValue as string} />
  if (valueType === 'dateMonth')
    return <FieldDatePicker format="YYYY-MM" picker="month" {...props} text={dataValue as string} />
  if (valueType === 'dateQuarter')
    return <FieldDatePicker format="YYYY-[Q]Q" picker="quarter" {...props} text={dataValue as string} />
  if (valueType === 'dateYear')
    return <FieldDatePicker format="YYYY" picker="year" {...props} text={dataValue as string} />
  if (valueType === 'dateTime')
    return <FieldDatePicker format="YYYY-MM-DD HH:mm:ss" showTime {...props} text={dataValue as string} />
  if (valueType === 'dateRange')
    return <FieldRangePicker format="YYYY-MM-DD" {...props} text={dataValue as string[]} />
  if (valueType === 'dateWeekRange')
    return <FieldRangePicker format="YYYY-W" showTime fieldProps={{ picker: 'week', ...props.fieldProps }} {...props} text={dataValue as string[]} />
  if (valueType === 'dateMonthRange')
    return <FieldRangePicker format="YYYY-MM" showTime fieldProps={{ picker: 'month', ...props.fieldProps }} {...props} text={dataValue as string[]} />
  if (valueType === 'dateQuarterRange')
    return <FieldRangePicker format="YYYY-Q" showTime fieldProps={{ picker: 'quarter', ...props.fieldProps }} {...props} text={dataValue as string[]} />
  if (valueType === 'dateYearRange')
    return <FieldRangePicker format="YYYY" showTime fieldProps={{ picker: 'year', ...props.fieldProps }} {...props} text={dataValue as string[]} />
  if (valueType === 'dateTimeRange')
    return <FieldRangePicker format="YYYY-MM-DD HH:mm:ss" showTime {...props} text={dataValue as string[]} />
  if (valueType === 'time')
    return <FieldTimePicker format="HH:mm:ss" {...props} text={dataValue as string} />
  if (valueType === 'timeRange')
    return <FieldTimeRangePicker format="HH:mm:ss" {...props} text={dataValue as string[]} />
  if (valueType === 'fromNow')
    return <FieldFromNow {...props} text={dataValue as string} />
  if (valueType === 'index')
    return <FieldIndexColumn>{(dataValue as number) + 1}</FieldIndexColumn>
  if (valueType === 'indexBorder')
    return <FieldIndexColumn border>{(dataValue as number) + 1}</FieldIndexColumn>
  if (valueType === 'progress')
    return <FieldProgress {...props} text={dataValue as number} />
  if (valueType === 'percent')
    return <FieldPercent {...props} text={dataValue as number} />
  if (valueType === 'avatar' && typeof dataValue === 'string' && props.mode === 'read')
    return <Avatar src={dataValue} size={22} shape="circle" />
  if (valueType === 'code')
    return <FieldCode {...props} text={dataValue as string} />
  if (valueType === 'jsonCode')
    return <FieldCode language="json" {...props} text={dataValue as string} />
  if (valueType === 'textarea')
    return <FieldTextArea {...props} text={dataValue as string} />
  if (valueType === 'digit')
    return <FieldDigit text={typeof dataValue === 'number' ? dataValue : Number(dataValue) || 0} {...props} />
  if (valueType === 'digitRange')
    return <FieldDigitRange {...props} text={dataValue as number[]} />
  if (valueType === 'second')
    return <FieldSecond {...props} text={dataValue as number} />
  if (valueType === 'select' || (valueType === 'text' && (props.valueEnum || props.request)))
    return <FieldSelect {...props} text={dataValue as string} />
  if (valueType === 'checkbox')
    return <FieldCheckbox {...props} text={dataValue as string} />
  if (valueType === 'radio')
    return <FieldRadio {...props} text={dataValue as string} />
  if (valueType === 'radioButton')
    return <FieldRadio radioType="button" {...props} text={dataValue as string} />
  if (valueType === 'rate')
    return <FieldRate {...props} text={dataValue as string} />
  if (valueType === 'slider')
    return <FieldSlider {...props} text={dataValue as string} />
  if (valueType === 'switch')
    return <FieldSwitch {...props} text={dataValue as boolean} />
  if (valueType === 'option')
    return <FieldOptions {...props} text={dataValue as any} />
  if (valueType === 'password')
    return <FieldPassword {...props} text={dataValue as string} />
  if (valueType === 'image')
    return <FieldImage {...props} text={dataValue as string} />
  if (valueType === 'cascader')
    return <FieldCascader {...props} text={dataValue as string} />
  if (valueType === 'treeSelect')
    return <FieldTreeSelect {...props} text={dataValue as string} />
  if (valueType === 'color')
    return <FieldColorPicker {...props} text={dataValue as string} />
  if (valueType === 'segmented')
    return <FieldSegmented {...props} text={dataValue as string} />
  return <FieldText text={dataValue as string} {...props} />
}

/** Read: empty text, context valueTypeMap, built-in valueType */
export const defaultRenderRead: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  const { mode = 'read', emptyText = '-' } = props

  if (
    emptyText !== false
    && mode === 'read'
    && valueType !== 'option'
    && valueType !== 'switch'
  ) {
    if (typeof dataValue !== 'boolean' && typeof dataValue !== 'number' && !dataValue) {
      const { fieldProps, render } = props
      if (render)
        return render(dataValue, { mode, ...fieldProps }, <>{emptyText}</>)
      return <>{emptyText}</>
    }
  }

  delete props.emptyText

  if (typeof valueType === 'object') {
    return defaultRenderTextByObject(dataValue, valueType, props)
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const readDom = customValueTypeConfig.render?.(
      dataValue,
      { text: dataValue, ...props, mode: mode || 'read' } as any,
      <>{dataValue}</>,
    )
    if (props?.render) {
      return props.render(dataValue, { text: dataValue, ...props } as any, readDom as any)
    }
    return readDom
  }

  return renderDefaultValueTypeLeaf(dataValue, valueType as ProFieldValueType, props)
}

/** Edit: context valueTypeMap, built-in valueType */
export const defaultRenderEdit: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  delete props.emptyText

  if (typeof valueType === 'object') {
    return defaultRenderTextByObject(dataValue, valueType, props)
  }

  const customValueTypeConfig = valueTypeMap && valueTypeMap[valueType as string]
  if (customValueTypeConfig) {
    const dom = customValueTypeConfig.formItemRender?.(
      dataValue,
      { text: dataValue, ...props } as any,
      <>{dataValue}</>,
    )
    if (props?.formItemRender) {
      return props.formItemRender(dataValue, { text: dataValue, ...props } as any, dom as any)
    }
    return dom
  }

  return renderDefaultValueTypeLeaf(dataValue, valueType as ProFieldValueType, props)
}

/** Dispatch by mode (compat) */
export const defaultRenderText: ProFieldRenderText = (
  dataValue,
  valueType,
  props,
  valueTypeMap,
) => {
  const m = props.mode ?? 'read'
  return m === 'edit' || m === 'update'
    ? defaultRenderEdit(dataValue, valueType, props, valueTypeMap)
    : defaultRenderRead(dataValue, valueType, props, valueTypeMap)
}

export const ProField = createProField(
  { renderRead: defaultRenderRead, renderEdit: defaultRenderEdit },
  { pickProPropsWithValueTypeMap: true },
)
