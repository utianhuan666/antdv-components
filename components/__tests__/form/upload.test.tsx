import { Form } from 'antdv-next'
import type { UploadFile } from 'antdv-next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ProForm,
  ProFormUploadButton,
  ProFormUploadDragger,
} from '../../form'
import { act, cleanup, fireEvent, render, waitForWaitTime } from '../testUtils'

const mockFile = new File(['foo'], 'foo.png', {
  type: 'image/png',
}) as unknown as UploadFile
const mockFile1 = new File(['foo1'], 'foo1.png', {
  type: 'image/png',
}) as unknown as UploadFile
const mockFile2 = new File(['foo2'], 'foo2.png', {
  type: 'image/png',
}) as unknown as UploadFile

function setup() {
  const originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn(async () => {
    return new Response('ok', { status: 200 })
  }) as any
  return () => {
    globalThis.fetch = originalFetch
  }
}

afterEach(() => {
  cleanup()
})

describe('ProFormUpload', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  let restoreFetch: (() => void) | undefined

  beforeEach(() => {
    restoreFetch = setup()
  })

  afterEach(() => {
    restoreFetch?.()
    errorSpy.mockReset()
  })

  it('🏐 ProFormUploadButton support onChange', async () => {
    const fn = vi.fn()
    const onChangeFn = vi.fn()
    const wrapper = render(
      <ProForm
        onValuesChange={(_: any, values: any) => {
          fn(values.files)
        }}
      >
        <ProFormUploadButton
          action="http://upload.com"
          listType="text"
          onChange={() => onChangeFn()}
          label="upload"
          name="files"
        />
      </ProForm>,
    )

    act(() => {
      fireEvent.change(
        wrapper.baseElement.querySelector<HTMLDivElement>('.ant-upload input'),
        {
          target: {
            files: [mockFile],
          },
        },
      )
    })
    await waitForWaitTime(300)
    expect(onChangeFn).toHaveBeenCalled()
  })

  it('🏐 ProFormUploadButton support beforeUpload', async () => {
    const wrapper = render(
      <ProForm>
        <ProFormUploadButton
          action="http://upload.com"
          listType="text"
          label="upload"
          name="files"
          fieldProps={{
            beforeUpload: () => {
              return false
            },
          }}
        />
      </ProForm>,
    )

    act(() => {
      fireEvent.change(
        wrapper.baseElement.querySelector<HTMLDivElement>('.ant-upload input'),
        {
          target: {
            files: [mockFile],
          },
        },
      )
    })
    await waitForWaitTime(200)

    act(() => {
      expect(
        wrapper.baseElement.querySelectorAll<HTMLDivElement>(
          'div.ant-upload-list-picture-container',
        ).length,
      ).toBe(0)
    })
  })

  it('🏐 ProFormUploadButton support disable', async () => {
    const wrapper = render(
      <Form>
        <ProFormUploadButton
          disabled
          action="http://upload.com"
          listType="text"
          label="upload"
          name="files"
        />
      </Form>,
    )
    expect(
      wrapper.baseElement
        .querySelector<HTMLDivElement>('.ant-upload')
        ?.classList.toString(),
    ).toContain('ant-upload-disabled')

    act(() => {
      wrapper.rerender(
        <Form>
          <ProFormUploadButton
            disabled
            action="http://upload.com"
            listType="text"
            label="upload"
            name="files"
            buttonProps={{
              disabled: true,
              type: 'dashed',
            }}
          />
        </Form>,
      )
    })
    await waitForWaitTime(100)
    expect(
      wrapper.baseElement
        .querySelector<HTMLDivElement>('.ant-upload')
        ?.querySelector('.ant-btn-dashed'),
    ).toBeTruthy()
  })

  it('🏐 ProFormUploadDragger support onChange', async () => {
    const fn = vi.fn()
    const onChangeFn = vi.fn()
    const wrapper = render(
      <ProForm
        onValuesChange={(_: any, values: any) => {
          fn(values.files)
        }}
      >
        <ProFormUploadDragger
          onChange={() => onChangeFn()}
          action="http://upload.com"
          label="upload"
          name="files"
        />
      </ProForm>,
    )

    act(() => {
      fireEvent.change(
        wrapper.baseElement.querySelector<HTMLDivElement>('.ant-upload input'),
        {
          target: {
            files: [mockFile],
          },
        },
      )
    })
    await waitForWaitTime(200)
    expect(onChangeFn).toHaveBeenCalled()
  })

  it('🏐 ProFormUploadDragger hide when max', async () => {
    const wrapper = render(
      <Form>
        <ProFormUploadDragger
          max={2}
          value={[mockFile, mockFile1, mockFile2]}
          action="http://upload.com"
          label="upload"
          name="files"
        />
      </Form>,
    )

    await waitForWaitTime(100)
    expect(
      getComputedStyle(
        wrapper.baseElement.querySelector<HTMLDivElement>(
          '.ant-upload.ant-upload-drag',
        )!,
      )?.display,
    ).toBe('none')
  })

  it('🏐 ProFormUploadDragger support children', async () => {
    const extra = 'extra'
    const wrapper = render(
      <Form>
        <ProFormUploadDragger
          value={[mockFile, mockFile1, mockFile2]}
          action="http://upload.com"
          label="upload"
          name="files"
        >
          {extra}
        </ProFormUploadDragger>
      </Form>,
    )

    await waitForWaitTime(100)
    expect(
      wrapper.baseElement.querySelector<HTMLDivElement>(
        '.ant-upload-drag .ant-upload-extra',
      )?.textContent,
    ).toBe(extra)
  })

  it('🏐 ProFormUploadButton hide when max', async () => {
    const wrapper = render(
      <Form>
        <ProFormUploadButton
          max={2}
          value={[mockFile, mockFile1, mockFile2]}
          action="http://upload.com"
          label="upload"
          name="files"
        />
      </Form>,
    )

    await waitForWaitTime(100)
    expect(
      wrapper.baseElement.querySelector<HTMLDivElement>(
        '.anticon.anticon-upload',
      ),
    ).toBeFalsy()
  })
})
