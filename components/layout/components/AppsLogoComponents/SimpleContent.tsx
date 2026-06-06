import type { AppItemProps, AppListProps } from '../SiderMenu/types'
import { defineComponent } from 'vue'

function isUrl(value?: string) {
  return /^https?:\/\//.test(value || '')
}

export function renderLogo(logo: any, title: any, avatarClassName: string) {
  if (logo && typeof logo === 'string' && isUrl(logo))
    return <img src={logo} alt="logo" />
  if (typeof logo === 'function')
    return logo()
  if (logo && typeof logo === 'string')
    return <div class={avatarClassName} data-testid="pro-layout-apps-logo-avatar">{logo}</div>
  if (!logo && title && typeof title === 'string')
    return <div class={avatarClassName} data-testid="pro-layout-apps-logo-avatar">{title.substring(0, 1)}</div>
  return logo
}

export const SimpleContent = defineComponent<{
  appList?: AppListProps
  itemClick?: (item: AppItemProps) => void
  baseClassName: string
}>({
  name: 'SimpleContent',
  props: ['appList', 'itemClick', 'baseClassName'] as any,
  setup(props) {
    return () => (
      <div class={`${props.baseClassName}-content`} data-testid="pro-layout-apps-logo-simple-content">
        <ul class={`${props.baseClassName}-content-list`} data-testid="pro-layout-apps-logo-simple-content-list">
          {props.appList?.map((app, index) => {
            const itemKey = (typeof app.title === 'string' && app.title) || index
            if (app.children?.length) {
              return (
                <li key={itemKey} role="presentation" class={`${props.baseClassName}-content-list-item-group`} data-testid="pro-layout-apps-logo-simple-content-list-item-group">
                  <div class={`${props.baseClassName}-content-list-item-group-title`} data-testid="pro-layout-apps-logo-simple-content-list-item-group-title">
                    {app.title}
                  </div>
                  <SimpleContent appList={app.children} itemClick={props.itemClick} baseClassName={props.baseClassName} />
                </li>
              )
            }
            const hasClick = !!props.itemClick
            return (
              <li
                key={itemKey}
                class={`${props.baseClassName}-content-list-item`}
                data-testid="pro-layout-apps-logo-simple-content-list-item"
                onClick={(event: MouseEvent) => {
                  event.stopPropagation()
                  props.itemClick?.(app)
                }}
              >
                <a href={hasClick ? undefined : app.url} target={hasClick ? undefined : app.target} role={hasClick ? 'button' : undefined} tabindex={hasClick ? 0 : undefined} rel="noreferrer">
                  {renderLogo(app.icon, app.title, `${props.baseClassName}-avatar`)}
                  <div><div>{app.title}</div></div>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    )
  },
})
