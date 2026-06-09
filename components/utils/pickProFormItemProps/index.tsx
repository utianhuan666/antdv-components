const antdFormItemPropsList = [
  'colon',
  'dependencies',
  'extra',
  'getValueFromEvent',
  'getValueProps',
  'hasFeedback',
  'help',
  'htmlFor',
  'initialValue',
  'noStyle',
  'label',
  'labelAlign',
  'labelCol',
  'name',
  'preserve',
  'normalize',
  'required',
  'rules',
  'shouldUpdate',
  'trigger',
  'validateFirst',
  'validateStatus',
  'validateTrigger',
  'valuePropName',
  'wrapperCol',
  'hidden',
  'validateDebounce',
  'addonBefore',
  'addonAfter',
  'addonWarpStyle',
]

export function pickProFormItemProps(props: Record<string, any>) {
  const attrs = {} as Record<string, any>
  antdFormItemPropsList.forEach((key) => {
    if (props?.[key] !== undefined)
      attrs[key] = props[key]
  })
  return attrs
}
