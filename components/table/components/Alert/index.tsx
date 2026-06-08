import type { VNodeChild } from 'vue'
import type { IntlType } from '../../../provider'
import type { Key } from '../../typing'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useStyle } from './style'

export type AlertRenderType<T>
  = | ((props: {
    intl: IntlType
    selectedRowKeys: (number | string | Key)[]
    selectedRows: T[]
    onCleanSelected: () => void
  }) => VNodeChild)
  | false

export interface TableAlertProps<T> {
  selectedRowKeys: (number | string | Key)[]
  selectedRows: T[]
  alwaysShowAlert?: boolean
  alertInfoRender?: AlertRenderType<T>
  onCleanSelected: () => void
  alertOptionRender?: AlertRenderType<T>
}

const TableAlert = defineComponent<TableAlertProps<any>>({
  name: 'TableAlert',
  props: ['selectedRowKeys', 'selectedRows', 'alwaysShowAlert', 'alertInfoRender', 'onCleanSelected', 'alertOptionRender'],
  setup(rawProps) {
    const props = rawProps
    const intl = useIntl()
    const prefixCls = useProPrefixCls('pro-table-alert')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)

    return () => {
      const {
        selectedRowKeys,
        selectedRows,
        alwaysShowAlert,
        onCleanSelected,
        alertInfoRender,
        alertOptionRender,
      } = props

      const option
        = alertOptionRender
          && (alertOptionRender as Exclude<AlertRenderType<any>, false>)({
            onCleanSelected: onCleanSelected as () => void,
            selectedRowKeys,
            selectedRows,
            intl,
          })

      const className = prefixCls.value

      if (alertInfoRender === false)
        return null

      const dom = (alertInfoRender as Exclude<AlertRenderType<any>, false>)({
        intl,
        selectedRowKeys,
        selectedRows,
        onCleanSelected: onCleanSelected as () => void,
      })

      if (dom === false || (selectedRowKeys.length < 1 && !alwaysShowAlert))
        return null

      return wrapSSR(
        <div class={clsx(className, hashId)}>
          <div class={clsx(`${className}-container`, hashId)}>
            <div class={clsx(`${className}-info`, hashId)}>
              <div class={clsx(`${className}-info-content`, hashId)}>{dom as VNodeChild}</div>
              {option
                ? (
                    <div class={clsx(`${className}-info-option`, hashId)}>
                      {option as VNodeChild}
                    </div>
                  )
                : null}
            </div>
          </div>
        </div>,
      )
    }
  },
})

export default TableAlert
