import type { TreeSelectProps } from 'antdv-next'
import { ProField } from '@antdv/components'

export interface TreeSelectDemoProps extends TreeSelectProps<any> {
  request?: (...args: any[]) => any
}

export function TreeSelectDemo(props: TreeSelectDemoProps) {
  const { request, value, ...fieldProps } = props

  return (
    <ProField
      fieldProps={{
        fieldNames: {
          label: 'title',
        },
        allowClear: true,
        showSearch: true,
        labelInValue: true,
        multiple: true,
        autoClearSearchValue: true,
        treeNodeFilterProp: 'title',
        filterTreeNode: true,
        open: true,
        suffixIcon: null,
        ...fieldProps,
      }}
      value={value}
      mode="edit"
      valueType="treeSelect"
      request={async () => {
        request?.()
        await new Promise(resolve => setTimeout(resolve, 100))
        return [
          {
            title: 'Node1',
            value: '0-0',
            children: [
              {
                title: 'Child Node1',
                value: '0-0-0',
              },
            ],
          },
          {
            title: 'Node2',
            value: '0-1',
            children: [
              {
                title: 'Child Node3',
                value: '0-1-0',
              },
              {
                title: 'Child Node4',
                value: '0-1-1',
              },
              {
                title: 'Child Node5',
                value: '0-1-2',
              },
            ],
          },
        ]
      }}
    />
  )
}

export default TreeSelectDemo
