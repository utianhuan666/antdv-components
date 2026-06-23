import { FullscreenExitOutlined, FullscreenOutlined } from '@antdv-next/icons'
import { Tooltip } from 'antdv-next'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntl } from '../../../provider'
import { isBrowser } from '../../../utils'

const FullScreenIcon = defineComponent({
  name: 'FullScreenIcon',
  setup() {
    const intl = useIntl()
    const fullscreen = ref<boolean>(false)

    let handler: (() => void) | undefined

    onMounted(() => {
      if (!isBrowser())
        return
      handler = () => {
        fullscreen.value = !!document.fullscreenElement
      }
      document.addEventListener('fullscreenchange', handler)
    })

    onBeforeUnmount(() => {
      if (handler)
        document.removeEventListener('fullscreenchange', handler)
    })

    return () => {
      const { title, Icon } = fullscreen.value
        ? {
            title: intl.getMessage('tableToolBar.exitFullScreen', '退出全屏'),
            Icon: FullscreenExitOutlined,
          }
        : {
            title: intl.getMessage('tableToolBar.fullScreen', '全屏'),
            Icon: FullscreenOutlined,
          }

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

export default FullScreenIcon
