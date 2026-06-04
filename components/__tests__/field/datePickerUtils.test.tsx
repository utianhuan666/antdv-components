import { ProField } from '@antdv/components'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'

describe('formatDate', () => {
  it('formats ISO string', () => {
    const iso = '2024-05-10T12:00:00.000Z'
    const wrapper = mount({
      render: () => <ProField text={iso} valueType="date" mode="read" />,
    })

    expect(wrapper.text()).toContain(dayjs(iso).format('YYYY-MM-DD'))
  })

  it('recovers plain object shaped like serialized dayjs ($d)', () => {
    const raw = '2024-06-01T08:00:00.000Z'
    const plain = {
      $L: 'en',
      $d: raw,
      $y: 2024,
      $M: 5,
      $D: 1,
    }
    const wrapper = mount({
      render: () => <ProField text={plain} valueType="date" mode="read" />,
    })

    expect(wrapper.text()).toContain(dayjs(raw).format('YYYY-MM-DD'))
  })

  it('uses valueOf when isDayjs-like object lacks clone', () => {
    const ms = new Date('2024-07-15T12:00:00.000Z').getTime()
    const foreign = {
      $isDayjsObject: true,
      valueOf: () => ms,
    }
    const wrapper = mount({
      render: () => <ProField text={foreign} valueType="date" mode="read" />,
    })

    expect(wrapper.text()).toContain(dayjs(ms).format('YYYY-MM-DD'))
  })
})
