import type { ButtonProps, FormInstance } from 'antdv-next'
import type { VNodeChild } from 'vue'
import { Button } from 'antdv-next'
import { defineComponent } from 'vue'
import { proTheme, useIntl } from '../../../provider'

export interface SearchConfig {
  resetText?: VNodeChild
  submitText?: VNodeChild
}

type ActionButtonProps = ButtonProps & { preventDefault?: boolean }

export interface SubmitterProps<T = Record<string, any>> {
  form?: FormInstance
  onSubmit?: (value?: T) => void
  onReset?: (value?: T) => void
  searchConfig?: SearchConfig
  submitButtonProps?: false | ActionButtonProps
  resetButtonProps?: false | ActionButtonProps
  render?:
    | ((
      props: SubmitterProps<T> & T & {
        submit: () => void
        reset: () => void
      },
      dom: VNodeChild[],
    ) => VNodeChild[] | VNodeChild | false)
    | false
}

function renderActionButton(
  buttonProps: ActionButtonProps,
  key: string,
  text: VNodeChild,
  onAction: () => void,
  extraProps?: ButtonProps,
) {
  const {
    preventDefault,
    onClick,
    fieldProps: _fieldProps,
    ...restButtonProps
  } = buttonProps as ActionButtonProps & { fieldProps?: unknown }

  return (
    <Button
      {...extraProps}
      {...restButtonProps}
      key={key}
      onClick={(e: MouseEvent) => {
        if (!preventDefault)
          onAction()
        onClick?.(e as any)
      }}
    >
      {text}
    </Button>
  )
}

const Submitter = defineComponent<SubmitterProps>({
  name: 'ProFormSubmitter',
  props: ['form', 'submitButtonProps', 'resetButtonProps', 'searchConfig', 'render', 'onSubmit', 'onReset'],
  setup(rawProps) {
    const props = rawProps
    const intl = useIntl()
    const { token } = proTheme.useToken()

    return () => {
      if (props.render === false)
        return null

      const {
        onSubmit,
        render,
        onReset,
        searchConfig = {},
        submitButtonProps,
        resetButtonProps,
      } = props

      const submit = () => {
        props.form?.submit?.()
        onSubmit?.()
      }

      const reset = () => {
        props.form?.resetFields?.()
        onReset?.()
      }

      const {
        submitText = intl.getMessage('tableForm.submit', '提交'),
        resetText = intl.getMessage('tableForm.reset', '重置'),
      } = searchConfig

      const dom: VNodeChild[] = []

      if (resetButtonProps !== false) {
        dom.push(
          renderActionButton(resetButtonProps ?? {}, 'rest', resetText, reset),
        )
      }

      if (submitButtonProps !== false) {
        dom.push(
          renderActionButton(
            submitButtonProps ?? {},
            'submit',
            submitText,
            submit,
            { type: 'primary' },
          ),
        )
      }

      const renderDom = render
        ? render({ ...props, submit, reset } as SubmitterProps<any> & { submit: () => void, reset: () => void }, dom)
        : dom

      if (!renderDom)
        return null

      if (Array.isArray(renderDom)) {
        if (renderDom.length < 1)
          return null
        if (renderDom.length === 1)
          return renderDom[0]
        return (
          <div
            style={{
              display: 'flex',
              gap: `${token.marginXS}px`,
              alignItems: 'center',
            }}
          >
            {renderDom}
          </div>
        )
      }

      return renderDom
    }
  },
})

export default Submitter
