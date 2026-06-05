import type { CSSProperties } from 'vue'
import { Col, Row } from 'antdv-next'
import { defineComponent } from 'vue'
import { useStyle } from './style'

export interface ProCardLoadingProps {
  prefix?: string
  style?: CSSProperties
}

const Loading = defineComponent({
  name: 'ProCardLoading',
  props: ['prefix', 'style'],
  setup(rawProps) {
    const props = rawProps as ProCardLoadingProps
    const prefix = props.prefix || 'ant-pro-card'
    const { wrapSSR } = useStyle(prefix)

    return () => {
      return wrapSSR(
        <div class={`${prefix}-loading-content`} style={props.style}>
          <Row gutter={8}>
            <Col span={22}>
              <div class={`${prefix}-loading-block`} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={8}>
              <div class={`${prefix}-loading-block`} />
            </Col>
            <Col span={15}>
              <div class={`${prefix}-loading-block`} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={6}>
              <div class={`${prefix}-loading-block`} />
            </Col>
            <Col span={18}>
              <div class={`${prefix}-loading-block`} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={13}>
              <div class={`${prefix}-loading-block`} />
            </Col>
            <Col span={9}>
              <div class={`${prefix}-loading-block`} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={4}>
              <div class={`${prefix}-loading-block`} />
            </Col>
            <Col span={3}>
              <div class={`${prefix}-loading-block`} />
            </Col>
            <Col span={16}>
              <div class={`${prefix}-loading-block`} />
            </Col>
          </Row>
        </div>,
      )
    }
  },
})

export default Loading
