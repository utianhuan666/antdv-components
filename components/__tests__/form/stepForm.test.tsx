import { ProFormText } from '@antdv/components'
// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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
})
