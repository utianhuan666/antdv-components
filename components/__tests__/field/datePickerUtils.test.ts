import { ProField } from '@antdv/components'
import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { formatDate } from '../../field/components/DatePicker/datePickerUtils'

describe('formatDate', () => {
  it('formats ISO string', () => {
    const iso = '2024-05-10T12:00:00.000Z'
    expect(formatDate(iso, 'YYYY-MM-DD')).toBe(dayjs(iso).format('YYYY-MM-DD'))

    const wrapper = mount(ProField as any, {
      props: { text: iso, valueType: 'date', mode: 'read' },
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
    expect(formatDate(plain, 'YYYY-MM-DD')).toBe(dayjs(raw).format('YYYY-MM-DD'))

    const wrapper = mount(ProField as any, {
      props: { text: plain, valueType: 'date', mode: 'read' },
    })

    expect(wrapper.text()).toContain(dayjs(raw).format('YYYY-MM-DD'))
  })

  it('uses valueOf when isDayjs-like object lacks clone', () => {
    const ms = new Date('2024-07-15T12:00:00.000Z').getTime()
    const foreign = {
      $isDayjsObject: true,
      valueOf: () => ms,
    }
    expect(formatDate(foreign, 'YYYY-MM-DD')).toBe(dayjs(ms).format('YYYY-MM-DD'))

    const wrapper = mount(ProField as any, {
      props: { text: foreign, valueType: 'date', mode: 'read' },
    })

    expect(wrapper.text()).toContain(dayjs(ms).format('YYYY-MM-DD'))
  })
})
