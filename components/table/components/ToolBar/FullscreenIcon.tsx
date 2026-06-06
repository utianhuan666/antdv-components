import { FullscreenExitOutlined, FullscreenOutlined } from '@antdv-next/icons'
import { Tooltip } from 'antdv-next'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntl } from '../../../provider'

export default defineComponent({
  name: 'FullscreenIcon',
  setup() {
    const intl = useIntl()
    const fullscreen = ref(false)

    function updateFullscreen() {
      if (typeof document !== 'undefined')
        fullscreen.value = !!document.fullscreenElement
    }

    onMounted(() => {
      if (typeof document === 'undefined')
        return
      updateFullscreen()
      document.addEventListener?.('fullscreenchange', updateFullscreen)
    })

    onBeforeUnmount(() => {
      if (typeof document === 'undefined')
        return
      document.removeEventListener?.('fullscreenchange', updateFullscreen)
    })

    return () => {
      const Icon = fullscreen.value ? FullscreenExitOutlined : FullscreenOutlined
      const title = fullscreen.value
        ? intl.getMessage('tableToolBar.exitFullScreen', '退出全屏')
        : intl.getMessage('tableToolBar.fullScreen', '全屏')
      return (
        <Tooltip title={title}>
          <span>
            <Icon />
          </span>
        </Tooltip>
      )
    }
  },
})
