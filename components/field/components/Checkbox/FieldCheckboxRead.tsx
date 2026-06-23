import type { ProSchemaValueEnumMap } from '../../../utils/typing'
import type { ProFieldFC } from '../../types'
import type { GroupProps } from './types'
import { proTheme } from '../../../provider'
import { objectToMap, proFieldParsingText } from '../../../utils'

type Props = NonNullable<ProFieldFC<GroupProps>['__props']> & {
  optionsValueEnum: ProSchemaValueEnumMap | undefined
}

export function FieldCheckboxRead(props: Props) {
  const { mode, render, optionsValueEnum, ...rest } = props
  const { token } = proTheme.useToken?.() || { token: { marginSM: 8 } }

  const dom = proFieldParsingText(
    rest.text as Parameters<typeof proFieldParsingText>[0],
    objectToMap(rest.valueEnum || optionsValueEnum),
  )

  if (render)
    return render(rest.text, { mode, ...rest.fieldProps }, <>{dom}</>) ?? null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: `${token.value?.marginSM ?? 8}px` }}>
      {dom}
    </div>
  )
}

export default FieldCheckboxRead
