import type { VNodeChild } from 'vue'
import type { LabelTooltipType } from '../../../utils'
import type { ActionType, OptionSearchProps } from '../../typing'
import { ReloadOutlined } from '@antdv-next/icons'
import { Input, Tooltip } from 'antdv-next'
import { defineComponent, watch } from 'vue'
import { useIntl } from '../../../provider'
import { omitUndefined } from '../../../utils'
import { useTableContext } from '../../Store/Provide'
import ColumnSetting from '../ColumnSetting'
import DensityIcon from './DensityIcon'
import FullScreenIcon from './FullscreenIcon'

export interface SettingOptionType {
  draggable?: boolean
  checkable?: boolean
  showListItemOption?: boolean
  checkedReset?: boolean
  listsHeight?: number
  extra?: VNodeChild
  children?: VNodeChild
  settingIcon?: VNodeChild
}

export type OptionsFunctionType = (
  e: MouseEvent,
  action?: ActionType,
) => void

export type OptionsType = OptionsFunctionType | boolean

export interface OptionConfig {
  density?: boolean
  fullScreen?: OptionsType
  reload?: OptionsType
  setting?: boolean | SettingOptionType
  search?: (OptionSearchProps & { name?: string }) | boolean
  reloadIcon?: VNodeChild
  densityIcon?: VNodeChild
}

export interface ToolBarProps<T = unknown> {
  headerTitle?: VNodeChild
  tooltip?: string | LabelTooltipType
  toolBarRender?: (
    action: ActionType | undefined,
    rows: {
      selectedRowKeys?: (string | number)[]
      selectedRows?: T[]
    },
  ) => VNodeChild[]
  actionRef?: any
  options?: OptionConfig | false
  optionsRender?: (props: any, defaultDom: VNodeChild[]) => VNodeChild[]
  selectedRowKeys?: (string | number)[]
  selectedRows?: T[]
  tableColumn?: any[]
  columns?: any[]
  setFormSearch?: (value: any) => void
  onSearch?: (keyWords: string) => void
}

function getAction(actionRef: any): ActionType | undefined {
  return actionRef?.value || actionRef?.current
}

export default defineComponent({
  name: 'ProTableToolbarOptions',
  props: [
    'options',
    'optionsRender',
    'actionRef',
    'tableColumn',
    'columns',
    'selectedRows',
    'selectedRowKeys',
    'setFormSearch',
    'onSearch',
  ],
  setup(props) {
    const intl = useIntl()
    const counter = useTableContext()

    function submitToolbarSearch(keyword: string, searchConfig: any) {
      const name = searchConfig.name || 'keyword'
      const success = searchConfig.onSearch?.(keyword)
      if (success === false)
        return

      getAction(props.actionRef)?.setPageInfo?.({ current: 1 })
      counter?.setKeyWords(keyword)
      props.setFormSearch?.((old: any) => omitUndefined({
        ...(old || {}),
        _timestamp: Date.now(),
        [name]: keyword,
      }))
      props.onSearch?.(keyword)
    }

    watch(() => counter?.keyWords.value, (value) => {
      if (value === undefined)
        props.onSearch?.('')
    })

    return () => {
      if (props.options === false)
        return null

      const defaultOptions: OptionConfig = {
        reload: true,
        density: true,
        setting: true,
        search: false,
        fullScreen: false,
      }
      const options = {
        ...defaultOptions,
        ...(props.options === true || props.options === undefined ? {} : props.options),
      } as OptionConfig
      const action = getAction(props.actionRef)
      const dom: VNodeChild[] = []

      if (options.search) {
        const searchConfig = options.search === true ? {} : options.search
        dom.push(
          <Input.Search
            key="search"
            allowClear
            value={counter?.keyWords.value}
            {...searchConfig}
            onChange={(event: any) => counter?.setKeyWords(event?.target?.value)}
            onSearch={(value: string) => submitToolbarSearch(value, searchConfig)}
          />,
        )
      }

      if (options.reload) {
        const onClick = options.reload === true
          ? () => action?.reload?.()
          : (event: MouseEvent) => (options.reload as OptionsFunctionType)?.(event, action)
        dom.push(
          <span key="reload" onClick={onClick}>
            <Tooltip title={intl.getMessage('tableToolBar.reload', '刷新')}>
              {options.reloadIcon || <ReloadOutlined />}
            </Tooltip>
          </span>,
        )
      }

      if (options.density) {
        dom.push(<DensityIcon key="density" icon={options.densityIcon} />)
      }

      if (options.fullScreen) {
        const onClick = options.fullScreen === true
          ? () => action?.fullScreen?.()
          : (event: MouseEvent) => (options.fullScreen as OptionsFunctionType)?.(event, action)
        dom.push(
          <span key="fullScreen" onClick={onClick}>
            <FullScreenIcon />
          </span>,
        )
      }

      if (options.setting) {
        const settingProps = options.setting === true ? {} : options.setting
        dom.push(
          <ColumnSetting
            key="setting"
            {...settingProps}
            columns={props.tableColumn || props.columns || []}
          />,
        )
      }

      const finalDom = props.optionsRender ? props.optionsRender(props, dom) : dom
      return finalDom?.length ? finalDom : null
    }
  },
})
