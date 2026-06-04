import {
  FieldContext,
  FormListContext,
  GridContext,
  LightFilterMonthRange,
  LightFilterQuarterRange,
  LightFilterSearchSelect,
  LightFilterText,
  LightFilterTimePickerRange,
  LightFilterTimeRange,
  LightFilterWeekRange,
  LightFilterYearRange,
  LightWrapper,
  PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES,
  ProFormContext,
  ProFormDateMonthRangePicker,
  ProFormDateQuarterRangePicker,
  ProFormDateWeekRangePicker,
  ProFormDateYearRangePicker,
  ProFormSelect,
  ProFormTimeRangePicker,
} from '@antdv/components'
import { describe, expect, it } from 'vitest'

describe('form public API alignment', () => {
  it('exports date range variants from the package entry', () => {
    expect(ProFormDateMonthRangePicker.name).toBe('ProFormDateMonthRangePicker')
    expect(ProFormDateQuarterRangePicker.name).toBe('ProFormDateQuarterRangePicker')
    expect(ProFormDateWeekRangePicker.name).toBe('ProFormDateWeekRangePicker')
    expect(ProFormDateYearRangePicker.name).toBe('ProFormDateYearRangePicker')
    expect(ProFormTimeRangePicker.name).toBe('ProFormTimeRangePicker')
  })

  it('exposes ProFormSelect.SearchSelect', () => {
    expect((ProFormSelect as any).SearchSelect.name).toBe('ProFormSearchSelect')
  })

  it('exports LightFilter field aliases and LightWrapper', () => {
    expect(LightFilterText.name).toBe('LightFilterText')
    expect(LightFilterSearchSelect.name).toBe('LightFilterSearchSelect')
    expect(LightFilterTimeRange.name).toBe('LightFilterTimeRange')
    expect(LightFilterWeekRange.name).toBe('LightFilterWeekRange')
    expect(LightFilterMonthRange.name).toBe('LightFilterMonthRange')
    expect(LightFilterQuarterRange.name).toBe('LightFilterQuarterRange')
    expect(LightFilterYearRange.name).toBe('LightFilterYearRange')
    expect(LightFilterTimePickerRange.name).toBe('LightFilterTimePickerRange')
    expect(LightWrapper.name).toBe('ProLightWrapper')
  })

  it('exports Vue equivalents of form public contexts and schema layout valueTypes', () => {
    expect(FieldContext.description).toBe('ProFieldContext')
    expect(FormListContext.description).toBe('ProFormListContext')
    expect(GridContext.description).toBe('ProFormGridContext')
    expect(ProFormContext.description).toBe('ProFormContext')
    expect(PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES).toEqual(['group', 'formList', 'formSet', 'divider', 'dependency'])
  })
})
