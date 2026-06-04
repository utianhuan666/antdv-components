import type { PropType } from 'vue'
import type { FormListActionType, FormListActionGuard, IconConfig, ProFormListCommonProps } from './typing'
import { PlusOutlined } from '@antdv-next/icons'
import { Button } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { useEditOrReadOnly } from '../../BaseForm/EditOrReadOnlyContext'
import { ProFormListItem } from './ListItem'

const ProFormListContainer = defineComponent({
  name: 'ProFormListContainer',
  props: {
    name: { type: [String, Number, Array], required: true },
    originName: { type: [String, Number, Array], required: true },
    listName: { type: Function as PropType<(index: number) => (string | number)[]>, required: true },
    fields: { type: Array as PropType<{ name: number, key: number, record: Record<string, any> }[]>, required: true },
    action: { type: Object as PropType<FormListActionType>, required: true },
    readonly: { type: Boolean, default: false },
    creatorRecord: { type: [Object, Function] as PropType<Record<string, any> | (() => Record<string, any>)>, default: undefined },
    creatorButtonProps: { type: [Object, Boolean] as PropType<ProFormListCommonProps['creatorButtonProps']>, default: () => ({}) },
    creatorButtonText: { type: String, default: undefined },
    copyIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: undefined },
    deleteIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: undefined },
    upIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: undefined },
    downIconProps: { type: [Object, Boolean] as PropType<IconConfig | false>, default: undefined },
    actionGuard: { type: Object as PropType<FormListActionGuard>, default: undefined },
    actionRender: { type: Function as PropType<ProFormListCommonProps['actionRender']>, default: undefined },
    itemRender: { type: Function as PropType<ProFormListCommonProps['itemRender']>, default: undefined },
    itemContainerRender: { type: Function as PropType<ProFormListCommonProps['itemContainerRender']>, default: undefined },
    fieldExtraRender: { type: Function as PropType<ProFormListCommonProps['fieldExtraRender']>, default: undefined },
    alwaysShowItemLabel: { type: Boolean, default: false },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    arrowSort: { type: Boolean, default: false },
    containerClassName: { type: String, default: undefined },
    containerStyle: { type: Object as PropType<Record<string, any>>, default: undefined },
  },
  setup(props, { slots }) {
    const editContext = useEditOrReadOnly()
    const isReadMode = computed(() => props.readonly || editContext.readonly || editContext.mode === 'read')

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
          class={`ant-pro-form-list-creator-button-${position}`}
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
            readonly={props.readonly}
            copyIconProps={props.copyIconProps}
            deleteIconProps={props.deleteIconProps}
            upIconProps={props.upIconProps}
            downIconProps={props.downIconProps}
            arrowSort={props.arrowSort}
            actionRender={props.actionRender}
            itemRender={props.itemRender}
            itemContainerRender={props.itemContainerRender}
            alwaysShowItemLabel={props.alwaysShowItemLabel}
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
})

export { ProFormListContainer }
