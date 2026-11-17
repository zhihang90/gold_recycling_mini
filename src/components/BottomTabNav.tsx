import { Link, useLocation } from 'react-router-dom'
import { TAB_PATHS, TAB_ROUTES } from '@/routes/routes.config'
import { cn } from '@/lib/utils'

/**
 * 底部 Tab 栏：首页 / 买金 / 订单 / 我的四个主入口。
 * 标签、图标、顺序全部来自 routes.config 的 tab 元数据，这里不再维护第二份列表。
 * 选中态只变色与图标形态（线性转面性），字号字重保持不变。
 * 高度 52 + 安全区：微信 iOS 有 Home 指示条，用 max() 保证不支持 env() 的内核仍有 6px。
 */
export function BottomTabNav() {
  const { pathname } = useLocation()

  if (!TAB_PATHS.includes(pathname)) return null

  return (
    <nav className="z-30 flex shrink-0 items-stretch border-t border-border-subtle bg-card px-1 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur">
      {TAB_ROUTES.map((route) => {
        const active = pathname === route.path
        const Icon = route.tab.icon
        return (
          <Link
            key={route.path}
            to={route.path}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-caption transition',
              active ? 'text-primary' : 'text-subtle-foreground',
            )}
          >
            <Icon size={20} fill={active ? 'currentColor' : 'none'} />
            <span className="whitespace-nowrap">{route.tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
