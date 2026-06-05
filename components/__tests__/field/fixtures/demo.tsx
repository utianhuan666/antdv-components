import type { ProFieldFCMode } from '@antdv/components'
import { ProField } from '@antdv/components'
import { Descriptions, DescriptionsItem } from 'antdv-next'
import dayjs from 'dayjs'

export default function Demo({ state }: { state: ProFieldFCMode }) {
  return (
    <Descriptions column={2}>
      <DescriptionsItem label="文本">
        <ProField text="这是一段文本" valueType="text" mode={state} />
      </DescriptionsItem>
      <DescriptionsItem label="头像">
        <ProField
          text="https://avatars2.githubusercontent.com/u/8186664?s=60&v=4"
          mode="read"
          valueType={'avatar' as any}
        />
      </DescriptionsItem>
      <DescriptionsItem label="空字符串">
        <ProField text="" mode="read" />
      </DescriptionsItem>
      <DescriptionsItem label="日期区间">
        <ProField
          text={[
            dayjs('2019-11-16 12:50:26').add(-1, 'd').valueOf(),
            dayjs('2019-11-16 12:50:26').valueOf(),
          ]}
          valueType="dateRange"
          mode={state}
        />
      </DescriptionsItem>
      <DescriptionsItem label="index">
        <ProField text={0} valueType={'index' as any} mode={state} />
        <ProField text={0} valueType={'indexBorder' as any} mode={state} />
      </DescriptionsItem>
      <DescriptionsItem label="金额">
        <ProField text="100" valueType="money" mode={state} />
      </DescriptionsItem>
      <DescriptionsItem label="百分比">
        <ProField text="100" valueType="percent" mode={state} />
      </DescriptionsItem>
      <DescriptionsItem label="选择框">
        <ProField
          text="open"
          mode={state}
          valueEnum={{
            all: { text: '全部', status: 'Default' },
            open: { text: '未解决', status: 'Error' },
            closed: { text: '已解决', status: 'Success' },
            processing: { text: '解决中', status: 'Processing' },
          }}
        />
      </DescriptionsItem>
      <DescriptionsItem label="远程选择框">
        <ProField
          text="open"
          mode={state}
          request={async () => [
            { label: '全部', value: 'all' },
            { label: '未解决', value: 'open' },
            { label: '已解决', value: 'closed' },
            { label: '解决中', value: 'processing' },
          ]}
        />
      </DescriptionsItem>
      <DescriptionsItem label="进度条">
        <ProField text="40" valueType="progress" mode={state} />
      </DescriptionsItem>
      <DescriptionsItem label="日期时间">
        <ProField
          text={dayjs('2019-11-16 12:50:26').valueOf()}
          valueType="dateTime"
          mode={state}
        />
      </DescriptionsItem>
      <DescriptionsItem label="日期">
        <ProField
          text={dayjs('2019-11-16 12:50:26').valueOf()}
          valueType="date"
          mode={state}
        />
      </DescriptionsItem>
      <DescriptionsItem label="日期区间">
        <ProField
          text={[
            dayjs('2019-11-16 12:50:26').add(-1, 'd').valueOf(),
            dayjs('2019-11-16 12:50:26').valueOf(),
          ]}
          valueType="dateTimeRange"
          mode={state}
        />
      </DescriptionsItem>
      <DescriptionsItem label="dateRange">
        <ProField
          text={[
            dayjs('2019-11-16 12:50:26').add(-1, 'd').valueOf(),
            dayjs('2019-11-16 12:50:26').valueOf(),
          ]}
          valueType="dateTimeRange"
          mode={state}
        />
      </DescriptionsItem>
      <DescriptionsItem label="时间">
        <ProField
          text={dayjs('2019-11-16 12:50:26').valueOf()}
          valueType="time"
          mode={state}
        />
      </DescriptionsItem>
      <DescriptionsItem label="密码">
        <ProField text="password" valueType="password" mode={state} />
      </DescriptionsItem>
      <DescriptionsItem label="代码块">
        <ProField
          text={`
yarn run v1.22.0
$ eslint --format=pretty ./packages
Done in 9.70s.
          `}
          valueType="code"
          mode={state}
        />
      </DescriptionsItem>
      <DescriptionsItem label="JSON 代码块">
        <ProField
          text={`{
  "compilerOptions": {
    "target": "esnext",
    "moduleResolution": "node",
    "jsx": "preserve",
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["**/src", "**/docs", "scripts", "**/demo", ".eslintrc.js"]
}
`}
          valueType="jsonCode"
          mode={state}
        />
      </DescriptionsItem>
    </Descriptions>
  )
}
