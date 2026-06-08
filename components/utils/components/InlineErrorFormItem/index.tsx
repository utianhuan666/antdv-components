import type { FormItemProps, PopoverProps } from 'antdv-next'
import { LoadingOutlined } from '@antdv-next/icons'
import { clsx, get } from '@v-c/util'
import { FormItem, Popover } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import { cloneVNode, defineComponent, isVNode, ref, watch } from 'vue'
import { useStyle } from './style'

const AnyFormItem = FormItem as any

interface InlineErrorFormItemProps extends FormItemProps {
  errorType?: 'popover' | 'default'
  popoverProps?: PopoverProps
  children?: any
}

const FIX_INLINE_STYLE = {
  marginBlockStart: -5,
  marginBlockEnd: -5,
  marginInlineStart: 0,
  marginInlineEnd: 0,
}

interface InlineErrorFormItemPopoverProps {
  inputProps: FormItemProps & { errors?: any[], warnings?: any[] }
  input: any
  errorList: any
  extra: any
  popoverProps?: PopoverProps
}

const InlineErrorFormItemPopover = defineComponent<InlineErrorFormItemPopoverProps>({
  name: 'ProInlineErrorFormItemPopover',
  props: ['inputProps', 'input', 'errorList', 'extra', 'popoverProps'],
  setup(rawProps) {
    const props = rawProps
    const open = ref<boolean | undefined>(false)
    const messages = ref({ errors: [] as any[], warnings: [] as any[] })
    const config = useConfig()
    const formItemCls = config.value.getPrefixCls('form-item')
    const formItemWithHelpCls = `${formItemCls}-with-help`
    const { wrapSSR, hashId } = useStyle(formItemWithHelpCls)

    watch(
      () => [props.inputProps.errors, props.inputProps.warnings, props.inputProps.validateStatus],
      () => {
        if (props.inputProps.validateStatus !== 'validating') {
          messages.value = { errors: props.inputProps.errors ?? [], warnings: props.inputProps.warnings ?? [] }
          if ((messages.value.errors.length + messages.value.warnings.length) > 0)
            open.value = true
        }
      },
      { immediate: true },
    )

    return () => {
      const loading = props.inputProps.validateStatus === 'validating'
      const hasMessages = (messages.value.errors?.length ?? 0) + (messages.value.warnings?.length ?? 0) >= 1
      const content = (
        <div class={clsx(formItemCls, hashId)} style={{ margin: 0, padding: 0 }}>
          <div class={clsx(formItemWithHelpCls, hashId)}>
            {loading ? <LoadingOutlined /> : null}
            {hasMessages
              ? (
                  <>
                    {messages.value.errors?.map((error, index) => <div key={`error-${index}`} class="ant-form-item-explain-error">{error}</div>)}
                    {messages.value.warnings?.map((warning, index) => <div key={`warning-${index}`} class="ant-form-item-explain-warning">{warning}</div>)}
                  </>
                )
              : props.errorList}
          </div>
        </div>
      )
      return wrapSSR(
        <Popover
          open={!hasMessages ? false : open.value}
          onOpenChange={(next: boolean) => {
            if (next !== open.value)
              open.value = next
          }}
          trigger={props.popoverProps?.trigger || ['click']}
          placement={props.popoverProps?.placement || 'topLeft'}
          content={content}
          {...(props.popoverProps || {})}
        >
          <>
            {props.input}
            {props.extra}
          </>
        </Popover>,
      )
    }
  },
})

export const InlineErrorFormItem = defineComponent<InlineErrorFormItemProps>({
  name: 'ProInlineErrorFormItem',
  props: ['errorType', 'rules', 'name', 'popoverProps'],
  setup(rawProps, { attrs, slots }) {
    const props = rawProps
    const errors = ref<any[]>([])
    const warnings = ref<any[]>([])
    const validateStatus = ref<FormItemProps['validateStatus']>('')
    const shouldUpdate = props.name
      ? (prev: any, next: any) => {
          if (prev === next)
            return false
          const shouldName = [props.name].flat(1) as (string | number)[]
          if (shouldName.length > 1)
            shouldName.pop()
          try {
            return JSON.stringify(get(prev, shouldName)) !== JSON.stringify(get(next, shouldName))
          }
          catch {
            return true
          }
        }
      : undefined

    const getEventValue = (event: any) => {
      if (event?.target)
        return event.target.value
      return event
    }

    const validateValue = async (value: any) => {
      const nextErrors: any[] = []
      const nextWarnings: any[] = []
      const rules = props.rules ?? []
      validateStatus.value = 'validating'

      for (const rule of rules as any[]) {
        let message: any
        const empty = value === undefined || value === null || value === ''
          || (Array.isArray(value) && value.length === 0)

        if (rule.required && empty) {
          message = rule.message
        }
        else if (rule.min !== undefined && String(value ?? '').length < rule.min) {
          message = rule.message
        }
        else if (rule.pattern && !rule.pattern.test(String(value ?? ''))) {
          message = rule.message
        }
        else if (rule.validator) {
          try {
            await rule.validator(rule, value)
          }
          catch (error: any) {
            message = error?.message ?? rule.message ?? error
          }
        }

        if (message) {
          if (rule.warningOnly)
            nextWarnings.push(message)
          else
            nextErrors.push(message)
        }
      }

      errors.value = nextErrors
      warnings.value = nextWarnings
      validateStatus.value = nextErrors.length ? 'error' : nextWarnings.length ? 'warning' : ''
    }

    const renderInput = () => {
      const children = slots.default?.() ?? []
      return children.map((child) => {
        if (!isVNode(child))
          return child
        return cloneVNode(child, {
          onInput: (event: Event) => validateValue(getEventValue(event)),
          onChange: (event: Event) => validateValue(getEventValue(event)),
        })
      })
    }

    return () => (
      <AnyFormItem
        {...attrs}
        shouldUpdate={shouldUpdate as any}
        style={{ ...FIX_INLINE_STYLE, ...((attrs as any).style || {}) }}
      >
        {props.name && props.rules?.length && props.errorType === 'popover'
          ? (
              <InlineErrorFormItemPopover
                inputProps={{
                  errors: errors.value,
                  warnings: warnings.value,
                  validateStatus: validateStatus.value,
                } as any}
                popoverProps={props.popoverProps}
                input={(
                  <AnyFormItem
                    noStyle
                    rules={props.rules}
                    name={props.name as any}
                  >
                    {renderInput()}
                  </AnyFormItem>
                )}
                extra={slots.extra?.()}
                errorList={null}
              />
            )
          : (
              <AnyFormItem
                noStyle
                rules={props.rules}
                name={props.name as any}
              >
                {slots.default?.()}
              </AnyFormItem>
            )}
      </AnyFormItem>
    )
  },
})

export { InlineErrorFormItemPopover }
export default InlineErrorFormItem
