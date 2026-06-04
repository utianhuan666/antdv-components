import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { EyeInvisibleOutlined, EyeOutlined } from '@antdv-next/icons'
import { Space } from 'antdv-next'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldPasswordRead',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    open: { type: Boolean, default: false },
    setOpen: { type: Function as PropType<(updater: boolean | ((prev: boolean) => boolean)) => void>, required: true },
  },
  setup(props) {
    return () => {
      let dom: VNodeChild = <>-</>
      if (props.text) {
        dom = (
          <Space>
            <span>{props.open ? props.text : '********'}</span>
            <a onClick={() => props.setOpen(!props.open)}>
              {props.open ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </a>
          </Space>
        )
      }

      if (props.render) {
        return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom)
      }
      return dom
    }
  },
})
