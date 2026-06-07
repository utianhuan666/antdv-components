import { describe, expect, it, vi } from 'vitest'
import {
  pickControlProps,
  pickControlPropsWithId,
  useControlModel,
} from '../../form'

describe('proForm.FormItemRender target branch test', () => {
  it('should return correct object when model is a single object', () => {
    const onChange = vi.fn()
    const value = 'test value'
    const model = { valuePropName: 'value', trigger: 'onChange' }

    const result = useControlModel({ value, onChange }, model)

    expect(result).toEqual({
      value,
      onChange: expect.any(Function),
    })

    result.onChange('new value')
    expect(onChange).toHaveBeenCalledWith('new value')

    result.onChange({ target: { value: 'new value' } })
    expect(onChange).toHaveBeenCalledWith('new value')
  })

  it('should return correct object when model is an array', () => {
    const onChange = vi.fn()
    const value = { field1: 'value1', field2: 'value2' }
    const model = [
      'field1',
      { name: 'field2', valuePropName: 'value', trigger: 'onChange' },
    ]

    const result = useControlModel({ value, onChange }, model as any) as any

    expect(result).toEqual({
      field1: {
        value: value.field1,
        onChange: expect.any(Function),
      },
      field2: {
        value: value.field2,
        onChange: expect.any(Function),
      },
    })

    result.field1.onChange('new value')
    expect(onChange).toHaveBeenCalledWith({
      field1: 'new value',
      field2: 'value2',
    })

    result.field1.onChange({ target: { value: 'new value' } })
    expect(onChange).toHaveBeenCalledWith({
      field1: 'new value',
      field2: 'value2',
    })

    result.field2.onChange('new value')
    expect(onChange).toHaveBeenCalledWith({
      field1: 'value1',
      field2: 'new value',
    })

    result.field2.onChange({ target: { value: 'new value' } })
    expect(onChange).toHaveBeenCalledWith({
      field1: 'value1',
      field2: 'new value',
    })
  })

  it('pickControlProps extracts value and onChange properties correctly', () => {
    const props: any = {
      value: 'initial value',
      onChange: vi.fn(),
    }

    const controlProps = pickControlProps(props)

    expect(controlProps).toEqual({
      value: 'initial value',
      onChange: expect.any(Function),
    })
  })

  it('onChange function extracts value correctly', () => {
    const props: any = {
      value: 'initial value',
      onChange: (newValue: string) => {
        expect(newValue).toBe('updated value')
      },
    }

    const controlProps = pickControlProps(props)

    controlProps.onChange('updated value')
  })

  it('onChange function extracts value from event object correctly', () => {
    const props: any = {
      value: 'initial value',
      onChange: (newValue: string) => {
        expect(newValue).toBe('event value')
      },
    }

    const controlProps = pickControlProps(props)

    controlProps.onChange({
      target: {
        value: 'event value',
      },
    })
  })

  it('pickControlPropsWithId extracts value, onChange, id and aria attributes', () => {
    const props: any = {
      'value': 'test value',
      'onChange': vi.fn(),
      'id': 'field-id',
      'aria-describedby': 'error-message-id',
      'aria-invalid': true,
      'aria-required': true,
    }

    const controlProps = pickControlPropsWithId(props)

    expect(controlProps).toMatchObject({
      'value': 'test value',
      'id': 'field-id',
      'aria-describedby': 'error-message-id',
      'aria-invalid': true,
      'aria-required': true,
    })
    expect(controlProps.onChange).toBeDefined()
  })

  it('pickControlPropsWithId omits undefined aria attributes', () => {
    const props: any = {
      value: '',
      onChange: vi.fn(),
      id: 'field-id',
    }

    const controlProps = pickControlPropsWithId(props)

    expect(controlProps).not.toHaveProperty('aria-describedby')
    expect(controlProps).not.toHaveProperty('aria-invalid')
    expect(controlProps).not.toHaveProperty('aria-required')
  })
})
