import type { PropType } from 'vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FieldIndexColumn',
  props: {
    border: { type: Boolean, default: false },
    text: { type: Number as PropType<number>, default: 0 },
  },
  setup(props) {
    return () => {
      const displayValue = Number(props.text) + 1

      if (props.border) {
        const isTopThree = displayValue > 3
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              color: '#fff',
              fontSize: '12px',
              lineHeight: '12px',
              backgroundColor: isTopThree ? '#979797' : '#314659',
              borderRadius: '9px',
            }}
          >
            {displayValue}
          </div>
        )
      }

      return (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
          }}
        >
          {displayValue}
        </div>
      )
    }
  },
})
