import { ConfigProvider } from 'antdv-next'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { ProForm, ProFormText } from '../../form'
import { cleanup, fireEvent, render, waitFor } from '../testUtils'

const TEST_INITIAL_URL = 'http://localhost?layoutTheme=realDark&layout=side&colorPrimary=techBlue&splitMenus=false&fixedHeader=true'

describe('proForm', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', TEST_INITIAL_URL)
  })

  afterEach(() => {
    cleanup()
  })

  it('📦 submit props actionsRender=false', async () => {
    const wrapper = render(<ProForm submitter={false} />)

    expect(wrapper.queryByText('提 交')).toBeNull()
    expect(wrapper.queryByText('重 置')).toBeNull()
    wrapper.unmount()
  })

  it('📦 className and rootClassName should work correctly', () => {
    const wrapper = render(
      <ProForm
        className="custom-form-class"
        rootClassName="custom-root-class"
        submitter={false}
      >
        <ProFormText name="test" />
      </ProForm>,
    )
    const form = wrapper.container.querySelector('form')
    expect(form?.className).toContain('ant-pro-form')
    expect(form?.className).toContain('custom-form-class')
    expect(form?.className).toContain('custom-root-class')
    wrapper.unmount()
  })

  it('📦 componentSize is work', async () => {
    const wrapper = render(
      <ConfigProvider componentSize="small">
        <ProForm>
          <ProFormText />
        </ProForm>
      </ConfigProvider>,
    )
    expect(wrapper.baseElement.querySelectorAll<HTMLElement>('.ant-input-sm').length).toBe(1)
    wrapper.unmount()
  })

  it('📦 ProForm support sync form url', async () => {
    const fn = vi.fn()
    const wrapper = render(
      <ProForm
        onFinish={async (values: any) => {
          fn(values.layoutTheme)
        }}
        syncToUrl
      >
        <ProFormText name="layoutTheme" />
      </ProForm>,
    )

    fireEvent.click(await wrapper.findByText('提 交'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('realDark')
    })
  })

  it('📦 ProForm support sync form url as important', async () => {
    const fn = vi.fn()
    const wrapper = render(
      <ProForm
        onFinish={async (values: any) => {
          fn(values.layoutTheme)
        }}
        syncToUrl
        syncToUrlAsImportant
      >
        <ProFormText name="layoutTheme" />
      </ProForm>,
    )

    fireEvent.click(await wrapper.findByText('提 交'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith('realDark')
    })
    wrapper.unmount()
  })

  it('📦 ProForm support sync form url and rest', async () => {
    const onFinish = vi.fn()
    const wrapper = render(
      <ProForm
        onFinish={async (values: any) => {
          onFinish(values.layoutTheme)
        }}
        syncToUrl
        syncToInitialValues={false}
      >
        <ProFormText name="layoutTheme" />
      </ProForm>,
    )

    fireEvent.click(await wrapper.findByText('提 交'))

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith('realDark')
    })

    fireEvent.click(await wrapper.findByText('重 置'))
    fireEvent.click(await wrapper.findByText('提 交'))

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith(undefined)
    })
    wrapper.unmount()
  })

  it('📦 request rewrite initialsValue', async () => {
    const wrapper = render(
      <ProForm
        request={async () => {
          return {
            name: '100',
          }
        }}
        initialValues={{
          name: '不是1000',
        }}
      >
        <ProFormText name="name" />
      </ProForm>,
    )
    await wrapper.findByText('提 交')
    expect(!!(await wrapper.findByDisplayValue('100'))).toBeTruthy()
    wrapper.unmount()
  })

  it('📦 submit props actionsRender=()=>false', async () => {
    const wrapper = render(
      <ProForm
        submitter={{
          render: () => false,
        }}
      >
        text
      </ProForm>,
    )
    await wrapper.findByText('text')
    expect(wrapper.queryByText('提 交')).toBeNull()
    expect(wrapper.queryByText('重 置')).toBeNull()
    wrapper.unmount()
  })

  it('📦 submit props actionsRender is one', async () => {
    const wrapper = render(
      <ProForm
        submitter={{
          render: () => [<a key="test">test</a>],
        }}
      />,
    )
    await wrapper.findByText('test')
    expect(wrapper.queryByText('提 交')).toBeNull()
    expect(wrapper.getByText('test').tagName).toBe('A')
    wrapper.unmount()
  })

  it('📦 support formRef', async () => {
    const formRef = shallowRef<any>()
    const wrapper = render(
      <ProForm
        formRef={formRef}
        submitter={{
          render: () => [<a key="test">test</a>],
        }}
        initialValues={{
          test: '12,34',
        }}
      >
        <ProFormText
          name="test"
          transform={(value: string) => {
            return {
              test: value.split(','),
            }
          }}
        />
      </ProForm>,
    )
    await wrapper.findByText('test')

    expect(formRef.value?.getFieldFormatValue?.('test')?.join('-')).toBe('12-34')
    expect(formRef.value?.getFieldFormatValueObject?.('test')?.test.join('-')).toBe('12-34')
    expect(formRef.value?.getFieldFormatValueObject?.()?.test.join('-')).toBe('12-34')
    expect(formRef.value?.getFieldsFormatValue?.()?.test.join('-')).toBe('12-34')
    expect(formRef.value?.getFieldFormatValue?.(['test'])?.join('-')).toBe('12-34')
    expect(formRef.value?.getFieldValue?.('test')).toBe('12,34')
    wrapper.unmount()
  })

  it('📦 support formRef nativeElement', async () => {
    const formRef = shallowRef<any>()
    const wrapper = render(
      <ProForm formRef={formRef}>
        <ProFormText name="test" />
      </ProForm>,
    )

    await nextTick()
    expect(wrapper.container.querySelector('form')).toBe(formRef.value?.nativeElement)
  })

  it('📦 ProForm support namePath is array', async () => {
    const fn = vi.fn()
    const wrapper = render(
      <ProForm
        initialValues={{
          name: {
            test: 'test',
          },
          test: 'test2',
        }}
        isKeyPressSubmit
        onFinish={async (params: any) => {
          fn(params)
        }}
      >
        <ProFormText name={['name', 'test']} />
        <ProFormText name="test" />
      </ProForm>,
    )

    fireEvent.click(await wrapper.findByText('提 交'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalledWith({
        name: {
          test: 'test',
        },
        test: 'test2',
      })
    })
    wrapper.unmount()
  })

  it('📦 ProForm support enter submit', async () => {
    const fn = vi.fn()
    const wrapper = render(
      <ProForm
        omitNil={false}
        isKeyPressSubmit
        onFinish={async () => {
          fn()
        }}
      >
        <ProFormText name="test" />
      </ProForm>,
    )

    await wrapper.findByText('提 交')
    fireEvent.click(await wrapper.findByText('提 交'))

    await waitFor(() => {
      expect(fn).toHaveBeenCalled()
    })
    wrapper.unmount()
  })
})
