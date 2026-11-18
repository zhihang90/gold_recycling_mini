import { APP_ROUTES, ROUTE_GROUPS } from './routes.config'

export interface PrototypeMenuItem {
  label: string
  path: string
}

/** 左栏二级分组；页面未配置 section 时归入无标题分组 */
export interface PrototypeMenuSection {
  title?: string
  items: PrototypeMenuItem[]
}

export interface PrototypeMenuGroup {
  title: string
  sections: PrototypeMenuSection[]
}

/**
 * 桌面演示左栏菜单：只从正式路由表生成，不硬编码第二份路径。
 * 三级结构：分组（group）→ 二级分组（section）→ 页面；
 * 组内与段内按 order 排序，所有独立路由都展示，空分组自动隐藏。
 */
export const PROTOTYPE_MENU: PrototypeMenuGroup[] = ROUTE_GROUPS.map((title) => {
  const sections: PrototypeMenuSection[] = []

  APP_ROUTES.filter((route) => route.group === title && !route.hidden)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    .forEach((route) => {
      const section = sections.find((item) => item.title === route.section)
      const entry = { label: route.label, path: route.menuPath ?? route.path }

      if (section) {
        section.items.push(entry)
      } else {
        sections.push({ title: route.section, items: [entry] })
      }
    })

  return { title, sections }
}).filter((group) => group.sections.length > 0)
