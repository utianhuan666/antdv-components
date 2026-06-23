import { afterEach, describe, expect, it } from 'vitest'
import { ProForm, ProFormSegmented } from '../../form'
import { cleanup, render } from '../testUtils'

afterEach(() => {
  cleanup()
})

describe('ProFormSegmented', () => {
  it('📦 ProFormSegmented supports fieldProps.options', () => {
    const options = [
      { label: 'a', value: 'a' },
      { label: 'b', value: 'b' },
    ]

    const { container } = render(
      <ProForm>
        <ProFormSegmented
          fieldProps={{
            options,
          }}
        />
      </ProForm>,
    )

    expect(container.querySelectorAll('.ant-segmented-item').length).toBe(
      options.length,
    )
  })
})
