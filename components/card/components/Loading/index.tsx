import type { CSSProperties } from 'vue'
import { Col, Row } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useStyle } from './style'

export interface ProCardLoadingProps {
  prefix?: string
  style?: CSSProperties
  contentStyle?: CSSProperties
  padding?: number | string
}

const Loading = defineComponent({
  name: 'ProCardLoading',
  inheritAttrs: false,
  props: ['prefix', 'style', 'contentStyle', 'padding'],
  setup(rawProps, { attrs }) {
    const props = rawProps as ProCardLoadingProps
    const prefix = useProPrefixCls('pro-card', computed(() => props.prefix))
    const { wrapSSR } = useStyle(prefix.value)

    return () => {
      const contentStyle = props.contentStyle
        || (attrs.contentStyle as CSSProperties | undefined)
        || (attrs['content-style'] as CSSProperties | undefined)
        || props.style
        || (attrs.style as CSSProperties | undefined)
      const mergedStyle = props.padding != null
        ? { ...(contentStyle || {}), padding: props.padding }
        : contentStyle

      return wrapSSR(
        <div class={`${prefix.value}-loading-content`} style={mergedStyle}>
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
              <div class={`${prefix}-loading-block`} />
            </Col>
          </Row>
        </div>,
      )
    }
  },
})

export default Loading
