import { defineComponent } from 'vue'

const Embed = defineComponent({
  name: 'SchemaFormEmbed',
  setup(_props, { slots }) {
    return () => <>{slots.default?.()}</>
  },
})

export default Embed
