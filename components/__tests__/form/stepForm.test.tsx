import { ConfigProvider } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import ProFormText from '../../form/components/Text'
import { StepsForm } from '../../form/layouts'
import { mountAttached, waitFor } from '../testUtils'

describe('stepsForm', () => {
  it('renders StepForm steps and submits merged values', async () => {
    const onFinish = vi.fn().mockResolvedValue(true)
    const onCurrentChange = vi.fn()

    mountAttached({
      render: () => (
        <StepsForm onFinish={onFinish} onCurrentChange={onCurrentChange}>
          <StepsForm.StepForm name="base" title="Base" initialValues={{ name: 'step-one' }}>
            <ProFormText label="Name" name="name" />
          </StepsForm.StepForm>
          <StepsForm.StepForm name="extra" title="Extra" initialValues={{ age: 'step-two' }}>
            <ProFormText label="Age" name="age" />
          </StepsForm.StepForm>
        </StepsForm>
      ),
    })

    await nextTick()

    expect(document.body.textContent).toContain('Base')
    expect(document.body.textContent).toContain('Extra')
    expect(document.body.querySelector('.ant-pro-steps-form-step-active')?.textContent).toContain('Name')

    document.body.querySelector<HTMLButtonElement>('.ant-pro-steps-form .ant-btn-primary')?.click()

    await waitFor(() => {
      expect(onCurrentChange).toHaveBeenCalledWith(1)
      expect(document.body.querySelector('.ant-pro-steps-form-step-active')?.textContent).toContain('Age')
    })

    document.body.querySelector<HTMLButtonElement>('.ant-pro-steps-form .ant-btn-primary')?.click()

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ name: 'step-one', age: 'step-two' })
    })
  })

  it('supports stepsRender and submitter=false', async () => {
    mountAttached({
      render: () => (
        <StepsForm stepsRender={(_, dom) => <div id="steps-render">{dom}</div>} submitter={false}>
          <StepsForm.StepForm name="base" title="Base">
            <ProFormText label="Name" name="name" />
          </StepsForm.StepForm>
        </StepsForm>
      ),
    })

    await nextTick()

    expect(document.body.querySelector('#steps-render')).not.toBeNull()
    expect(document.body.querySelector('.ant-pro-steps-form .ant-btn-primary')).toBeNull()
  })

  it('supports previous button and async onFinish loading lifecycle', async () => {
    let resolveFinish: (value: boolean) => void = () => {}
    const onFinish = vi.fn(() => new Promise<boolean>((resolve) => {
      resolveFinish = resolve
    }))
    const onCurrentChange = vi.fn()

    mountAttached({
      render: () => (
        <StepsForm onFinish={onFinish} onCurrentChange={onCurrentChange}>
          <StepsForm.StepForm name="base" title="Base" initialValues={{ name: 'step-one' }}>
            <ProFormText label="Name" name="name" />
          </StepsForm.StepForm>
          <StepsForm.StepForm name="extra" title="Extra" initialValues={{ age: 'step-two' }}>
            <ProFormText label="Age" name="age" />
          </StepsForm.StepForm>
        </StepsForm>
      ),
    })

    await nextTick()
    document.body.querySelector<HTMLButtonElement>('.ant-pro-steps-form .ant-btn-primary')?.click()

    await waitFor(() => {
      expect(onCurrentChange).toHaveBeenCalledWith(1)
    })

    const previousButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.ant-pro-steps-form button'))
      .find(button => button.textContent?.includes('上一步'))
    previousButton?.click()

    await waitFor(() => {
      expect(onCurrentChange).toHaveBeenCalledWith(0)
    })

    onCurrentChange.mockClear()
    document.body.querySelector<HTMLButtonElement>('.ant-pro-steps-form .ant-btn-primary')?.click()
    await waitFor(() => {
      expect(onCurrentChange).toHaveBeenCalledWith(1)
    })
    document.body.querySelector<HTMLButtonElement>('.ant-pro-steps-form .ant-btn-primary')?.click()

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ name: 'step-one', age: 'step-two' })
      expect(document.body.querySelector('.ant-pro-steps-form .ant-btn-primary')?.className).toContain('loading')
    })

    resolveFinish(true)

    await waitFor(() => {
      expect(document.body.querySelector('.ant-pro-steps-form .ant-btn-primary')?.className).not.toContain('loading')
      expect(document.body.querySelector('.ant-pro-steps-form-step-active')?.textContent).toContain('Name')
    })
  })

  it('stepsFormRef merges formatted values from all steps', async () => {
    const stepsFormRef = shallowRef<any>()
    mountAttached({
      setup() {
        return () => (
          <StepsForm stepsFormRef={stepsFormRef}>
            <StepsForm.StepForm name="base" title="Base" initialValues={{ name: 'a,b' }}>
              <ProFormText name="name" transform={(value: string) => ({ names: value.split(',') })} />
            </StepsForm.StepForm>
            <StepsForm.StepForm name="extra" title="Extra" initialValues={{ empty: '', count: 0 }}>
              <ProFormText name="empty" />
              <ProFormText name="count" />
            </StepsForm.StepForm>
          </StepsForm>
        )
      },
    })

    await nextTick()

    expect(stepsFormRef.value?.getAllFieldsFormatValue()).toEqual({ names: ['a', 'b'], count: 0 })
  })

  it('uses getPrefixCls("pro-steps-form") from antd config', async () => {
    mountAttached({
      render: () => (
        <ConfigProvider prefixCls="acme">
          <StepsForm>
            <StepsForm.StepForm name="base" title="Base">
              <ProFormText label="Name" name="name" />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigProvider>
      ),
    })

    await nextTick()

    expect(document.body.querySelector('.acme-pro-steps-form')).not.toBeNull()
    expect(document.body.querySelector('.acme-pro-steps-form-step-active')?.textContent).toContain('Name')
    expect(document.body.querySelector('.ant-pro-steps-form')).toBeNull()
  })
})
