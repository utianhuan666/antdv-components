import { defineComponent, Fragment } from 'vue'

export default defineComponent({
  name: 'SchemaFormEmbed',
  setup(_, { slots }) {
    return () => <Fragment>{slots.default?.()}</Fragment>
  },
})
