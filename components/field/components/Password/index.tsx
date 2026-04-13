import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { EyeInvisibleOutlined, EyeOutlined } from '@antdv-next/icons'
import { InputPassword } from 'antdv-next'
import { computed, defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'

export default defineComponent({
  name: 'FieldPassword',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element | undefined>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: JSX.Element) => JSX.Element>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    open: { type: Boolean, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
  },
  setup(props) {
    const openRef = ref(false)

    // Controlled state: if props.open is provided, use it; otherwise use internal state
    const isOpen = computed(() => props.open ?? openRef.value)

    const setOpen = (value: boolean) => {
      openRef.value = value
      props.onOpenChange?.(value)
    }

    const toggleOpen = () => {
      setOpen(!isOpen.value)
    }

    return () => {
      if (isProFieldReadMode(props.mode)) {
        if (!props.text) {
          return <>{props.emptyText}</>
        }
        const dom = (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>{isOpen.value ? props.text : '********'}</span>
            <a onClick={toggleOpen} style={{ cursor: 'pointer' }}>
              {isOpen.value ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </a>
          </span>
        )
        if (props.render) {
          return props.render(props.text, { mode: props.mode, ...props.fieldProps }, dom) ?? props.emptyText
        }
        return dom
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        const dom = (
          <InputPassword
            placeholder="???"
            {...props.fieldProps}
          />
        )
        if (props.formItemRender) {
          return props.formItemRender(props.text, { mode: props.mode, ...props.fieldProps }, dom)
        }
        return dom
      }

      return null
    }
  },
})
