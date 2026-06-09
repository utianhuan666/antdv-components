import { Card, SkeletonAvatar, SkeletonButton, Space } from 'antdv-next'
import { defineComponent } from 'vue'
import { PageHeaderSkeleton } from '../List'

interface ResultPageSkeletonProps {
  active?: boolean
  pageHeader?: false
}

const ResultPageSkeleton = defineComponent<ResultPageSkeletonProps>({
  name: 'ResultPageSkeleton',
  props: ['active', 'pageHeader'],
  setup(rawProps) {
    const props = rawProps

    return () => (
      <div
        style={{
          width: '100%',
        }}
      >
        {props.pageHeader !== false && <PageHeaderSkeleton active={props.active ?? true} />}
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              padding: 128,
            }}
          >
            <SkeletonAvatar
              size={64}
              style={{
                marginBlockEnd: 32,
              }}
            />
            <SkeletonButton
              active={props.active ?? true}
              style={{ width: 214, marginBlockEnd: 8 }}
            />
            <SkeletonButton active={props.active ?? true} style={{ width: 328 }} size="small" />
            <Space
              style={{
                marginBlockStart: 24,
              }}
            >
              <SkeletonButton active={props.active ?? true} style={{ width: 116 }} />
              <SkeletonButton active={props.active ?? true} style={{ width: 116 }} />
            </Space>
          </div>
        </Card>
      </div>
    )
  },
})

export default ResultPageSkeleton
