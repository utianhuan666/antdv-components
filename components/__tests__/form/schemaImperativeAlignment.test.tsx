// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  BetaSchemaForm,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormField,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@antdv/components'
import { mountAttached, waitFor } from '../testUtils'

async function readSchemaFieldsValue(columns: any[], initialValues: Record<string, any>) {
  const formRef: { value?: any } = {}
  const wrapper = mountAttached({
    render: () => (
      <BetaSchemaForm
        formRef={formRef}
        columns={columns}
        initialValues={initialValues}
      />
    ),
  })
  await waitFor(() => {
    expect(formRef.value?.getFieldsValue).toBeDefined()
  })
  const values = formRef.value.getFieldsValue()
  wrapper.unmount()
  return values
}

async function readImperativeFieldsValue(initialValues: Record<string, any>, children: any) {
  const readValues = vi.fn()
  const wrapper = mountAttached({
    render: () => (
      <ProForm initialValues={initialValues} onInit={(values: Record<string, any>) => readValues(values)}>
        {children}
      </ProForm>
    ),
  })
  await nextTick()
  await waitFor(() => {
    expect(readValues).toHaveBeenCalled()
  })
  const values = readValues.mock.calls.at(-1)?.[0]
  wrapper.unmount()
  return values
}

describe('Schema vs imperative alignment', () => {
  it('text column (valueType text) matches ProFormText', async () => {
    const initialValues = { fieldA: 'hello' }
    const schemaValues = await readSchemaFieldsValue(
      [{ title: 'A', dataIndex: 'fieldA', valueType: 'text' }],
      initialValues,
    )
    const imperativeValues = await readImperativeFieldsValue(initialValues, <ProFormText name="fieldA" />)

    expect(schemaValues.fieldA).toBe(imperativeValues.fieldA)
    expect(schemaValues.fieldA).toBe('hello')
  })

  it('digit column matches ProFormDigit through valueType field', async () => {
    const initialValues = { fieldA: 12 }
    const schemaValues = await readSchemaFieldsValue(
      [{ title: 'N', dataIndex: 'fieldA', valueType: 'digit' }],
      initialValues,
    )
    const imperativeValues = await readImperativeFieldsValue(initialValues, <ProFormDigit name="fieldA" />)

    expect(schemaValues.fieldA).toBe(imperativeValues.fieldA)
    expect(schemaValues.fieldA).toBe(12)
  })

  it('select column matches ProFormSelect', async () => {
    const valueEnum = {
      open: { text: '未解决' },
      closed: { text: '已解决' },
    }
    const initialValues = { fieldSel: 'open' }
    const schemaValues = await readSchemaFieldsValue(
      [{ title: 'S', dataIndex: 'fieldSel', valueType: 'select', valueEnum }],
      initialValues,
    )
    const imperativeValues = await readImperativeFieldsValue(
      initialValues,
      <ProFormSelect name="fieldSel" valueEnum={valueEnum} />,
    )

    expect(schemaValues.fieldSel).toBe(imperativeValues.fieldSel)
    expect(schemaValues.fieldSel).toBe('open')
  })

  it('dateTime column matches ProFormDateTimePicker', async () => {
    const initialValues = { fieldDt: '2023-01-15 14:30:00' }
    const schemaValues = await readSchemaFieldsValue(
      [{ title: 'D', dataIndex: 'fieldDt', valueType: 'dateTime' }],
      initialValues,
    )
    const imperativeValues = await readImperativeFieldsValue(initialValues, <ProFormDateTimePicker name="fieldDt" />)

    expect(schemaValues.fieldDt).toBe(imperativeValues.fieldDt)
  })

  it('switch and checkbox columns match imperative fields', async () => {
    const valueEnum = { checked: '已选' }
    const initialValues = { fieldSw: true, fieldCk: ['checked'] }
    const schemaValues = await readSchemaFieldsValue(
      [
        { title: 'W', dataIndex: 'fieldSw', valueType: 'switch' },
        { title: 'C', dataIndex: 'fieldCk', valueType: 'checkbox', valueEnum },
      ],
      initialValues,
    )
    const imperativeValues = await readImperativeFieldsValue(
      initialValues,
      <>
        <ProFormSwitch name="fieldSw" />
        <ProFormCheckbox name="fieldCk" valueEnum={valueEnum} />
      </>,
    )

    expect(schemaValues.fieldSw).toBe(imperativeValues.fieldSw)
    expect(schemaValues.fieldCk).toEqual(imperativeValues.fieldCk)
  })

  it('textarea and password columns match imperative fields', async () => {
    const initialValues = { fieldTa: 'line1\nline2', fieldPw: 'secret' }
    const schemaValues = await readSchemaFieldsValue(
      [
        { title: 'T', dataIndex: 'fieldTa', valueType: 'textarea' },
        { title: 'P', dataIndex: 'fieldPw', valueType: 'password' },
      ],
      initialValues,
    )
    const imperativeValues = await readImperativeFieldsValue(
      initialValues,
      <>
        <ProFormTextArea name="fieldTa" />
        <ProFormField name="fieldPw" valueType="password" />
      </>,
    )

    expect(schemaValues.fieldTa).toBe(imperativeValues.fieldTa)
    expect(schemaValues.fieldPw).toBe(imperativeValues.fieldPw)
  })

  it('date column matches ProFormDatePicker', async () => {
    const initialValues = { fieldDay: '2023-06-10' }
    const schemaValues = await readSchemaFieldsValue(
      [{ title: 'Day', dataIndex: 'fieldDay', valueType: 'date' }],
      initialValues,
    )
    const imperativeValues = await readImperativeFieldsValue(initialValues, <ProFormDatePicker name="fieldDay" />)

    expect(schemaValues.fieldDay).toBe(imperativeValues.fieldDay)
  })
})
