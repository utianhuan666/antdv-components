import { afterEach, describe, expect, it } from 'vitest'
import {
  LightFilter,
  ProFormText,
  QueryFilter,
} from '../../form'
import { act, cleanup, fireEvent, render, waitFor } from '../testUtils'

afterEach(() => {
  cleanup()
})

describe('✔️ LightFilter', () => {
  it(' ✔️ clear input values', async () => {
    const html = render(
      <LightFilter>
        <LightFilter.input
          name="name1"
          label="名称"
          fieldProps={{
            role: 'name_input',
          }}
        />
      </LightFilter>,
    )

    await act(async () => {
      ;(await html.findByText('名称'))?.click()
    })

    await waitFor(() => {
      return html.findByRole('name_input')
    })

    await act(async () => {
      const dom = await html.findByRole('name_input')
      fireEvent.change(dom, {
        target: {
          value: 'qixian',
        },
      })
    })

    await act(async () => {
      ;(await html.findAllByText('确 认')).at(0)?.click()
    })

    await waitFor(() => {
      expect(html.baseElement.textContent || '').toContain('qixian')
    })
  })

  it(' ✔️ QueryFilter resize', async () => {
    const html = render(
      <QueryFilter>
        <ProFormText name="name1" label="名称" />
      </QueryFilter>,
    )

    await act(async () => {
      ;(await html.findByText('名称'))?.click()
    })

    expect(html.baseElement.querySelector('form')).toBeTruthy()
  })
})
