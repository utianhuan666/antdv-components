import { Card, Divider, Skeleton, SkeletonButton, Space, useBreakpoint } from 'antdv-next'
import { computed, defineComponent } from 'vue'

const DEFAULT_COL: Record<string, boolean> = {
  lg: true,
  md: true,
  sm: false,
  xl: false,
  xs: false,
  xxl: false,
}

function useReactColSize() {
  const col = useBreakpoint()

  return computed(() => {
    const screens = (col.value || DEFAULT_COL) as Record<string, boolean | undefined>

    return Object.keys(screens).filter(key => screens[key] === true)[0] || 'md'
  })
}

interface LineProps {
  padding?: string | number
}

export const Line = defineComponent({
  name: 'Line',
  props: ['padding'],
  setup(rawProps) {
    const props = rawProps as LineProps

    return () => (
      <div
        style={{
          padding: props.padding || '0 24px',
        }}
      >
        <Divider style={{ margin: 0 }} />
      </div>
    )
  },
})

export const MediaQueryKeyEnum = {
  xs: 2,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 6,
  xxl: 6,
}

const StatisticSkeleton = defineComponent({
  name: 'StatisticSkeleton',
  props: ['size', 'active'],
  setup(rawProps) {
    const props = rawProps as {
      size?: number
      active?: boolean
    }
    const colSize = useReactColSize()
    const arraySize = computed(() =>
      props.size === undefined
        ? MediaQueryKeyEnum[colSize.value as 'md'] || 6
        : props.size,
    )
    const firstWidth = (index: number) => {
      if (index === 0)
        return 0
      if (arraySize.value > 2)
        return 42
      return 16
    }

    return () => (
      <Card
        variant="borderless"
        style={{
          marginBlockEnd: 16,
        }}
      >
        <div
          style={{
            width: '100%',
            justifyContent: 'space-between',
            display: 'flex',
          }}
        >
          {Array.from({ length: arraySize.value }).map((_, index) => (
            <div
              key={index}
              style={{
                borderInlineStart:
                  arraySize.value > 2 && index === 1
                    ? '1px solid rgba(0,0,0,0.06)'
                    : undefined,
                paddingInlineStart: firstWidth(index),
                flex: 1,
                marginInlineEnd: index === 0 ? 16 : 0,
              }}
            >
              <Skeleton
                active={props.active}
                paragraph={false}
                title={{
                  width: 100,
                }}
                styles={{
                  title: { marginBlockStart: 0 },
                }}
              />
              <SkeletonButton
                active={props.active}
                style={{
                  height: 48,
                }}
              />
            </div>
          ))}
        </div>
      </Card>
    )
  },
})

export const ListSkeletonItem = defineComponent({
  name: 'ListSkeletonItem',
  props: ['active'],
  setup(rawProps) {
    const props = rawProps as {
      active: boolean
    }

    return () => (
      <>
        <Card
          variant="borderless"
          style={{
            borderRadius: 0,
          }}
          styles={{
            body: {
              padding: 24,
            },
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                maxWidth: '100%',
                flex: 1,
              }}
            >
              <Skeleton
                active={props.active}
                title={{
                  width: 100,
                }}
                paragraph={{
                  rows: 1,
                }}
                styles={{
                  title: {
                    marginBlockStart: 0,
                  },
                  paragraph: {
                    margin: 0,
                  },
                }}
              />
            </div>
            <SkeletonButton
              active={props.active}
              size="small"
              style={{ width: 165, marginBlockStart: 12 }}
            />
          </div>
        </Card>
        <Line />
      </>
    )
  },
})

export const ListSkeleton = defineComponent({
  name: 'ListSkeleton',
  props: ['size', 'active', 'actionButton'],
  setup(rawProps) {
    const props = rawProps as {
      size: number
      active?: boolean
      actionButton?: boolean
    }

    return () => (
      <Card
        variant="borderless"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        {Array.from({ length: props.size }).map((_, index) => (
          <ListSkeletonItem key={index} active={!!(props.active ?? true)} />
        ))}

        {props.actionButton !== false && (
          <Card
            variant="borderless"
            style={{
              borderStartEndRadius: 0,
              borderTopLeftRadius: 0,
            }}
            styles={{
              body: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          >
            <SkeletonButton
              style={{
                width: 102,
              }}
              active={props.active ?? true}
              size="small"
            />
          </Card>
        )}
      </Card>
    )
  },
})

export const PageHeaderSkeleton = defineComponent({
  name: 'PageHeaderSkeleton',
  props: ['active'],
  setup(rawProps) {
    const props = rawProps as {
      active: boolean
    }

    return () => (
      <div
        style={{
          marginBlockEnd: 16,
        }}
      >
        <Skeleton
          paragraph={false}
          title={{
            width: 185,
          }}
        />
        <SkeletonButton active={props.active} size="small" />
      </div>
    )
  },
})

export interface ListPageSkeletonProps {
  active?: boolean
  pageHeader?: false
  statistic?: number | false
  actionButton?: false
  toolbar?: false
  list?: number | false
}

export const ListToolbarSkeleton = defineComponent({
  name: 'ListToolbarSkeleton',
  props: ['active'],
  setup(rawProps) {
    const props = rawProps as {
      active: boolean
    }

    return () => (
      <Card
        variant="borderless"
        style={{
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
        }}
        styles={{
          body: {
            paddingBlockEnd: 8,
          },
        }}
      >
        <Space
          style={{
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <SkeletonButton active={props.active} style={{ width: 200 }} size="small" />
          <Space>
            <SkeletonButton active={props.active} size="small" style={{ width: 120 }} />
            <SkeletonButton active={props.active} size="small" style={{ width: 80 }} />
          </Space>
        </Space>
      </Card>
    )
  },
})

const ListPageSkeleton = defineComponent({
  name: 'ListPageSkeleton',
  props: ['active', 'pageHeader', 'statistic', 'actionButton', 'toolbar', 'list'],
  setup(rawProps) {
    const props = rawProps as ListPageSkeletonProps

    return () => (
      <div
        style={{
          width: '100%',
        }}
      >
        {props.pageHeader !== false && <PageHeaderSkeleton active={props.active ?? true} />}
        {props.statistic !== false && (
          <StatisticSkeleton size={props.statistic as number} active={props.active ?? true} />
        )}
        {(props.toolbar !== false || props.list !== false) && (
          <Card
            variant="borderless"
            styles={{
              body: {
                padding: 0,
              },
            }}
          >
            {props.toolbar !== false && <ListToolbarSkeleton active={props.active ?? true} />}
            {props.list !== false && (
              <ListSkeleton
                size={props.list === undefined ? 5 : props.list as number}
                active={props.active ?? true}
                actionButton={props.actionButton}
              />
            )}
          </Card>
        )}
      </div>
    )
  },
})

export default ListPageSkeleton
