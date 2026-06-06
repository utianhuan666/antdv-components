import type { DefineComponent } from 'vue'
import type { ProFormListContainerProps } from './typing'
import { PlusOutlined } from '@antdv-next/icons'
import { Button } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { useEditOrReadOnly } from '../../BaseForm/EditOrReadOnlyContext'
import { ProFormListItem } from './ListItem'

const proFormListContainerPropNames = [
  'name',
  'originName',
  'listName',
  'fields',
  'action',
  'readonly',
  'creatorRecord',
  'creatorButtonProps',
  'creatorButtonText',
  'copyIconProps',
  'deleteIconProps',
  'upIconProps',
  'downIconProps',
  'actionGuard',
  'actionRender',
  'itemRender',
  'itemContainerRender',
  'fieldExtraRender',
  'alwaysShowItemLabel',
  'min',
  'max',
  'arrowSort',
  'containerClassName',
  'containerStyle',
] as const

function normalizeBooleanProp(value: unknown, defaultValue = false) {
  if (value === '')
    return true
  return typeof value === 'boolean' ? value : defaultValue
}

const ProFormListContainer = defineComponent({
  name: 'ProFormListContainer',
  props: [...proFormListContainerPropNames],
  setup(rawProps, { slots }) {
    const props = rawProps as unknown as ProFormListContainerProps
    const prefixCls = useProPrefixCls('pro-form-list')
    const editContext = useEditOrReadOnly()
    const isReadMode = computed(() => normalizeBooleanProp(props.readonly) || editContext.readonly || editContext.mode === 'read')

    function renderCreatorButton(position: 'top' | 'bottom') {
      if (props.creatorButtonProps === false || isReadMode.value)
        return null
      if (props.max !== undefined && props.fields.length >= props.max)
        return null

      const creatorButtonProps = props.creatorButtonProps || {}
      const buttonPosition = creatorButtonProps.position || 'bottom'
      if (buttonPosition !== position)
        return null

      const index = position === 'top' ? 0 : props.fields.length
      return (
        <Button
          class={`${prefixCls.value}-creator-button-${position}`}
          type={creatorButtonProps.type || 'dashed'}
          block={creatorButtonProps.block ?? true}
          style={creatorButtonProps.style}
          onClick={() => props.action.add(undefined, index)}
        >
          {creatorButtonProps.icon === false ? null : creatorButtonProps.icon || <PlusOutlined />}
          {creatorButtonProps.creatorButtonText || props.creatorButtonText || '添加一行数据'}
        </Button>
      )
    }

    return () => (
      <div style={{ width: 'max-content', maxWidth: '100%', minWidth: '100%', ...(props.containerStyle || {}) }} class={props.containerClassName}>
        {renderCreatorButton('top')}
        {props.fields.map((field, index) => (
          <ProFormListItem
            key={field.key}
            field={field}
            index={index}
            record={field.record}
            fields={props.fields}
            count={props.fields.length}
            name={props.name as any}
            originName={props.originName as any}
            listName={props.listName(index)}
            action={props.action}
            readonly={normalizeBooleanProp(props.readonly)}
            copyIconProps={props.copyIconProps}
            deleteIconProps={props.deleteIconProps}
            upIconProps={props.upIconProps}
            downIconProps={props.downIconProps}
            arrowSort={normalizeBooleanProp(props.arrowSort)}
            actionRender={props.actionRender}
            itemRender={props.itemRender}
            itemContainerRender={props.itemContainerRender}
            alwaysShowItemLabel={normalizeBooleanProp(props.alwaysShowItemLabel)}
            min={props.min}
            max={props.max}
            containerClassName={props.containerClassName}
            containerStyle={props.containerStyle}
          >
            {{
              default: (slotProps: Record<string, any>) => slots.default?.(slotProps),
            }}
          </ProFormListItem>
        ))}
        {props.fieldExtraRender?.(props.action, { errors: [], warnings: [] })}
        {renderCreatorButton('bottom')}
      </div>
    )
  },
}) as unknown as DefineComponent<ProFormListContainerProps>

export { ProFormListContainer }
