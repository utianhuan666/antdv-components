import type { AppItemProps, AppListProps } from '../SiderMenu/types'
import { computed, defineComponent, ref, shallowRef } from 'vue'
import { useProPrefixCls } from '../../../provider/useProPrefixCls'
import { AppsLogo } from './AppsLogo'
import { DefaultContent } from './DefaultContent'
import { SimpleContent } from './SimpleContent'

export function defaultRenderLogo(logo: any) {
  if (typeof logo === 'string')
    return <img width="auto" height={22} src={logo} alt="logo" />
  if (typeof logo === 'function')
    return logo()
  return logo
}

export const AppsLogoComponents = defineComponent<{
  appList?: AppListProps
  appListRender?: (props: AppListProps, defaultDom: any) => any
  onItemClick?: (item: AppItemProps, popoverRef?: any) => void
  prefixCls?: string
}>({
  name: 'AppsLogoComponents',
  props: ['appList', 'appListRender', 'onItemClick', 'prefixCls'] as any,
  setup(props) {
    const open = ref(false)
    const popoverRef = shallowRef<HTMLElement>()
    const prefixCls = useProPrefixCls('pro', computed(() => props.prefixCls))
    const baseClassName = computed(() => `${prefixCls.value}-layout-apps`)
    const hashId = ''
    const handleItemClick = (app: AppItemProps) => props.onItemClick?.(app, popoverRef)
    const defaultDomContent = computed(() => {
      const isSimple = props.appList?.some(app => !app?.desc)
      const childItemClick = props.onItemClick ? handleItemClick : undefined
      if (isSimple)
        return <SimpleContent appList={props.appList} itemClick={childItemClick} baseClassName={`${baseClassName.value}-simple`} />
      return <DefaultContent appList={props.appList} itemClick={childItemClick} baseClassName={`${baseClassName.value}-default`} />
    })
    const content = computed(() => props.appListRender ? props.appListRender(props.appList || [], defaultDomContent.value) : defaultDomContent.value)

    return () => {
      if (!props.appList?.length)
        return null
      return (
        <>
          <span
            ref={popoverRef as any}
            onClick={(event: MouseEvent) => {
              event.stopPropagation()
              open.value = !open.value
            }}
            class={[`${baseClassName.value}-icon`, hashId, open.value && `${baseClassName.value}-icon-active`]}
            data-testid="pro-layout-apps-logo-icon"
          >
            <AppsLogo />
          </span>
          {open.value ? content.value : null}
        </>
      )
    }
  },
})

export type { AppItemProps, AppListProps }
