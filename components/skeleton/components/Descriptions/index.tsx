import { Card, Skeleton, SkeletonButton, useBreakpoint } from 'antdv-next'
import { computed, defineComponent } from 'vue'
import { Line, PageHeaderSkeleton } from '../List'

function titleStyles(style: Record<string, string | number>) {
  return { title: style }
}

export interface DescriptionsPageSkeletonProps {
  active?: boolean
  pageHeader?: false
  list?: false | number
}

const MediaQueryKeyEnum = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
  xxl: 4,
}

interface DescriptionsLargeItemSkeletonProps {
  active?: boolean
}

const DescriptionsLargeItemSkeleton = defineComponent<DescriptionsLargeItemSkeletonProps>({
  name: 'DescriptionsLargeItemSkeleton',
  props: ['active'],
  setup(rawProps) {
    const props = rawProps

    return () => (
      <div
        style={{
          marginBlockStart: 32,
        }}
      >
        <SkeletonButton
          active={props.active}
          size="small"
          style={{ width: 100, marginBlockEnd: 16 }}
        />
        <div
          style={{
            width: '100%',
            justifyContent: 'space-between',
            display: 'flex',
          }}
        >
          <div
            style={{
              flex: 1,
              marginInlineEnd: 24,
              maxWidth: 300,
            }}
          >
            <Skeleton
              active={props.active}
              paragraph={false}
              styles={titleStyles({ marginBlockStart: 0 })}
            />
            <Skeleton
              active={props.active}
              paragraph={false}
              styles={titleStyles({ marginBlockStart: 8 })}
            />
            <Skeleton
              active={props.active}
              paragraph={false}
              styles={titleStyles({ marginBlockStart: 8 })}
            />
          </div>
          <div
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                maxWidth: 300,
                margin: 'auto',
              }}
            >
              <Skeleton
                active={props.active}
                paragraph={false}
                styles={titleStyles({ marginBlockStart: 0 })}
              />
              <Skeleton
                active={props.active}
                paragraph={false}
                styles={titleStyles({ marginBlockStart: 8 })}
              />
            </div>
          </div>
        </div>
      </div>
    )
  },
})

interface DescriptionsItemSkeletonProps {
  size?: number
  active?: boolean
}

const DescriptionsItemSkeleton = defineComponent<DescriptionsItemSkeletonProps>({
  name: 'DescriptionsItemSkeleton',
  props: ['size', 'active'],
  setup(rawProps) {
    const props = rawProps
    const defaultCol: Record<string, boolean> = {
      lg: true,
      md: true,
      sm: false,
      xl: false,
      xs: false,
      xxl: false,
    }
    const col = useBreakpoint()
    const colSize = computed(() => {
      const screens = (col.value || defaultCol) as Record<string, boolean | undefined>

      return Object.keys(screens).filter(key => screens[key] === true)[0] || 'md'
    })
    const arraySize = computed(() =>
      props.size === undefined ? MediaQueryKeyEnum[colSize.value as 'md'] || 3 : props.size,
    )

    return () => (
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
              flex: 1,
              paddingInlineStart: index === 0 ? 0 : 24,
              paddingInlineEnd: index === arraySize.value - 1 ? 0 : 24,
            }}
          >
            <Skeleton
              active={props.active}
              paragraph={false}
              styles={titleStyles({ marginBlockStart: 0 })}
            />
            <Skeleton
              active={props.active}
              paragraph={false}
              styles={titleStyles({ marginBlockStart: 8 })}
            />
            <Skeleton
              active={props.active}
              paragraph={false}
              styles={titleStyles({ marginBlockStart: 8 })}
            />
          </div>
        ))}
      </div>
    )
  },
})

interface TableItemSkeletonProps {
  active: boolean
  header?: boolean
}

export const TableItemSkeleton = defineComponent<TableItemSkeletonProps>({
  name: 'TableItemSkeleton',
  props: ['active', 'header'],
  setup(rawProps) {
    const props = rawProps
    const defaultCol: Record<string, boolean> = {
      lg: true,
      md: true,
      sm: false,
      xl: false,
      xs: false,
      xxl: false,
    }
    const col = useBreakpoint()
    const colSize = computed(() => {
      const screens = (col.value || defaultCol) as Record<string, boolean | undefined>

      return Object.keys(screens).filter(key => screens[key] === true)[0] || 'md'
    })
    const arraySize = computed(() => MediaQueryKeyEnum[colSize.value as 'md'] || 3)

    return () => (
      <>
        <div
          style={{
            display: 'flex',
            background: props.header ? 'rgba(0,0,0,0.02)' : 'none',
            padding: '24px 8px',
          }}
        >
          {Array.from({ length: arraySize.value }).map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                paddingInlineStart: props.header && index === 0 ? 0 : 20,
                paddingInlineEnd: 32,
              }}
            >
              <Skeleton
                active={props.active}
                paragraph={false}
                title={{
                  width: props.header ? '75px' : '100%',
                }}
                styles={titleStyles({ margin: 0, height: 24 })}
              />
            </div>
          ))}
          <div
            style={{
              flex: 3,
              paddingInlineStart: 32,
            }}
          >
            <Skeleton
              active={props.active}
              paragraph={false}
              title={{
                width: props.header ? '75px' : '100%',
              }}
              styles={titleStyles({ margin: 0, height: 24 })}
            />
          </div>
        </div>
        <Line padding="0px 0px" />
      </>
    )
  },
})

interface TableSkeletonProps {
  active: boolean
  size?: number
}

export const TableSkeleton = defineComponent<TableSkeletonProps>({
  name: 'TableSkeleton',
  props: ['active', 'size'],
  setup(rawProps) {
    const props = rawProps

    return () => (
      <Card variant="borderless">
        <SkeletonButton
          active={props.active}
          size="small"
          style={{ width: 100, marginBlockEnd: 16 }}
        />
        <TableItemSkeleton header active={props.active} />
        {Array.from({ length: props.size ?? 4 }).map((_, index) => (
          <TableItemSkeleton key={index} active={props.active} />
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingBlockStart: 16,
          }}
        >
          <Skeleton
            active={props.active}
            paragraph={false}
            styles={titleStyles({
              margin: 0,
              height: 32,
              float: 'right',
              maxWidth: '630px',
            })}
          />
        </div>
      </Card>
    )
  },
})

interface DescriptionsSkeletonProps {
  active: boolean
}

export const DescriptionsSkeleton = defineComponent<DescriptionsSkeletonProps>({
  name: 'DescriptionsSkeleton',
  props: ['active'],
  setup(rawProps) {
    const props = rawProps

    return () => (
      <Card
        variant="borderless"
        style={{
          borderStartEndRadius: 0,
          borderTopLeftRadius: 0,
        }}
      >
        <SkeletonButton
          active={props.active}
          size="small"
          style={{ width: 100, marginBlockEnd: 16 }}
        />
        <DescriptionsItemSkeleton active={props.active} />
        <DescriptionsLargeItemSkeleton active={props.active} />
      </Card>
    )
  },
})

const DescriptionsPageSkeleton = defineComponent<DescriptionsPageSkeletonProps>({
  name: 'DescriptionsPageSkeleton',
  props: ['active', 'pageHeader', 'list'],
  setup(rawProps) {
    const props = rawProps

    return () => (
      <div
        style={{
          width: '100%',
        }}
      >
        {props.pageHeader !== false && <PageHeaderSkeleton active={props.active ?? true} />}
        <DescriptionsSkeleton active={props.active ?? true} />
        {props.list !== false && <Line />}
        {props.list !== false && <TableSkeleton active={props.active ?? true} size={props.list as number} />}
      </div>
    )
  },
})

export default DescriptionsPageSkeleton
