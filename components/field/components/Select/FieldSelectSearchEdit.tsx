import type { ProFieldFC } from '../../types'
import type { FieldSelectProps, RequestOptionsType } from './types'
import { Spin } from 'antdv-next'
import SearchSelect from './SearchSelect'

const SearchSelectComponent = SearchSelect as any

export type FieldSelectFullProps = FieldSelectProps

export type FieldSelectSearchEditProps = NonNullable<ProFieldFC<FieldSelectFullProps>['__props']> & {
  intl: {
    getMessage: (id: string, defaultMessage: string) => string
  }
  loading: boolean
  options: RequestOptionsType[]
  fetchData: (keyWord?: string) => void
  resetData: () => void
  inputRef: any
}

export function FieldSelectSearchEdit(props: FieldSelectSearchEditProps) {
  const {
    mode,
    formItemRender,
    fieldProps,
    id,
    label,
    intl,
    loading,
    options,
    fetchData,
    resetData,
    inputRef,
    ...rest
  } = props

  const dom = (
    <SearchSelectComponent
      key="SearchSelect"
      ref={inputRef}
      id={id}
      className={rest.className}
      style={{ minWidth: 100, ...(rest.style || {}) }}
      loading={loading}
      allowClear
      defaultSearchValue={props.defaultKeyWords}
      notFoundContent={loading ? <Spin size="small" /> : fieldProps?.notFoundContent}
      fetchData={fetchData}
      resetData={resetData}
      placeholder={intl.getMessage('tableForm.selectPlaceholder', '请选择')}
      label={label}
      {...fieldProps}
      options={options}
    />
  )

  if (formItemRender) {
    return formItemRender(
      rest.text,
      { mode, ...fieldProps, options, loading },
      dom,
    ) ?? null
  }
  return dom
}

export default FieldSelectSearchEdit
