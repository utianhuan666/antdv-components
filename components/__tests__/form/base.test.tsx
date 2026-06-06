import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { ProFormDateTimePicker } from '../../form/components/DatePicker'
import ProFormText from '../../form/components/Text'
import ProForm from '../../form/layouts/ProForm'
import { mountAttached, waitFor } from '../testUtils'

describe('proForm base compatibility', () => {
  it('syncs values from url and writes submitted values back to url', async () => {
    window.history.pushState(null, '', '/form-base?name=url&keep=1&empty=')
    const onFinish = vi.fn().mockResolvedValue(true)

    const wrapper = mountAttached({
      render: () => (
        <ProForm
          syncToUrl
          extraUrlParams={{ keep: '1' }}
          onFinish={onFinish}
          initialValues={{ name: 'initial', age: 18 }}
        >
          <ProFormText name="name" />
          <ProFormText name="age" />
        </ProForm>
      ),
    })

    await nextTick()
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('initial')

    await wrapper.find('input').setValue('changed')
    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ name: 'changed', age: 18, keep: '1' })
      expect(window.location.search).toContain('name=changed')
      expect(window.location.search).toContain('age=18')
      expect(window.location.search).toContain('keep=1')
      expect(window.location.search).not.toContain('empty=')
    })
  })

  it('lets syncToUrl override initialValues when syncToUrlAsImportant is true', async () => {
    window.history.pushState(null, '', '/form-base?name=url')

    const wrapper = mountAttached({
      render: () => (
        <ProForm syncToUrl syncToUrlAsImportant initialValues={{ name: 'initial' }}>
          <ProFormText name="name" />
        </ProForm>
      ),
    })

    await nextTick()
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('url')
  })

  it('request data rewrites initialValues and toggles loading state', async () => {
    const onLoadingChange = vi.fn()
    const request = vi.fn().mockResolvedValue({ name: 'request' })
    const formRef = shallowRef<any>()

    mountAttached({
      setup() {
        return () => (
          <ProForm
            ref={formRef}
            initialValues={{ name: 'initial' }}
            request={request}
            params={{ id: 1 }}
            onLoadingChange={onLoadingChange}
          >
            <ProFormText name="name" />
          </ProForm>
        )
      },
    })

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith({ id: 1 })
      expect(formRef.value?.getFieldValue('name')).toBe('request')
      expect(onLoadingChange).toHaveBeenCalledWith(true)
      expect(onLoadingChange).toHaveBeenLastCalledWith(false)
    })
  })

  it('closes submit loading when onFinish rejects', async () => {
    const onLoadingChange = vi.fn()
    const onFinish = vi.fn().mockRejectedValue(new Error('boom'))
    const wrapper = mountAttached({
      render: () => (
        <ProForm onFinish={onFinish} onLoadingChange={onLoadingChange}>
          <ProFormText name="name" initialValue="antdv" />
        </ProForm>
      ),
    })

    await wrapper.find('.ant-btn-primary').trigger('click')

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ name: 'antdv' })
      expect(onLoadingChange).toHaveBeenLastCalledWith(false)
    })
  })

  it('exposes nativeElement and format helpers on form ref', async () => {
    const formRef = shallowRef<any>()
    mountAttached({
      setup() {
        return () => (
          <ProForm ref={formRef}>
            <ProFormText name="tags" initialValue="a,b" transform={(value: string) => ({ tags: value.split(',') })} />
          </ProForm>
        )
      },
    })

    await nextTick()

    expect(formRef.value?.nativeElement).toBeInstanceOf(HTMLFormElement)
    expect(formRef.value?.getFieldsFormatValue()).toEqual({ tags: ['a', 'b'] })
    expect(formRef.value?.getFieldFormatValueObject('tags')).toEqual({ tags: ['a', 'b'] })
  })

  it('passes all values to transform and keeps false/0 when omitNil is enabled', async () => {
    const transform = vi.fn((value: string, namePath: any, allValues?: Record<string, any>) => ({
      joined: `${allValues?.prefix}-${Array.isArray(namePath) ? namePath.join('.') : namePath}-${value}`,
    }))
    const formRef = shallowRef<any>()
    mountAttached({
      setup() {
        return () => (
          <ProForm ref={formRef} initialValues={{ prefix: 'pre', count: 0, enabled: false, empty: '' }}>
            <ProFormText name="name" initialValue="value" transform={transform} />
            <ProFormText name="prefix" />
            <ProFormText name="count" />
            <ProFormText name="enabled" />
            <ProFormText name="empty" />
          </ProForm>
        )
      },
    })

    await nextTick()

    expect(formRef.value?.getFieldsFormatValue()).toEqual({
      joined: 'pre-name-value',
      prefix: 'pre',
      count: 0,
      enabled: false,
    })
    expect(transform).toHaveBeenCalledWith('value', ['name'], expect.objectContaining({ prefix: 'pre' }))
  })

  it('submits when pressing enter in an input', async () => {
    const onFinish = vi.fn()
    const wrapper = mountAttached({
      render: () => (
        <ProForm isKeyPressSubmit onFinish={onFinish}>
          <ProFormText name="name" initialValue="enter" />
        </ProForm>
      ),
    })

    await wrapper.find('input').trigger('keydown', { key: 'Enter' })

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith({ name: 'enter' })
    })
  })

  it('formats date values with custom dateFormatter', async () => {
    const formRef = shallowRef<any>()
    const dateValue = dayjs('2024-01-02 03:04:05')

    mountAttached({
      setup() {
        return () => (
          <ProForm ref={formRef} initialValues={{ time: dateValue }} dateFormatter={(value, valueType) => `${valueType}:${value.valueOf()}`}>
            <ProFormDateTimePicker name="time" />
          </ProForm>
        )
      },
    })

    await nextTick()

    expect(formRef.value?.getFieldsFormatValue()).toEqual({ time: `dateTime:${dateValue.valueOf()}` })
  })
})
