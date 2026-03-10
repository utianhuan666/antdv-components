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
    ],
  } as Record<string, SidebarGroup[]>,

  hero: {
    title: 'AntDV',
    highlight: 'Components',
    titleZh: 'Enterprise-class Vue 3 component library',
    description:
      'Build elegant, production-ready Vue experiences with a polished component system powered by Ant Design Vue.',
    buttons: [
      { label: 'Get Started', link: '/docs', type: 'primary' },
      {
        label: 'GitHub',
        link: 'https://github.com/utianhuan666/antdv-components',
        type: 'default',
      },
    ],
  } satisfies HeroConfig,

  features: [
    {
      title: 'Modern Theme Style',
      description:
        'A documentation experience with glassmorphism, gradient lighting, and refined spacing inspired by the original dumi theme.',
      icon: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/q48YQ5X4ytAAAAAAAAAAAAAAFl94AQBr',
      row: 9,
    },
    {
      title: 'Based on Ant Design Vue and CSS-in-JS aesthetics',
      description:
        'Bring enterprise-ready interaction patterns together with Vue 3 composition power, strong tokens, and a carefully tuned visual system.',
      icon: '◈',
      row: 9,
      link: '/docs',
    },
    {
      title: 'One-click switch between light and dark themes',
      description:
        'Use the header actions to toggle theme mode and keep the reading experience consistent across bright and low-light environments.',
      icon: '◐',
      row: 9,
    },
    {
      title: 'Exquisite developer experience',
      description:
        'Type-safe APIs, polished docs, and reusable business abstractions help teams ship faster without losing consistency.',
      icon: '</>',
      row: 9,
    },
    {
      title: 'Composable architecture',
      description:
        'The docs site and component library are both built with modular Vue composables, making customization and expansion straightforward.',
      icon: '▣',
      row: 9,
    },
    {
      title: 'Flexible component reusability',
      description:
        'A practical component foundation for dashboards, forms, and enterprise workflows, designed to scale with your product.',
      icon: '✦',
      row: 9,
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
