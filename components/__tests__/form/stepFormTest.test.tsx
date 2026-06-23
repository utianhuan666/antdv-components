import { Button } from 'antdv-next'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProFormText, StepsForm } from '../../form'
import { act, cleanup, fireEvent, render, screen, userEvent, waitFor } from '../testUtils'

afterEach(() => {
  cleanup()
})

describe('StepsForm', () => {
  it('🐲 basic use', () => {
    const { container, unmount } = render(
      <StepsForm>
        <StepsForm.StepForm title="表单1">
          <ProFormText name="姓名" />
        </StepsForm.StepForm>
        <StepsForm.StepForm title="表单2">
          <ProFormText name="邮箱" />
        </StepsForm.StepForm>
        <StepsForm.StepForm title="表单3">
          <ProFormText name="地址" />
        </StepsForm.StepForm>
      </StepsForm>,
    )

    expect(container.querySelectorAll('.ant-steps-item-icon')).toHaveLength(3)
    expect(
      container.querySelectorAll('div.ant-steps-item-title')[0]?.textContent,
    ).toContain('表单1')
    unmount()
  })

  it('🐲 stepsRender', async () => {
    const { container, rerender, unmount } = render(
      <StepsForm stepsRender={() => null}>
        <StepsForm.StepForm name="base" title="表单1">
          <ProFormText name="姓名" />
        </StepsForm.StepForm>
        <StepsForm.StepForm name="moreInfo" title="表单2">
          <ProFormText name="邮箱" />
        </StepsForm.StepForm>
      </StepsForm>,
    )

    expect(container.querySelectorAll('.ant-steps').length).toBe(0)

    await rerender(
      <StepsForm stepsRender={(_, dom) => <div id="test">{dom}</div>}>
        <StepsForm.StepForm name="base" title="表单1">
          <ProFormText name="姓名" />
        </StepsForm.StepForm>
        <StepsForm.StepForm name="moreInfo" title="表单2">
          <ProFormText name="邮箱" />
        </StepsForm.StepForm>
      </StepsForm>,
    )

    expect(container.querySelectorAll('.ant-steps').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('div#test').length).toBeGreaterThan(0)
    unmount()
  })

  it('🐲 async onFinish', async () => {
    const fn = vi.fn()
    const currentFn = vi.fn()
    const onFinish = vi.fn()

    const html = render(
      <StepsForm onCurrentChange={currentFn} onFinish={onFinish}>
        <StepsForm.StepForm
          name="base"
          title="表单1"
          onFinish={async (values: any) => {
            fn(values)
            return true
          }}
        >
          <ProFormText name="姓名" />
        </StepsForm.StepForm>
        <StepsForm.StepForm name="moreInfo" title="表单2">
          <ProFormText name="邮箱" />
        </StepsForm.StepForm>
      </StepsForm>,
    )

    await act(async () => {
      ;(await html.findByText('下一步')).click()
    })

    expect(fn).toHaveBeenCalled()
    expect(currentFn).toHaveBeenCalled()

    await act(async () => {
      ;(await html.findByText('提 交')).click()
    })

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalled()
    })
    html.unmount()
  })

  it('🐲 submitter render=false', () => {
    const { container } = render(
      <StepsForm
        submitter={{
          render: false,
        }}
      >
        <StepsForm.StepForm name="base" title="表单1">
          <ProFormText name="姓名" />
        </StepsForm.StepForm>
        <StepsForm.StepForm name="moreInfo" title="表单2">
          <ProFormText name="邮箱" />
        </StepsForm.StepForm>
      </StepsForm>,
    )

    expect(
      container.querySelectorAll('button.ant-btn.ant-btn-primary').length,
    ).toBe(0)
  })

  it('🐲 submitter render props', async () => {
    const fn = vi.fn()
    render(
      <StepsForm
        current={1}
        onCurrentChange={(current: number) => fn(current)}
        submitter={{
          render: (props: any) => {
            return (
              <button type="button" id="rest" onClick={() => props?.onPre?.()}>
                rest
              </button>
            )
          },
        }}
      >
        <StepsForm.StepForm name="base" title="表单1">
          <ProFormText name="姓名" />
        </StepsForm.StepForm>
        <StepsForm.StepForm name="moreInfo" title="表单2">
          <ProFormText name="邮箱" />
        </StepsForm.StepForm>
      </StepsForm>,
    )

    fireEvent.click(await screen.getByText('rest'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(0)
    })
  })

  it('🐲 support stepsFormRender', async () => {
    const wrapper = render(
      <StepsForm
        stepsFormRender={(formDom, submitter) => (
          <div id="steps-form-render">
            {formDom}
            {submitter}
          </div>
        )}
      >
        <StepsForm.StepForm name="base" title="表单1">
          <ProFormText name="姓名" />
        </StepsForm.StepForm>
        <StepsForm.StepForm name="moreInfo" title="表单2">
          <ProFormText name="邮箱" />
        </StepsForm.StepForm>
      </StepsForm>,
    )

    expect(
      wrapper.container.querySelector('#steps-form-render'),
    ).toBeTruthy()
  })
})
