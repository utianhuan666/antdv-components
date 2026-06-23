import type { ColProps, RowProps } from 'antdv-next'
import type { Component, FunctionalComponent, InjectionKey, VNodeChild } from 'vue'
import type { ProFormGridConfig } from '../typing'
import { Col, Row } from 'antdv-next'
import { computed, h, inject, provide } from 'vue'
import { cloneElement, flattenChildren, getVNodeProps } from '../layouts/_shared/vueHelpers'

export const GridContext: InjectionKey<ProFormGridConfig> = Symbol('GridContext')

interface CommonProps {
  Wrapper?: Component
}

interface ColWrapperProps extends ColProps, CommonProps {
  variant?: string
  fieldProps?: Record<string, any>
}

export interface GridHelpers {
  RowWrapper: FunctionalComponent<RowProps & CommonProps>
  ColWrapper: FunctionalComponent<ColWrapperProps>
  grid: boolean
}

function renderWrapper(wrapper: Component | undefined, children: VNodeChild) {
  return wrapper ? h(wrapper, null, { default: () => children }) : children
}

export function provideGridContext(value: ProFormGridConfig) {
  provide(GridContext, value)
}

export function useGridContext() {
  return inject(GridContext, {
    grid: false,
    colProps: undefined,
    rowProps: undefined,
  })
}

export const gridHelpers: (
  config: ProFormGridConfig & CommonProps,
) => GridHelpers = ({ grid, rowProps, colProps, Wrapper }) => ({
  grid: !!grid,
  RowWrapper: (props, { slots, attrs }) => {
    const children = slots.default?.()
    const CurrentWrapper = props.Wrapper ?? Wrapper
    if (!grid)
      return renderWrapper(CurrentWrapper, children)

    return (
      <Row gutter={8} {...rowProps} {...attrs} {...props}>
        {children}
      </Row>
    )
  },
  ColWrapper: (props, { slots, attrs }) => {
    const mergedProps = computed(() => {
      const originProps = { ...colProps, ...attrs, ...props } as Record<string, any>
      if (
        typeof originProps.span === 'undefined'
        && typeof originProps.xs === 'undefined'
      ) {
        originProps.xs = 24
      }
      return originProps
    })

    const children = slots.default?.()
    const flatChildren = flattenChildren(children)
    const CurrentWrapper = props.Wrapper ?? Wrapper
    const variant = props.variant
    const fieldProps = props.fieldProps

    const childrenWithProps
      = (variant !== undefined || fieldProps !== undefined) && flatChildren.length === 1
        ? (() => {
            const child = flatChildren[0]
            const childProps = getVNodeProps(child)
            return cloneElement(child, {
              ...(variant !== undefined && { variant }),
              ...(fieldProps && {
                fieldProps: {
                  ...childProps.fieldProps,
                  ...fieldProps,
                },
              }),
            })
          })()
        : children

    if (!grid) {
      return renderWrapper(CurrentWrapper, childrenWithProps)
    }

    return <Col {...mergedProps.value}>{childrenWithProps as VNodeChild}</Col>
  },
})

export function useGridHelpers(props?: (ProFormGridConfig & CommonProps) | boolean) {
  const config = computed(() => {
    if (typeof props === 'object')
      return props
    return {
      grid: props,
    }
  })

  const { grid, colProps } = useGridContext()

  return computed(() =>
    gridHelpers({
      grid: !!(grid || config.value.grid),
      rowProps: config.value?.rowProps,
      colProps: config.value?.colProps || colProps,
      Wrapper: config.value?.Wrapper,
    }),
  ).value
}
