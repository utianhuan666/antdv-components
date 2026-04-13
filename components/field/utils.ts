// ---------------------------------------------------------------------------
// omitUndefined – remove keys whose value is `undefined`
// ---------------------------------------------------------------------------

type OmitUndefined<T> = { [P in keyof T]: NonNullable<T[P]> }

export function omitUndefined<T extends Record<string, any>>(
  obj: T,
): OmitUndefined<T> {
  const result = {} as Record<string, any> as T
  if (!obj)
    return result
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      ;(result as any)[key] = obj[key]
    }
  }
  if (Object.keys(result as Record<string, any>).length < 1) {
    return undefined as any
  }
  return result as OmitUndefined<T>
}

// ---------------------------------------------------------------------------
// pickProProps – strip internal pro-field / pro-form props so only
// user-facing props are forwarded to the underlying antdv component.
//
// When `customValueType` is true (i.e. the valueType was registered by the
// user in ProConfigProvider.valueTypeMap), *all* props are kept because the
// custom renderer decides what to consume.
// ---------------------------------------------------------------------------

const PRO_FIELD_PROPS = `valueType request formItemRender render text formItemProps valueEnum`
const PRO_FORM_PROPS = `fieldProps isDefaultDom groupProps contentRender submitterProps submitter`
const INTERNAL_PROP_SET = new Set(
  `${PRO_FIELD_PROPS} ${PRO_FORM_PROPS}`.split(/[\s\n]+/),
)

export function pickProProps(
  props: Record<string, any>,
  customValueType = false,
): Record<string, any> {
  if (customValueType)
    return { ...props }

  const attrs: Record<string, any> = {}
  for (const key of Object.keys(props || {})) {
    if (INTERNAL_PROP_SET.has(key))
      continue
    attrs[key] = props[key]
  }
  return attrs
}
