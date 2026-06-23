import { configure } from 'safe-stable-stringify'

export type StringifyOptions = Parameters<typeof configure>[0]

const configuredStringify = configure({
  bigint: true,
  circularValue: 'Magic circle!',
  deterministic: false,
  maximumDepth: 4,
})

function stringify(value: unknown) {
  return configuredStringify(value) as string
}

export { configure, stringify }
export default stringify
