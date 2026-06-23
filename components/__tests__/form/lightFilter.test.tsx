import { ConfigProvider } from 'antdv-next'
import zhCN from '../../provider/locale/zh_CN'
import dayjs from 'dayjs'
import zhCn from 'dayjs/locale/zh-cn'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { describe, expect, it, vi } from 'vitest'
import { LightFilter, ProFormText } from '../../form'
import { render, waitFor } from '../testUtils'

dayjs.extend(advancedFormat)
dayjs.extend(weekOfYear)
dayjs.locale(zhCn)

describe('LightFilter', () => {
  it(' 🪕 should not use light field label until using LightFilter field helpers', async () => {
    const { container } = render(
      <LightFilter>
        <ProFormText name="name1" label="名称" />
      </LightFilter>,
    )

    await waitFor(() => {
      expect(
        container.querySelector('.ant-pro-form-light-filter'),
      ).toBeTruthy()
    })
    expect(container.querySelector('.ant-pro-core-field-label')).toBeFalsy()
  })

  it(' 🪕 should render basic structure', async () => {
    const { container } = render(
      <LightFilter>
        <LightFilter.input name="name1" label="名称" />
      </LightFilter>,
    )

    await waitFor(() => {
      expect(
        container.querySelector('.ant-pro-form-light-filter'),
      ).toBeTruthy()
    })

    const fieldLabel = await waitFor(() => {
      return container.querySelector('.ant-pro-core-field-label')
    })
    expect(fieldLabel).toBeTruthy()
    expect(fieldLabel?.textContent).toContain('名称')
  })

  it(' 🪕 should support initialValues', async () => {
    const onValuesChange = vi.fn()

    const { container } = render(
      <LightFilter
        initialValues={{
          name1: 'initial value',
        }}
        onValuesChange={onValuesChange}
      >
        <LightFilter.input name="name1" label="名称" />
      </LightFilter>,
    )

    await waitFor(() => {
      expect(
        container.querySelector('.ant-pro-form-light-filter'),
      ).toBeTruthy()
    })

    const fieldLabel = await waitFor(() => {
      return container.querySelector('.ant-pro-core-field-label')
    })
    expect(fieldLabel?.textContent).toContain('initial value')
  })

  it(' 🪕 should support select with valueEnum', async () => {
    const { container } = render(
      <LightFilter>
        <LightFilter.select
          name="name1"
          label="名称"
          valueEnum={{
            open: '未解决',
            closed: '已解决',
          }}
        />
      </LightFilter>,
    )

    await waitFor(() => {
      expect(
        container.querySelector('.ant-pro-form-light-filter'),
      ).toBeTruthy()
    })

    const fieldLabel = await waitFor(() => {
      return container.querySelector('.ant-pro-core-field-label')
    })
    expect(fieldLabel?.textContent).toContain('名称')
  })

  it(' 🪕 should support footerRender', async () => {
    const { container } = render(
      <LightFilter
        footerRender={() => {
          return <div id="footer">footer</div>
        }}
      >
        <LightFilter.input name="name1" label="名称" />
      </LightFilter>,
    )

    await waitFor(() => {
      expect(container.querySelector('.ant-pro-form-light-filter')).toBeTruthy()
    })
  })

  it(' 🪕 should support ConfigProvider locale', async () => {
    const { container } = render(
      <ConfigProvider locale={zhCN as any}>
        <LightFilter>
          <LightFilter.dateRange
            name="time"
            label="时间"
            initialValue={[dayjs('2023-01-01'), dayjs('2023-01-02')]}
          />
        </LightFilter>
      </ConfigProvider>,
    )

    await waitFor(() => {
      expect(container.querySelector('.ant-pro-form-light-filter')).toBeTruthy()
    })
  })
})
