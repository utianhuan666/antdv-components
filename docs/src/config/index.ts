export interface NavItem {
  title: string
  link?: string
  target?: string
}

export interface SidebarItem {
  title: string
  link: string
}

export interface SidebarGroup {
  title: string
  items: SidebarItem[]
}

export interface HeroButton {
  label: string
  link: string
  type?: 'primary' | 'default'
}

export interface HeroConfig {
  title: string
  highlight?: string
  titleZh?: string
  description: string
  buttons: HeroButton[]
}

export interface FeatureItem {
  title: string
  description: string
  icon: string
  link?: string
  openExternal?: boolean
  row?: number
  column?: number
}

export interface FeaturesConfig {
  title?: string
  items: FeatureItem[]
}

export interface FooterLink {
  title: string
  url: string
  openExternal?: boolean
}

export interface FooterGroup {
  title: string
  items: FooterLink[]
}

export interface FooterConfig {
  columns: FooterGroup[]
  copyright?: string
  bottomMessage?: string
}

export const siteConfig = {
  title: 'AntDV Components',
  titleZh: 'Ant Design Vue 组件库',
  description: 'Enterprise-ready component library built on top of Ant Design Vue for Vue 3 applications',
  github: 'https://github.com/utianhuan666/antdv-components',

  nav: [
    { title: 'Home', link: '/' },
    { title: 'Components', link: '/docs' },
  ] satisfies NavItem[],

  sidebar: {
    '/docs': [
      {
        title: 'Getting Started',
        items: [{ title: 'Introduction', link: '/docs' }],
      },
      {
        title: 'Components',
        items: [
          { title: 'ProSkeleton 骨架屏', link: '/docs/skeleton' },
        ],
      },
    ],
  } as Record<string, SidebarGroup[]>,

  hero: {
    title: 'ProComponents',
    highlight: '',
    titleZh: '🏆 让中后台开发更简单',
    description: '',
    buttons: [{ label: '🏮🏮 快速开始 →', link: '/docs', type: 'primary' }],
  } satisfies HeroConfig,

  features: [
    {
      title: '简单易用',
      description: '在 Ant Design 上进行了自己的封装，更加易用',
      icon: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/q48YQ5X4ytAAAAAAAAAAAAAAFl94AQBr',
      row: 7,
      column: 1,
    },
    {
      title: 'Ant Design',
      description: '与 Ant Design 设计体系一脉相承，无缝对接 Ant Design 项目',
      icon: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      row: 7,
      column: 1,
    },
    {
      title: '国际化',
      description: '提供完备的国际化，与 Ant Design 体系打通，无需多余配置',
      icon: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/UKqDTIp55HYAAAAAAAAAAAAAFl94AQBr',
      row: 7,
      column: 1,
    },
    {
      title: '预设样式',
      description: '样式风格与 Ant Design 一脉相承，无需魔改，浑然天成。默认好用的主题系统',
      icon: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/Y_NMQKxw7OgAAAAAAAAAAAAAFl94AQBr',
      row: 7,
      column: 1,
    },
    {
      title: '预设行为',
      description: '更少的代码，更少的 Bug，更多的功能',
      icon: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/U3XjS5IA1tUAAAAAAAAAAAAAFl94AQBr',
      row: 7,
      column: 1,
    },
    {
      title: 'TypeScript',
      description: '使用 TypeScript 开发，提供完整的类型定义文件，无需频繁打开官网',
      icon: 'https://gw.alipayobjects.com/zos/antfincdn/Eb8IHpb9jE/Typescript_logo_2020.svg',
      row: 7,
      column: 1,
    },
  ] satisfies FeatureItem[],

  footer: {
    columns: [
      {
        title: 'Resources',
        items: [
          {
            title: 'Ant Design Vue',
            url: 'https://antdv.com',
            openExternal: true,
          },
          { title: 'Vue 3', url: 'https://vuejs.org', openExternal: true },
          { title: 'Vite', url: 'https://vitejs.dev', openExternal: true },
        ],
      },
      {
        title: 'Community',
        items: [
          {
            title: 'GitHub',
            url: 'https://github.com/utianhuan666/antdv-components',
            openExternal: true,
          },
          {
            title: 'Issues',
            url: 'https://github.com/utianhuan666/antdv-components/issues',
            openExternal: true,
          },
        ],
      },
      {
        title: 'Project',
        items: [
          { title: 'Documentation', url: '/docs' },
          {
            title: 'Package',
            url: 'https://github.com/utianhuan666/antdv-components',
            openExternal: true,
          },
        ],
      },
    ],
    copyright: `Copyright © ${new Date().getFullYear()} AntDV Components`,
    bottomMessage: 'Built with Vue 3, Ant Design Vue, and a slightly obsessive eye for pixels.',
  } satisfies FooterConfig,
}
