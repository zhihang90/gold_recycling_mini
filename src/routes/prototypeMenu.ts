import { paths } from './paths'
import { APP_ROUTES, ROUTE_GROUPS } from './routes.config'
import { SHEET_STATES } from './sheetStates'

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
 * 末尾追加「弹层状态」分组，弹层不占路由，用查询参数直达。
 */

/** 弹层状态分组：逐条枚举可直达的弹层状态 */
const SHEET_GROUP: PrototypeMenuGroup = {
  title: '弹层状态',
  sections: SHEET_STATES.reduce<PrototypeMenuSection[]>((sections, item) => {
    const section = sections.find((entry) => entry.title === item.section)
    const entry = { label: item.label, path: item.menuPath }
    if (section) {
      section.items.push(entry)
    } else {
      sections.push({ title: item.section, items: [entry] })
    }
    return sections
  }, []),
}

/**
 * 同一路由在左栏拆成多条入口：按路由 path 覆盖默认条目。
 * 目前只用于订单列表——购买订单 / 回收订单是同一页的两个 Tab，用查询串区分。
 */
const MENU_ITEMS_BY_PATH: Record<string, PrototypeMenuItem[]> = {
  [paths.orders]: [
    { label: '购买订单', path: `${paths.orders}?type=sales` },
    { label: '回收订单', path: `${paths.orders}?type=recycle` },
  ],
}

export const PROTOTYPE_MENU: PrototypeMenuGroup[] = [
  ...ROUTE_GROUPS.map((title) => {
    const sections: PrototypeMenuSection[] = []

    APP_ROUTES.filter((route) => route.group === title && !route.hidden)
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
      .forEach((route) => {
        const section = sections.find((item) => item.title === route.section)
        const entries = MENU_ITEMS_BY_PATH[route.path] ?? [
          { label: route.label, path: route.menuPath ?? route.path },
        ]

        if (section) {
          section.items.push(...entries)
        } else {
          sections.push({ title: route.section, items: [...entries] })
        }
      })

    return { title, sections }
  }).filter((group) => group.sections.length > 0),
  SHEET_GROUP,
]
