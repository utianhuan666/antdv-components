import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ModalForm,
  ProForm,
  ProFormDependency,
  ProFormList,
  ProFormText,
  StepsForm,
} from '../../form'
import { act, cleanup, fireEvent, render, screen, waitFor, waitForWaitTime } from '../testUtils'

afterEach(() => {
  cleanup()
})

describe('ProForm List', () => {
  it('⛲ ProForm.List', async () => {
    const fn = vi.fn()
    render(
      <ProForm
        onFinish={async (values: any) => {
          fn(Object.keys(values.users[0]))
        }}
      >
        <ProFormText name="name" label="姓名" />
        <ProFormList
          name="users"
          label="用户信息"
          initialValue={[
            {
              name: '1111',
              nickName: '1111',
            },
          ]}
        >
          <ProFormText name="name" label="姓名" />
          <ProFormText name="nickName" label="昵称" />
        </ProFormList>
      </ProForm>,
    )

    fireEvent.click(await screen.findByText('提 交'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith(['name', 'nickName'])
    })
  })

  it('⛲ ProForm.List support readonly', async () => {
    const html = render(
      <ProForm readonly>
        <ProFormText name="name" label="姓名" />
        <ProFormList
          name="users"
          label="用户信息"
          initialValue={[
            {
              name: '1111',
              nickName: '1111',
            },
          ]}
        >
          <ProFormText name="name" label="姓名" />
          <ProFormText name="nickName" label="昵称" />
        </ProFormList>
      </ProForm>,
    )
    await html.findByText('提 交')

    expect(
      html.baseElement.textContent?.includes('添加'),
    ).toBeFalsy()
  })

  it('⛲ ProForm.List for deps ProFormDependency', async () => {
    const html = render(
      <StepsForm>
        <StepsForm.StepForm
          name="cep"
          title="端规则编排"
          onFinish={async () => {
            return true
          }}
        >
          <ProFormList
            name="parttenList"
            creatorButtonProps={{
              position: 'bottom',
              creatorButtonText: '添加规则',
            }}
            min={1}
            initialValue={[{}]}
          >
            <ModalForm
              title="添加规则"
              trigger={<div>点击添加</div>}
              width={1200}
            >
              <ProFormText
                name="ruleType"
                width="sm"
                label="规则类型"
                rules={[{ required: true, message: '请选择规则类型' }]}
              />
              <ProFormDependency name={['ruleType']}>
                {({ ruleType }: any) => {
                  return <div>你好{ruleType}</div>
                }}
              </ProFormDependency>
            </ModalForm>
          </ProFormList>
        </StepsForm.StepForm>
      </StepsForm>,
    )

    const button = await html.findByText('点击添加')

    act(() => {
      button.click()
    })

    await waitForWaitTime(200)
    expect(html.baseElement.textContent || '').toContain('规则类型')
  })

  it('⛲ ProForm.List add button', async () => {
    const wrapper = render(
      <ProForm>
        <ProFormList name="users" label="用户信息" initialValue={[{}]}>
          <ProFormText name="name" label="姓名" />
        </ProFormList>
      </ProForm>,
    )

    await waitFor(() => {
      expect(wrapper.baseElement.textContent || '').toContain('添加')
    })
  })
})
