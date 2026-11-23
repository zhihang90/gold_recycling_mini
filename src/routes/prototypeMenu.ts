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
  title: '多状态弹层/页面',
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
 * 特殊入口映射：一条 manifest route 展开成多个侧栏入口。
 * 目前空着——购买订单 / 回收订单已分别挂到各自业务组，不再从公共模块统一展开。
 */
const MENU_ITEMS_BY_PATH: Record<string, PrototypeMenuItem[]> = {}

export const PROTOTYPE_MENU: PrototypeMenuGroup[] = ROUTE_GROUPS.map((title) => {
  if (title === SHEET_GROUP.title) {
    // 弹层状态不走 manifest，直接用硬编码的 SHEET_GROUP 独立成组
    return SHEET_GROUP
  }

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
}).filter((group) => group.sections.length > 0)
