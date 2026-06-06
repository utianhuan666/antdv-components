import type { VNodeChild } from 'vue'
import type { IntlType } from '../../../provider'
import { Space } from 'antdv-next'
import { defineComponent } from 'vue'
import { useIntl } from '../../../provider'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import useStyle from './style'

export type AlertRenderType<T = any> = false | ((
  props: {
    intl: IntlType
    selectedRowKeys: (string | number)[]
    selectedRows: T[]
    onCleanSelected: () => void
  },
) => VNodeChild)

function defaultAlertOptionRender({
  intl,
  onCleanSelected,
}: {
  intl: IntlType
  onCleanSelected: () => void
}) {
  return [
    <a onClick={onCleanSelected} key="0">
      {intl.getMessage('alert.clear', '清空')}
    </a>,
  ]
}

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

export default defineComponent({
  name: 'ProTableAlert',
  props: [
    'selectedRowKeys',
    'selectedRows',
    'onCleanSelected',
    'alertOptionRender',
    'alertInfoRender',
    'alwaysShowAlert',
  ],
  setup(props) {
    const intl = useIntl()
    const prefixCls = useProPrefixCls('pro-table-alert')
    const { wrapSSR, hashId } = useStyle(prefixCls.value)
    const cls = (name: string) => [name, hashId].filter(Boolean).join(' ')

    return () => {
      const keys = (props.selectedRowKeys || []) as (string | number)[]
      const rows = (props.selectedRows || []) as any[]
      if ((props.alertInfoRender as any) === false)
        return null
      const onCleanSelected = () => (props.onCleanSelected as any)?.()
      const renderProps = {
        intl,
        selectedRowKeys: keys,
        selectedRows: rows,
        onCleanSelected,
      }
      const info = props.alertInfoRender
        ? (props.alertInfoRender as any)(renderProps)
        : (defaultAlertInfoRender as any)(renderProps)

      if (info === false || (!props.alwaysShowAlert && keys.length < 1))
        return null

      const option = (props.alertOptionRender as any) === false
        ? null
        : props.alertOptionRender
          ? (props.alertOptionRender as any)(renderProps)
          : defaultAlertOptionRender({ intl, onCleanSelected })

      return wrapSSR(
        <div class={cls(prefixCls.value)}>
          <div class={cls(`${prefixCls.value}-container`)}>
            <div class={cls(`${prefixCls.value}-info`)}>
              <div class={cls(`${prefixCls.value}-info-content`)}>
                {info}
              </div>
              {option
                ? (
                    <div class={cls(`${prefixCls.value}-info-option`)}>
                      {option}
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
