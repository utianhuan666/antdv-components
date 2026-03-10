export interface NavItem {
  title: string;
  link?: string;
  target?: string;
}

export interface SidebarItem {
  title: string;
  link: string;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export interface HeroButton {
  label: string;
  link: string;
  type?: "primary" | "default";
}

export interface HeroConfig {
  title: string;
  titleZh?: string;
  description: string;
  buttons: HeroButton[];
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

export interface FeaturesConfig {
  title?: string;
  items: FeatureItem[];
}

export interface FooterLink {
  title: string;
  url: string;
  openExternal?: boolean;
}

export interface FooterGroup {
  title: string;
  items: FooterLink[];
}

export interface FooterConfig {
  columns: FooterGroup[];
  copyright?: string;
}

export const siteConfig = {
  title: "AntDV Components",
  titleZh: "Ant Design Vue 组件库",
  description: "基于 Ant Design Vue 的企业级 UI 组件库，为 Vue 3 而生",
  github: "https://github.com/utianhuan666/antdv-components",

  nav: [{ title: "组件", link: "/docs" }] satisfies NavItem[],

  sidebar: {
    "/docs": [
      {
        title: "开始使用",
        items: [{ title: "介绍", link: "/docs" }],
      },
      {
        title: "通用",
        items: [{ title: "Button 按钮", link: "/docs/button" }],
      },
      {
        title: "数据录入",
        items: [{ title: "Form 表单", link: "/docs/form" }],
      },
    ],
  } as Record<string, SidebarGroup[]>,

  hero: {
    title: "AntDV Components",
    titleZh: "企业级 Vue 3 组件库",
    description:
      "基于 Ant Design Vue 封装的高质量业务组件，让每个 Vue 3 项目都能拥有企业级的开发体验",
    buttons: [
      { label: "快速开始", link: "/docs", type: "primary" },
      {
        label: "查看 GitHub",
        link: "https://github.com/utianhuan666/antdv-components",
        target: "_blank",
      },
    ],
  } satisfies HeroConfig,

  features: [
    {
      title: "高质量组件",

      description: "基于 Ant Design Vue 封装，提供高质量、可复用的业务组件",
      icon: "🧩",
    },
    {
      title: "TypeScript",
      description:
        "使用 TypeScript 编写，提供完整的类型定义，享受 IDE 智能提示",
      icon: "🔷",
    },
    {
      title: "开箱即用",
      description: "所有组件均经过精心设计，可直接用于生产项目",
      icon: "📦",
    },
    {
      title: "亮暗主题",
      description: "完美支持亮色和暗色主题，跟随系统自动切换",
      icon: "🌓",
    },
    {
      title: "国际化",
      description: "内置多语言支持，轻松实现 i18n 国际化",
      icon: "🌐",
    },
    {
      title: "持续更新",
      description: "跟随 Ant Design 版本迭代，持续完善和新增更多组件",
      icon: "🚀",
    },
  ] satisfies FeatureItem[],

  footer: {
    columns: [
      {
        title: "资源",
        items: [
          {
            title: "Ant Design Vue",
            url: "https://antdv.com",
            openExternal: true,
          },
          { title: "Vue 3", url: "https://vuejs.org", openExternal: true },
          { title: "Vite", url: "https://vitejs.dev", openExternal: true },
        ],
      },
      {
        title: "社区",
        items: [
          {
            title: "GitHub",
            url: "https://github.com/utianhuan666/antdv-components",
            openExternal: true,
          },
          {
            title: "问题反馈",
            url: "https://github.com/utianhuan666/antdv-components/issues",
            openExternal: true,
          },
        ],
      },
    ],
    copyright: `Copyright © ${new Date().getFullYear()} AntDV Components`,
  } satisfies FooterConfig,
};
