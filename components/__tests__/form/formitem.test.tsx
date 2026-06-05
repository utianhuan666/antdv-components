// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { ProForm, ProFormDependency, ProFormItem, ProFormText } from '@antdv/components'
import { Input, Space, Tag } from 'antdv-next'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountAttached, waitFor } from '../testUtils'

describe('proForm.Item', () => {
  it('📦 ProForm support fieldProps.onBlur', async () => {
    const onBlur = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm initialValues={{ layoutTheme: 'dark' }}>
          <ProFormText
            name="layoutTheme"
            fieldProps={{
              id: 'layoutTheme',
              onBlur: (event: Event) => onBlur((event.target as HTMLInputElement).value),
            }}
          />
        </ProForm>
      ),
    })

    const input = wrapper.find('input#layoutTheme')
    await input.trigger('focus')
    await input.trigger('blur')

    expect(onBlur).toHaveBeenCalledWith('dark')
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('📦 ProForm.Item supports onChange', async () => {
    const onChange = vi.fn()
    const onValuesChange = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm
          initialValues={{ layoutTheme: 'dark' }}
          onValuesChange={({ name }: { name?: string }) => onValuesChange(name)}
        >
          <ProFormItem name="name">
            <Input id="name" onChange={(event: Event) => onChange((event.target as HTMLInputElement).value)} />
          </ProFormItem>
        </ProForm>
      ),
    })

    await wrapper.find('input#name').setValue('1212')

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('1212')
      expect(onValuesChange).toHaveBeenCalledWith('1212')
    })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onValuesChange).toHaveBeenCalledTimes(1)
  })

  it('📦 ProFormText readonly without name (ProFormDependency + Space) should render without onBlur warning', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountAttached({
      render: () => (
        <ProForm
          initialValues={{
            primaryOrganizationId: 'org-1',
            primaryOrganizationName: '示例主组织',
            affiliatedOrganizationIds: '',
          }}
        >
          <ProFormText name="primaryOrganizationId" hidden />
          <ProFormText name="primaryOrganizationName" hidden />
          <ProFormText name="affiliatedOrganizationIds" hidden />

          <ProFormDependency name={['primaryOrganizationName', 'primaryOrganizationId']}>
            {({ primaryOrganizationName }: { primaryOrganizationName?: string }) => (
              <ProFormText label="组织名称" readonly required extra="主组织与从属组织">
                <Space size={[0, 8]} wrap>
                  <Tag>
                    {primaryOrganizationName}
                    <span style={{ color: '#1677ff', fontWeight: 'bolder', paddingLeft: '5px' }}>
                      主组织
                    </span>
                  </Tag>
                </Space>
              </ProFormText>
            )}
          </ProFormDependency>
        </ProForm>
      ),
    })

    await nextTick()

    expect(wrapper.text()).toContain('示例主组织')
    expect(wrapper.text()).toContain('主组织')

    const onBlurWarning = consoleSpy.mock.calls.find(args =>
      String(args[0]).includes('onBlur') && String(args[0]).includes('function'),
    )
    consoleSpy.mockRestore()
    expect(onBlurWarning).toBeUndefined()
  })
})
