import type { CSSProperties } from 'vue'
import type { ProFieldFC } from '../../types'

type FieldCodeReadProps = NonNullable<ProFieldFC<{
  text: string
  language?: 'json' | 'text'
}>['__props']> & {
  code: string
}

export function FieldCodeRead(props: FieldCodeReadProps) {
  const { code, mode, render, fieldProps } = props
  const dom = (
    <pre
      {...fieldProps}
      style={{
        padding: 16,
        overflow: 'auto',
        fontSize: '85%',
        lineHeight: 1.45,
        color: 'rgba(0, 0, 0, 0.45)',
        fontFamily: 'SFMono-Regular, Consolas, \'Liberation Mono\', Menlo, Courier, monospace',
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        borderRadius: 3,
        width: 'min-content',
        ...(fieldProps?.style as CSSProperties),
      }}
    >
      <code>{code}</code>
    </pre>
  )

  if (render)
    return render(code, { mode, ...fieldProps }, dom)

  return dom
}

export default FieldCodeRead
