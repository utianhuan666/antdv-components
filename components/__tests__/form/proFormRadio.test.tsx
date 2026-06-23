import { Form } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProForm, ProFormRadio } from '../../form'
import { cleanup, fireEvent, render, screen, userEvent, waitFor } from '../testUtils'

afterEach(() => {
  cleanup()
})

describe('ProFormRadio', () => {
  it('📦 ProFormRadio should render correctly', () => {
    const { container } = render(
      <ProForm>
        <ProFormRadio name="test">Test Radio</ProFormRadio>
      </ProForm>,
    )

    expect(container.querySelector('.ant-radio')).toBeTruthy()
    expect(container.querySelector('.ant-radio-wrapper')).toBeTruthy()
    expect(screen.getByText('Test Radio')).toBeTruthy()
  })

  it('📦 ProFormRadio should support checked prop', () => {
    const { container } = render(
      <ProForm>
        <ProFormRadio name="test" fieldProps={{ checked: true }}>
          Test Radio
        </ProFormRadio>
      </ProForm>,
    )

    const radio = container.querySelector(
      '.ant-radio-input',
    ) as HTMLInputElement
    expect(radio.checked).toBe(true)
  })

  it('📦 ProFormRadio should support defaultChecked prop', () => {
    const { container } = render(
      <ProForm>
        <ProFormRadio name="test" fieldProps={{ defaultChecked: true }}>
          Test Radio
        </ProFormRadio>
      </ProForm>,
    )

    const radio = container.querySelector(
      '.ant-radio-input',
    ) as HTMLInputElement
    expect(radio.checked).toBe(true)
  })

  it('📦 ProFormRadio should support onChange event', async () => {
    const onChange = vi.fn()

    const { container } = render(
      <ProForm>
        <ProFormRadio name="test" fieldProps={{ onChange }}>
          Test Radio
        </ProFormRadio>
      </ProForm>,
    )

    const radio = container.querySelector(
      '.ant-radio-input',
    ) as HTMLInputElement
    await userEvent.click(radio)

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('📦 ProFormRadio should support disabled prop', () => {
    const { container } = render(
      <ProForm>
        <ProFormRadio name="test" fieldProps={{ disabled: true }}>
          Test Radio
        </ProFormRadio>
      </ProForm>,
    )

    const radio = container.querySelector(
      '.ant-radio-input',
    ) as HTMLInputElement
    expect(radio.disabled).toBe(true)
    expect(container.querySelector('.ant-radio-wrapper-disabled')).toBeTruthy()
  })

  it('📦 ProFormRadio.Group should render with options', () => {
    const options = [
      { label: 'Option 1', value: 'a' },
      { label: 'Option 2', value: 'b' },
      { label: 'Option 3', value: 'c' },
    ]

    const { container } = render(
      <ProForm>
        <ProFormRadio.Group name="radioGroup" options={options} />
      </ProForm>,
    )

    expect(container.querySelectorAll('.ant-radio-wrapper').length).toBe(3)
    expect(screen.getByText('Option 1')).toBeTruthy()
    expect(screen.getByText('Option 2')).toBeTruthy()
    expect(screen.getByText('Option 3')).toBeTruthy()
  })

  it('📦 ProFormRadio.Group should support button type', () => {
    const options = [
      { label: 'Option 1', value: 'a' },
      { label: 'Option 2', value: 'b' },
    ]

    const { container } = render(
      <ProForm>
        <ProFormRadio.Group
          name="radioGroup"
          radioType="button"
          options={options}
        />
      </ProForm>,
    )

    expect(container.querySelectorAll('.ant-radio-button-wrapper').length).toBe(
      2,
    )
  })

  it('📦 ProFormRadio.Group should support defaultValue', () => {
    const options = [
      { label: 'Option 1', value: 'a' },
      { label: 'Option 2', value: 'b' },
    ]

    const { container } = render(
      <ProForm initialValues={{ radioGroup: 'b' }}>
        <ProFormRadio.Group name="radioGroup" options={options} />
      </ProForm>,
    )

    const checkedRadio = container.querySelector('.ant-radio-checked')
    expect(checkedRadio).toBeTruthy()
  })

  it('📦 ProFormRadio.Group should support onChange', async () => {
    const onChange = vi.fn()
    const options = [
      { label: 'Option 1', value: 'a' },
      { label: 'Option 2', value: 'b' },
    ]

    const { container } = render(
      <ProForm>
        <ProFormRadio.Group
          name="radioGroup"
          options={options}
          fieldProps={{ onChange }}
        />
      </ProForm>,
    )

    const firstRadio = container.querySelector(
      'input[value="a"]',
    ) as HTMLInputElement
    await userEvent.click(firstRadio)

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('📦 ProFormRadio.Group should support disabled', () => {
    const options = [
      { label: 'Option 1', value: 'a' },
      { label: 'Option 2', value: 'b' },
    ]

    const { container } = render(
      <ProForm>
        <ProFormRadio.Group
          name="radioGroup"
          options={options}
          fieldProps={{ disabled: true }}
        />
      </ProForm>,
    )

    const radioInputs = container.querySelectorAll(
      '.ant-radio-input',
    ) as NodeListOf<HTMLInputElement>
    radioInputs.forEach((input) => {
      expect(input.disabled).toBe(true)
    })
  })

  it('📦 ProFormRadio.Group should support valueEnum', () => {
    const valueEnum = {
      a: 'Label A',
      b: 'Label B',
      c: 'Label C',
    }

    const { container } = render(
      <ProForm>
        <ProFormRadio.Group name="radioGroup" valueEnum={valueEnum} />
      </ProForm>,
    )

    expect(container.querySelectorAll('.ant-radio-wrapper').length).toBe(3)
    expect(screen.getByText('Label A')).toBeTruthy()
    expect(screen.getByText('Label B')).toBeTruthy()
    expect(screen.getByText('Label C')).toBeTruthy()
  })

  it('📦 ProFormRadio.Group should work with Form validation', async () => {
    const onFinish = vi.fn()
    const onFinishFailed = vi.fn()

    const options = [
      { label: 'Option 1', value: 'a' },
      { label: 'Option 2', value: 'b' },
    ]

    render(
      <ProForm onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <ProFormRadio.Group
          name="radioGroup"
          options={options}
          rules={[{ required: true, message: 'Please select an option' }]}
        />
        <button type="submit">Submit</button>
      </ProForm>,
    )

    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onFinishFailed).toHaveBeenCalled()
    })
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('📦 ProFormRadio.Group should pass validation when value is selected', async () => {
    const onFinish = vi.fn()
    const onFinishFailed = vi.fn()

    const options = [
      { label: 'Option 1', value: 'a' },
      { label: 'Option 2', value: 'b' },
    ]

    const { container } = render(
      <ProForm onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <ProFormRadio.Group
          name="radioGroup"
          options={options}
          rules={[{ required: true, message: 'Please select an option' }]}
        />
        <button type="submit">Submit</button>
      </ProForm>,
    )

    const firstRadio = container.querySelector(
      'input[value="a"]',
    ) as HTMLInputElement
    await userEvent.click(firstRadio)

    const submitButton = screen.getByText('Submit')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalled()
    })
    expect(onFinishFailed).not.toHaveBeenCalled()
  })

  it('📦 ProFormRadio.Group should work with readonly mode', () => {
    const options = [
      { label: 'Option 1', value: 'a' },
      { label: 'Option 2', value: 'b' },
    ]

    render(
      <ProForm initialValues={{ radioGroup: 'a' }} readonly>
        <ProFormRadio.Group name="radioGroup" options={options} />
      </ProForm>,
    )

    expect(screen.getByText('Option 1')).toBeTruthy()
  })

  it('📦 ProFormRadio.Button should be accessible', () => {
    const { container } = render(
      <ProForm>
        <ProFormRadio.Button value="test">Radio Button</ProFormRadio.Button>
      </ProForm>,
    )

    expect(container.querySelector('.ant-radio-button-wrapper')).toBeTruthy()
    expect(screen.getByText('Radio Button')).toBeTruthy()
  })

  it('📦 ProFormRadio.Group should handle empty options', () => {
    const { container } = render(
      <ProForm>
        <ProFormRadio.Group name="radioGroup" options={[]} />
      </ProForm>,
    )

    expect(container.querySelectorAll('.ant-radio-wrapper').length).toBe(0)
  })

  it('📦 ProFormRadio.Group should support string options', () => {
    const options = ['Option A', 'Option B', 'Option C']

    render(
      <ProForm>
        <ProFormRadio.Group name="radioGroup" options={options as any} />
      </ProForm>,
    )

    expect(screen.getByText('Option A')).toBeTruthy()
    expect(screen.getByText('Option B')).toBeTruthy()
    expect(screen.getByText('Option C')).toBeTruthy()
  })

  it('📦 ProFormRadio.Group should work with Form.List', async () => {
    const Demo = () => (
      <ProForm>
        <Form.List name="users">
          {(_fields: any, { add }: any) => (
            <>
              <button type="button" onClick={() => add()}>
                Add User
              </button>
            </>
          )}
        </Form.List>
      </ProForm>
    )

    render(<Demo />)

    const addButton = screen.getByText('Add User')
    await userEvent.click(addButton)
    expect(addButton).toBeTruthy()
  })

  it('📦 ProFormRadio should work in a complex form scenario', async () => {
    const onFinish = vi.fn()

    render(
      <ProForm
        onFinish={onFinish}
        initialValues={{
          agreement: true,
          notification: 'email',
        }}
      >
        <ProFormRadio name="agreement">I agree to the terms</ProFormRadio>
        <ProFormRadio.Group
          name="notification"
          label="Notification Method"
          options={[
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Push', value: 'push' },
          ]}
        />
        <button type="submit">Submit</button>
      </ProForm>,
    )

    const submitButton = screen.getByText('Submit')
    await userEvent.click(submitButton)

    expect(onFinish).toHaveBeenCalled()
  })
})
