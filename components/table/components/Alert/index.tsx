import type { VNodeChild } from 'vue'
import type { IntlType } from '../../../provider'
import type { Key } from '../../typing'
import { clsx } from '@v-c/util'
import { Space } from 'antdv-next'
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

function defaultAlertOptionRender(props: {
  intl: IntlType
  onCleanSelected: () => void
}) {
  const { intl, onCleanSelected } = props
  return [
    <a onClick={onCleanSelected} key="0">
      {intl.getMessage('alert.clear', '清空')}
    </a>,
  ]
}

/** 提到模块顶层，避免每次渲染重建函数 */
const defaultAlertInfoRender: AlertRenderType<any> = ({
  intl,
  selectedRowKeys,
}) => (
  <Space>
    {intl.getMessage('alert.selected', '已选择')}
    {selectedRowKeys.length}
    {intl.getMessage('alert.item', '项')}
    &nbsp;&nbsp;
  </Space>
)

const TableAlert = defineComponent({
  name: 'TableAlert',
  props: {
    selectedRowKeys: { type: Array as () => (number | string | Key)[], default: () => [] },
    selectedRows: { type: Array as () => any[], default: () => [] },
    alwaysShowAlert: { type: Boolean, default: undefined },
    alertInfoRender: { type: [Function, Boolean] as any, default: () => defaultAlertInfoRender },
    onCleanSelected: { type: Function as () => () => void, default: undefined },
    alertOptionRender: { type: [Function, Boolean] as any, default: () => defaultAlertOptionRender },
  },
  setup(props) {
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
