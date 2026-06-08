import type { TableColumnType } from 'antdv-next'
import type { Ref, VNodeChild } from 'vue'
import type { IntlType } from '../../../provider'
import type { LabelTooltipType } from '../../../utils'
import type {
  ActionType,
  Key,
  OptionSearchProps,
  ProTableProps,
} from '../../typing'
import type { ListToolBarProps } from '../ListToolBar'
import { ReloadOutlined } from '@antdv-next/icons'
import { Tooltip } from 'antdv-next'
import { defineComponent, watch } from 'vue'
import { useIntl } from '../../../provider'
import { omitUndefined } from '../../../utils'
import { useTableContext } from '../../Store/Provide'
import ColumnSetting from '../ColumnSetting'
import ListToolBar from '../ListToolBar'
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
export interface OptionConfig {
  density?: boolean
  fullScreen?: OptionsType
  reload?: OptionsType
  setting?: boolean | SettingOptionType
  search?: (OptionSearchProps & { name?: string }) | boolean
  reloadIcon?: VNodeChild
  densityIcon?: VNodeChild
}

export type OptionsFunctionType = (
  e: MouseEvent,
  action?: ActionType,
) => void

export type OptionsType = OptionsFunctionType | boolean

export interface ToolBarProps<T = unknown> {
  headerTitle?: VNodeChild
  tooltip?: string | LabelTooltipType
  toolbar?: ListToolBarProps
  toolBarRender?: (
    action: ActionType | undefined,
    rows: {
      selectedRowKeys?: (string | number)[]
      selectedRows?: T[]
    },
  ) => VNodeChild[]
  action: Ref<ActionType | undefined>
  options?: OptionConfig | false
  optionsRender?: ToolbarRenderProps<T>['optionsRender']
  selectedRowKeys?: (string | number)[]
  selectedRows?: T[]
  className?: string
  onSearch?: (keyWords: string) => void
  columns: (TableColumnType<T> & { index?: number })[]
}

function getButtonText(
  {
    intl,
  }: OptionConfig & {
    intl: IntlType
  },
  options: OptionConfig,
) {
  return {
    reload: {
      text: intl.getMessage('tableToolBar.reload', '刷新'),
      icon: options.reloadIcon ?? <ReloadOutlined />,
    },
    density: {
      text: intl.getMessage('tableToolBar.density', '表格密度'),
      icon: <DensityIcon icon={options.densityIcon} />,
    },
    fullScreen: {
      text: intl.getMessage('tableToolBar.fullScreen', '全屏'),
      icon: <FullScreenIcon />,
    },
  }
}

/**
 * 渲染默认的 工具栏
 */
function renderDefaultOption<T>(
  options: OptionConfig,
  defaultOptions: OptionConfig & {
    intl: IntlType
  },
  actions: Ref<ActionType | undefined>,
  columns: (TableColumnType<T> & { index?: number })[],
): VNodeChild[] {
  return Object.keys(options)
    .filter(item => item)
    .map((key) => {
      const value = options[key as 'fullScreen']
      if (!value)
        return null

      let onClick
        = value === true
          ? defaultOptions[key as keyof OptionConfig]
          : (event: any) => {
              value?.(event, actions.value)
            }

      if (typeof onClick !== 'function')
        onClick = () => {}

      if (key === 'setting') {
        return (
          <ColumnSetting
            {...(options[key] as SettingOptionType)}
            columns={columns}
            key={key}
          />
        )
      }
      if (key === 'fullScreen') {
        return (
          <span key={key} onClick={onClick as any}>
            <FullScreenIcon />
          </span>
        )
      }
      const optionItem = getButtonText(defaultOptions, options)[
        key as 'fullScreen'
      ]
      if (optionItem) {
        return (
          <span key={key} onClick={onClick as any}>
            <Tooltip title={optionItem.text}>{optionItem.icon}</Tooltip>
          </span>
        )
      }
      return null
    })
    .filter(item => item) as VNodeChild[]
}

const ToolBar = defineComponent<ToolBarProps<any>>({
  name: 'ToolBar',
  props: ['headerTitle', 'tooltip', 'toolBarRender', 'action', 'options', 'selectedRowKeys', 'selectedRows', 'toolbar', 'onSearch', 'columns', 'optionsRender', 'className'],
  setup(rawProps) {
    const props = rawProps
    const counter = useTableContext()
    const intl = useIntl()

    watch(
      () => counter.keyWords,
      () => {
        if (counter.keyWords === undefined)
          props.onSearch?.('')
      },
    )

    return () => {
      const {
        headerTitle,
        tooltip,
        toolBarRender,
        action,
        options: propsOptions,
        selectedRowKeys,
        selectedRows,
        toolbar,
        onSearch,
        columns,
        optionsRender,
        ...rest
      } = props

      const defaultOptions = {
        reload: () => action?.value?.reload(),
        density: true,
        setting: true,
        search: false,
        fullScreen: () => action?.value?.fullScreen?.(),
      }

      let optionDom: VNodeChild[]
      if (propsOptions === false) {
        optionDom = []
      }
      else {
        const options = { ...defaultOptions, fullScreen: false, ...propsOptions }
        const settings = renderDefaultOption<any>(
          options,
          { ...defaultOptions, intl },
          action,
          columns,
        )
        optionDom = optionsRender
          ? optionsRender(
              {
                headerTitle,
                tooltip,
                toolBarRender,
                action,
                options: propsOptions,
                selectedRowKeys,
                selectedRows,
                toolbar,
                onSearch,
                columns,
                optionsRender,
                ...rest,
              } as ToolBarProps<any>,
              settings,
            )
          : settings
      }
      // 操作列表
      const actions = toolBarRender
        ? toolBarRender(action?.value, { selectedRowKeys, selectedRows })
        : []

      let searchConfig: any = false
      if (propsOptions && propsOptions.search) {
        /** 受控的value 和 onChange */
        const defaultSearchConfig = {
          value: counter.keyWords,
          onChange: (e: any) => counter.setKeyWords(e.target.value),
        }
        searchConfig
          = propsOptions.search === true
            ? defaultSearchConfig
            : { ...defaultSearchConfig, ...propsOptions.search }
      }

      return (
        <ListToolBar
          title={headerTitle}
          tooltip={tooltip}
          search={searchConfig}
          onSearch={onSearch}
          actions={actions}
          settings={optionDom}
          {...toolbar}
        />
      )
    }
  },
})

export interface ToolbarRenderProps<T> {
  hideToolbar: boolean
  onFormSearchSubmit: (params: any) => void
  searchNode: VNodeChild
  tableColumn: any[]
  tooltip?: string | LabelTooltipType
  selectedRows: T[]
  selectedRowKeys: Key[] | (string | number)[]
  headerTitle: VNodeChild
  toolbar: ProTableProps<T, any, any>['toolbar']
  options: ProTableProps<T, any, any>['options']
  optionsRender?: (
    props: ToolBarProps<T>,
    defaultDom: VNodeChild[],
  ) => VNodeChild[]
  toolBarRender?: ToolBarProps<T>['toolBarRender']
  actionRef: Ref<ActionType | undefined>
}

/** 这里负责与table交互 */
const ToolbarRender = defineComponent<ToolbarRenderProps<any>>({
  name: 'ToolbarRender',
  props: ['hideToolbar', 'onFormSearchSubmit', 'searchNode', 'tableColumn', 'tooltip', 'selectedRows', 'selectedRowKeys', 'headerTitle', 'toolbar', 'options', 'optionsRender', 'toolBarRender', 'actionRef'],
  setup(rawProps) {
    const props = rawProps
    const onSearch = (keyword: string) => {
      const { options, onFormSearchSubmit, actionRef } = props
      if (!options || !options.search)
        return

      const { name = 'keyword' }
        = options.search === true ? {} : options.search

      /** 如果传入的 onSearch 返回值为 false，应该直接拦截请求 */
      const success = (options.search as OptionSearchProps)?.onSearch?.(keyword)

      if (success === false)
        return

      // 查询的时候的回到第一页
      actionRef?.value?.setPageInfo?.({
        current: 1,
      })

      onFormSearchSubmit(
        omitUndefined({
          _timestamp: Date.now(),
          [name]: keyword,
        }),
      )
    }

    return () => {
      const {
        hideToolbar,
        tableColumn,
        options,
        searchNode,
        tooltip,
        toolbar,
        selectedRows,
        selectedRowKeys,
        headerTitle,
        actionRef,
        toolBarRender,
        optionsRender,
      } = props

      // 不展示 toolbar
      if (hideToolbar)
        return null

      return (
        <ToolBar
          tooltip={tooltip}
          columns={tableColumn}
          options={options}
          headerTitle={headerTitle}
          action={actionRef}
          onSearch={onSearch}
          selectedRows={selectedRows}
          selectedRowKeys={selectedRowKeys as (string | number)[]}
          toolBarRender={toolBarRender}
          toolbar={{
            filter: searchNode,
            ...toolbar,
          }}
          optionsRender={optionsRender}
        />
      )
    }
  },
})

export default ToolbarRender
export { ToolBar, ToolbarRender }
