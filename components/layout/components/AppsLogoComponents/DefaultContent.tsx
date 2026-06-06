import type { AppItemProps, AppListProps } from '../SiderMenu/types'
import { defineComponent } from 'vue'
import { defaultRenderLogo } from './index'

export const DefaultContent = defineComponent<{
  appList?: AppListProps
  itemClick?: (item: AppItemProps) => void
  baseClassName: string
}>({
  name: 'DefaultContent',
  props: ['appList', 'itemClick', 'baseClassName'] as any,
  setup(props) {
    return () => (
      <div class={`${props.baseClassName}-content`} data-testid="pro-layout-apps-logo-content">
        <ul class={`${props.baseClassName}-content-list`} data-testid="pro-layout-apps-logo-content-list">
          {props.appList?.map((app, index) => {
            const itemKey = (typeof app.title === 'string' && app.title) || index
            if (app.children?.length) {
              return (
                <li key={itemKey} role="presentation" class={`${props.baseClassName}-content-list-item-group`} data-testid="pro-layout-apps-logo-content-list-item-group">
                  <div class={`${props.baseClassName}-content-list-item-group-title`} data-testid="pro-layout-apps-logo-content-list-item-group-title">
                    {app.title}
                  </div>
                  <DefaultContent appList={app.children} itemClick={props.itemClick} baseClassName={props.baseClassName} />
                </li>
              )
            }
            const hasClick = !!props.itemClick
            return (
              <li
                key={itemKey}
                class={`${props.baseClassName}-content-list-item`}
                data-testid="pro-layout-apps-logo-content-list-item"
                onClick={(event: MouseEvent) => {
                  event.stopPropagation()
                  props.itemClick?.(app)
                }}
              >
                <a href={hasClick ? undefined : app.url} target={hasClick ? undefined : app.target} role={hasClick ? 'button' : undefined} tabindex={hasClick ? 0 : undefined} rel="noreferrer">
                  {defaultRenderLogo(app.icon)}
                  <div>
                    <div>{app.title}</div>
                    {app.desc ? <span>{app.desc}</span> : null}
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    )
  },
})
