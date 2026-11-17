import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ClipboardList, Home, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import {
  ROUTE_GROUPS,
  ROUTE_MANIFEST,
  type RouteGroup,
  type TabIconName,
} from './manifest'

export { ROUTE_GROUPS }
export type AppRouteGroup = RouteGroup

/** 底部 Tab 元数据：有 tab 的路由就是一级页 */
export interface AppTab {
  label: string
  icon: LucideIcon
  order: number
  /** 视觉强化：Tab 栏中间入口用凸起金色按钮 */
  emphasis?: boolean
}

export interface AppRoute {
  path: string
  /** 桌面左栏展示用的名称 */
  label: string
  /** 页面自身标题（浏览器标题用它）；缺省回落到 label */
  pageTitle?: string
  group: AppRouteGroup
  /** 左栏二级分组；缺省时页面直接挂在分组下 */
  section?: string
  component: ComponentType
  /** 左栏排序，越小越靠前；缺省排在组尾 */
  order?: number
  /** 左栏演示入口；带动态参数的页面填可用示例路径，缺省用 path */
  menuPath?: string
  /** 底部 Tab 元数据；同时决定 Layout 是否展示 Tab 栏 */
  tab?: AppTab
}

const TAB_ICONS: Record<TabIconName, LucideIcon> = {
  home: Home,
  bag: ShoppingBag,
  cart: ShoppingCart,
  orders: ClipboardList,
  user: User,
}

/**
 * 页面组件按约定自动解析，清单里不写 import：
 * 业务页 src/pages/Xxx.tsx 导出 XxxPage，组件库页导出 XxxGuidePage。
 */
const PAGE_MODULES = import.meta.glob('../pages/**/*.tsx', { eager: true }) as Record<
  string,
  Record<string, ComponentType>
>

function resolvePage(page: string): ComponentType {
  const module = PAGE_MODULES[`../pages/${page}.tsx`]
  const baseName = page.split('/').pop()
  const exportName = `${baseName}${page.includes('/') ? 'GuidePage' : 'Page'}`
  const component = module?.[exportName]

  if (!component) {
    throw new Error(`路由页缺失：src/pages/${page}.tsx 应导出 ${exportName}`)
  }
  return component
}

/** 正式页面路由表：新增页面只需在 manifest.ts 加一条，这里不需要改 */
export const APP_ROUTES: AppRoute[] = ROUTE_MANIFEST.map((route) => ({
  path: route.path,
  label: route.label,
  pageTitle: route.pageTitle,
  group: route.group,
  section: route.section,
  order: route.order,
  menuPath: route.menuPath,
  tab: route.tab
    ? {
        label: route.tab.label,
        icon: TAB_ICONS[route.tab.icon],
        order: route.tab.order,
        emphasis: route.tab.emphasis,
      }
    : undefined,
  component: resolvePage(route.page),
}))

/** 底部 Tab 路由：Tab 栏、Tab 路径判断都从这里派生，不再维护第二份列表 */
export const TAB_ROUTES = APP_ROUTES.filter(
  (route): route is AppRoute & { tab: AppTab } => route.tab !== undefined,
).sort((a, b) => a.tab.order - b.tab.order)

export const TAB_PATHS = TAB_ROUTES.map((route) => route.path)

export function isTabPath(pathname: string) {
  return TAB_PATHS.includes(pathname)
}
