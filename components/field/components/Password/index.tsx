import type { PropType, VNodeChild } from 'vue'
import type { ProFieldFCMode } from '../../internal/fieldMode'
import { computed, defineComponent, ref } from 'vue'
import { isProFieldEditOrUpdateMode, isProFieldReadMode } from '../../internal/fieldMode'
import FieldPasswordEdit from './FieldPasswordEdit'
import FieldPasswordRead from './FieldPasswordRead'

export default defineComponent({
  name: 'FieldPassword',
  props: {
    text: { type: [String, Number] as PropType<string | number>, default: '' },
    mode: { type: String as PropType<ProFieldFCMode>, default: 'read' },
    render: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    formItemRender: { type: Function as PropType<(text: any, props: Record<string, any>, dom: any) => any>, default: undefined },
    fieldProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    emptyText: { type: [String, Object, Boolean, Number] as PropType<VNodeChild>, default: '-' },
    open: { type: Boolean, default: undefined },
    onOpenChange: { type: Function as PropType<(open: boolean) => void>, default: undefined },
  },
  setup(props) {
    const openRef = ref(false)
    const isOpen = computed(() => props.open ?? openRef.value)

    const setOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof updater === 'function' ? updater(isOpen.value) : updater
      if (props.open === undefined)
        openRef.value = next
      props.onOpenChange?.(next)
    }

    return () => {
      if (isProFieldReadMode(props.mode)) {
        return (
          <FieldPasswordRead
            text={props.text}
            mode={props.mode}
            render={props.render}
            fieldProps={props.fieldProps}
            open={isOpen.value}
            setOpen={setOpen}
          />
        )
      }

      if (isProFieldEditOrUpdateMode(props.mode)) {
        return (
          <FieldPasswordEdit
            text={props.text}
            mode={props.mode}
            formItemRender={props.formItemRender}
            fieldProps={props.fieldProps}
          />
        )
      }

      return null
    }
  },
})
