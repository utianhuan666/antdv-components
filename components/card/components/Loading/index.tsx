import type { CSSProperties } from 'vue'
import { Col, Row } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useStyle } from './style'

export interface ProCardLoadingProps {
  className?: string
  prefix?: string
  style?: CSSProperties
}

const Loading = defineComponent<ProCardLoadingProps>({
  name: 'ProCardLoading',
  inheritAttrs: false,
  props: ['className', 'prefix', 'style'],
  setup(rawProps) {
    const props = rawProps
    const prefix = useProPrefixCls('pro-card', computed(() => props.prefix))
    const { wrapSSR } = useStyle(prefix.value)

    return () => {
      return wrapSSR(
        <div class={`${prefix.value}-loading-content`} style={props.style}>
          <Row gutter={8}>
            <Col span={22}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={8}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
            <Col span={15}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={6}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
            <Col span={18}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={13}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
            <Col span={9}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={4}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
            <Col span={3}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
            <Col span={16}>
              <div class={`${prefix.value}-loading-block`} />
            </Col>
          </Row>
        </div>,
      )
    }
  },
})

export default Loading
